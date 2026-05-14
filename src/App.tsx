import React, { useState, useEffect, Suspense, lazy } from "react";
import { Hero } from "./components/Hero";
import { QAForm } from "./components/QAForm";
import { Logo } from "./components/Logo";
import { AgentFeedback, analyzeProject } from "./lib/gemini";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion, AnimatePresence } from "motion/react";
import { Github, Globe, Terminal, Cpu, Loader2, LogIn, LogOut, History, User as UserIcon, ShieldCheck } from "lucide-react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { db, OperationType, handleFirestoreError } from "./lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { HistoryView, AuditRecord } from "./components/HistoryView";
import { cn } from "./lib/utils";

// Lazy loading for heavy views to improve initial load and performance
const TestingView = lazy(() => import("./components/TestingView").then(m => ({ default: m.TestingView })));
const FeedbackDisplay = lazy(() => import("./components/FeedbackDisplay").then(m => ({ default: m.FeedbackDisplay })));

export enum ViewState {
  HOME,
  LOGIN,
  INPUT,
  TESTING,
  REPORT,
  HISTORY
}

// Performance-optimized view loader
const ViewLoader = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-6">
    <Logo size="md" className="animate-pulse" />
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-3 text-brand-accent font-mono text-[11px] uppercase tracking-[0.4em] font-bold">
        <Loader2 size={16} className="animate-spin" />
        <span>Uplink Established</span>
      </div>
      <div className="w-48 h-px bg-white/5 relative overflow-hidden">
        <motion.div 
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 bg-brand-accent/50"
        />
      </div>
    </div>
  </div>
);

// Minimalistic yet powerful Login Gate
const LoginGate = ({ onLogin, onBack }: { onLogin: () => void, onBack: () => void }) => (
  <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
    <div className="max-w-md w-full bg-white/[0.02] border border-white/10 rounded-[48px] p-12 text-center space-y-8 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-accent to-transparent" />
      <Logo size="md" className="mx-auto" />
      <div className="space-y-4">
        <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Auth <span className="text-brand-accent italic">Required</span></h2>
        <p className="text-gray-400 text-sm leading-relaxed">To access the Clause Test Swarm and manage your audit archives, please establish a secure connection using your Google identity.</p>
      </div>
      
      <button 
        onClick={onLogin}
        className="w-full py-4 bg-white text-black font-bold rounded-2xl uppercase tracking-widest hover:bg-brand-accent hover:text-white transition-all flex items-center justify-center gap-3 group"
      >
        <LogIn size={20} />
        Initialize Uplink
      </button>
      
      <button 
        onClick={onBack}
        className="text-[10px] uppercase tracking-[0.3em] text-gray-600 hover:text-white transition-colors"
      >
        Cancel Protocol
      </button>

      <div className="pt-8 border-t border-white/5 grid grid-cols-3 gap-4">
        {[
          { label: "Secure", icon: <ShieldCheck size={12} /> },
          { label: "Cloud", icon: <Globe size={12} /> },
          { label: "Sync", icon: <Cpu size={12} /> }
        ].map(item => (
          <div key={item.label} className="flex flex-col items-center gap-1.5 grayscale opacity-50">
            <div className="text-white">{item.icon}</div>
            <span className="text-[8px] font-mono uppercase text-gray-500">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

function AppContent() {
  const { user, login, logout, loading: authLoading } = useAuth();
  const [view, setView] = useState<ViewState>(ViewState.HOME);
  const [results, setResults] = useState<AgentFeedback[] | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedAudit, setSelectedAudit] = useState<AuditRecord | null>(null);

  // Lifted Form State
  const [srsText, setSrsText] = useState("");
  const [reqText, setReqText] = useState("");
  const [codeText, setCodeText] = useState("");
  const [urlText, setUrlText] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; content: string }[]>([]);
  const [concurrentRequests, setConcurrentRequests] = useState(5);

  useEffect(() => {
    // Initial reveal for GSAP elements
    const revealElements = document.querySelectorAll(".gsap-reveal");
    revealElements.forEach((el) => {
      gsap.to(el, {
        scrollTrigger: {
          trigger: el,
          start: "top 90%",
          toggleActions: "play none none reverse",
        },
        opacity: 1,
        y: 0,
        duration: 1.5,
        ease: "expo.out",
      });
    });
  }, [view]);

  const handleLaunchInput = () => {
    if (!user) {
      setView(ViewState.LOGIN);
    } else {
      setView(ViewState.INPUT);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    // If user logs in while on the login screen, move them to input
    if (user && view === ViewState.LOGIN) {
      setView(ViewState.INPUT);
    }
  }, [user, view]);

  const handleRunAnalysis = async (srs: string, req: string, code: string, concurrentRequests: number) => {
    setIsAnalyzing(true);
    setView(ViewState.TESTING);
    window.scrollTo({ top: 0, behavior: "smooth" });
    
    try {
      const res = await analyzeProject(srs, req, code, concurrentRequests);
      setResults(res);
      
      // Save to Firestore if user is authenticated
      if (user) {
        const auditsPath = 'audits';
        try {
          await addDoc(collection(db, auditsPath), {
            userId: user.uid,
            timestamp: serverTimestamp(),
            srs,
            req,
            url: urlText,
            concurrency: concurrentRequests,
            results: res
          });
        } catch (dbError) {
          console.error("Failed to archive audit:", dbError);
          // We don't block the user if archiving fails, but we log it
        }
      }

      setView(ViewState.REPORT);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error("Analysis Failed:", error);
      alert("Swarm uplink failed. Check your configuration.");
      setView(ViewState.INPUT);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRestart = () => {
    // Clear everything for a fresh start from Home or Nav
    setResults(null);
    setSelectedAudit(null);
    setSrsText("");
    setReqText("");
    setCodeText("");
    setUrlText("");
    setUploadedFiles([]);
    setConcurrentRequests(5);
    setView(ViewState.HOME);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleRequestNewAnalysis = () => {
    // Navigate back to input with settings pre-filled
    setResults(null);
    setSelectedAudit(null);
    setView(ViewState.INPUT);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSelectHistoryAudit = (audit: AuditRecord) => {
    setSelectedAudit(audit);
    setResults(audit.results);
    setView(ViewState.REPORT);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-brand-ink selection:bg-brand-accent selection:text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 px-6 md:px-10 py-6 md:py-8 border-b border-white/5 bg-brand-ink/80 backdrop-blur-xl flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={handleRestart}>
          <Logo size="sm" className="group-hover:scale-110 transition-transform" />
          <span className="text-xl font-bold tracking-tighter text-white">CLAUSE<span className="text-brand-accent">TEST</span></span>
        </div>
        
        <div className="hidden lg:flex gap-10 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] items-center">
          <a href="#" onClick={handleRestart} className="hover:text-white transition-colors cursor-pointer">Introduction</a>
          <a href="#" className="hover:text-white transition-colors cursor-pointer">Security</a>
          {user && (
            <button 
              onClick={() => setView(ViewState.HISTORY)}
              className={cn(
                "flex items-center gap-2 hover:text-white transition-colors uppercase",
                view === ViewState.HISTORY ? "text-brand-accent" : ""
              )}
            >
              <History size={12} />
              History
            </button>
          )}
        </div>

        <div className="flex items-center gap-4">
          {!authLoading && (
            user ? (
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/10">
                  <UserIcon size={12} className="text-brand-accent" />
                  <span className="text-[9px] font-mono text-gray-400 truncate max-w-[100px]">{user.email}</span>
                </div>
                <button 
                  onClick={logout}
                  className="p-2 text-gray-500 hover:text-white transition-colors"
                  title="Logout"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <button 
                onClick={login}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-white hover:bg-white/10 transition-all"
              >
                <LogIn size={12} />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )
          )}

          <button 
            onClick={view === ViewState.HOME ? handleLaunchInput : handleRestart}
            className="px-6 py-2 bg-white text-black text-[10px] font-bold rounded-full uppercase tracking-widest hover:bg-gray-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]"
          >
            {view === ViewState.HOME ? "Launch Swarm" : "Reset Swarm"}
          </button>
        </div>
      </nav>

      <main className="pt-24">
        <AnimatePresence mode="wait">
          {view === ViewState.HOME && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6, ease: "circOut" }}
            >
              <Hero onStart={handleLaunchInput} />
              
              <div className="bg-[#0a0a0a] border-y border-white/5 py-4 overflow-hidden relative">
                <div className="flex whitespace-nowrap animate-marquee">
                  {[...Array(10)].map((_, i) => (
                    <span key={i} className="font-mono text-[9px] mx-10 tracking-[0.4em] flex items-center gap-4 uppercase text-gray-500">
                      <span className="text-brand-accent">◈</span> Swarm_Integrity: 99.99% <span className="text-brand-accent">◈</span> Nodes_Active: 128 <span className="text-brand-accent">◈</span> Latency: 14ms <span className="text-brand-accent">◈</span> 
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {view === ViewState.LOGIN && (
            <motion.div
              key="login"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              transition={{ duration: 0.5, ease: "circOut" }}
            >
              <LoginGate onLogin={login} onBack={handleRestart} />
            </motion.div>
          )}

          {view === ViewState.INPUT && (
            <motion.div
              key="input"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.6, ease: "circOut" }}
              className="px-4 py-20"
            >
              <div className="max-w-4xl mx-auto text-center mb-16 space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-brand-accent/10 border border-brand-accent/20">
                  <span className="text-[10px] font-mono text-brand-accent uppercase tracking-[0.2em]">Input_Config_v1.0</span>
                </div>
                <h2 className="text-5xl font-black text-white uppercase tracking-tighter">Configure <span className="text-brand-accent">Target</span></h2>
                <p className="text-gray-400 max-w-xl mx-auto">Upload artifacts and specify requirements for the multi-agent swarm to analyze.</p>
              </div>

              <QAForm 
                onStartAnalysis={handleRunAnalysis}
                isAnalyzing={isAnalyzing}
                srs={srsText}
                req={reqText}
                code={codeText}
                url={urlText}
                files={uploadedFiles}
                concurrency={concurrentRequests}
                setSrs={setSrsText}
                setReq={setReqText}
                setCode={setCodeText}
                setUrl={setUrlText}
                setFiles={setUploadedFiles}
                setConcurrency={setConcurrentRequests}
              />
            </motion.div>
          )}

          {view === ViewState.TESTING && (
            <motion.div
              key="testing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Suspense fallback={<ViewLoader />}>
                <TestingView />
              </Suspense>
            </motion.div>
          )}

          {view === ViewState.REPORT && results && (
            <motion.div
              key="report"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.8, ease: "circOut" }}
            >
              <Suspense fallback={<ViewLoader />}>
                <FeedbackDisplay 
                  results={results} 
                  onRestart={handleRestart} 
                  onNewAnalysis={handleRequestNewAnalysis} 
                  isHistoryItem={!!selectedAudit}
                />
              </Suspense>
            </motion.div>
          )}

          {view === ViewState.HISTORY && (
            <motion.div
              key="history"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.6, ease: "circOut" }}
            >
              <HistoryView onSelectAudit={handleSelectHistoryAudit} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="mt-20 pt-12 pb-20 border-t border-white/5 bg-brand-ink px-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-gray-800 rounded flex items-center justify-center text-[10px] font-bold">C</div>
            <span className="text-sm font-bold tracking-tighter text-white uppercase">Clause Test <span className="font-mono text-[9px] text-gray-600 ml-2">VER 2.4.0</span></span>
          </div>
          
          <div className="flex gap-10 text-[9px] font-mono uppercase text-gray-500 tracking-widest">
            <a href="#" className="hover:text-white transition-colors">Integrity</a>
            <a href="#" className="hover:text-white transition-colors">Nodes</a>
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-[10px] text-gray-600 font-mono italic">SCALABLE NODE.JS / EXPRESS ARCHITECTURE</span>
            <div className="w-2 h-2 bg-brand-accent rounded-full shadow-[0_0_10px_rgba(59,130,246,0.8)]"></div>
          </div>
        </div>
      </footer>

      {/* Persistent Grid Overlay */}
      <div className="fixed inset-0 pointer-events-none -z-20 opacity-[0.02]">
        <div className="w-full h-full bg-[linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
      `}} />
    </div>
  );
}

import React, { useState, useEffect, useMemo, memo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Loader2, Activity, Cpu, Shield, Zap, Layout, Settings, AlertTriangle, Network } from "lucide-react";
import { cn } from "../lib/utils";

interface TestingViewProps {
  onComplete?: () => void;
}

const Background = memo(() => (
  <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-brand-accent/10 rounded-full blur-[150px] animate-pulse will-change-[opacity,transform]" />
    <div className="w-full h-full bg-[radial-gradient(#ffffff03_1px,transparent_1px)] bg-[size:32px_32px]" />
  </div>
));

// Data stream particle that moves between two points
const DataParticle = memo(({ delay }: { delay: number }) => (
  <motion.div
    initial={{ opacity: 0, x: "10%", y: "50%" }}
    animate={{ 
      opacity: [0, 1, 1, 0],
      x: ["10%", "90%"],
      y: ["50%", `${40 + Math.random() * 20}%`]
    }}
    transition={{ 
      duration: 2, 
      delay, 
      repeat: Infinity, 
      ease: "easeInOut" 
    }}
    className="absolute w-1 h-1 bg-brand-accent rounded-full shadow-[0_0_10px_rgba(59,130,246,0.8)]"
  />
));

export function TestingView({ onComplete }: TestingViewProps) {
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>(["[SYS] Uplink to swarm established..."]);
  const [apiCalls, setApiCalls] = useState<{ id: string; method: string; path: string; status: number; duration: number }[]>([]);
  
  const steps = useMemo(() => [
    { label: "Planner Node active", sub: "Mapping application flows...", icon: <Settings size={24} /> },
    { label: "UI Visual Swarm", sub: "Analyzing layout consistency...", icon: <Layout size={24} /> },
    { label: "Functional Matrix", sub: "Executing test cases...", icon: <Activity size={24} /> },
    { label: "API Testing Agent", sub: "Load simulation in progress...", icon: <Cpu size={24} /> },
    { label: "Security Fortress", sub: "Infiltration testing enabled...", icon: <Shield size={24} /> },
    { label: "Stress Load Active", sub: "Identifying performance bottlenecks...", icon: <Zap size={24} /> },
    { label: "Bug Synthesizer", sub: "Generating enterprise reports...", icon: <AlertTriangle size={24} /> },
  ], []);

  useEffect(() => {
    const logInterval = setInterval(() => {
      const prefixes = ["[INFO]", "[TASK]", "[DATA]", "[SWARM]", "[DEBUG]"];
      const messages = [
        "Analyzing component hydration...",
        "Simulating concurrent user bursts...",
        "Validating JSON schema integrity...",
        "Checking CSP header security...",
        "Measuring TTI/LCP metrics...",
        "Scanning for DOM injection...",
        "Benchmarking cache hit ratios...",
      ];
      
      setLogs(prev => [
        `${prefixes[Math.floor(Math.random() * prefixes.length)]} ${messages[Math.floor(Math.random() * messages.length)]}`,
        ...prev.slice(0, 5)
      ]);
    }, 1500);

    const apiInterval = setInterval(() => {
      const methods = ["GET", "POST", "PUT", "DELETE", "PATCH"];
      const paths = ["/api/v1/auth/login", "/api/v1/users/me", "/api/v1/products/list", "/api/v1/orders/create", "/api/v1/payment/verify", "/api/v1/search?q=query", "/api/v1/upload/artifact"];
      const statuses = [200, 201, 204, 400, 401, 403, 404, 500];
      const isError = Math.random() < 0.15; // 15% error rate
      
      const newCall = {
        id: Math.random().toString(36).substr(2, 9),
        method: methods[Math.floor(Math.random() * methods.length)],
        path: paths[Math.floor(Math.random() * paths.length)],
        status: isError ? statuses[Math.floor(Math.random() * (statuses.length - 3)) + 3] : statuses[Math.floor(Math.random() * 3)],
        duration: Math.floor(Math.random() * 450) + 50
      };

      setApiCalls(prev => [newCall, ...prev.slice(0, 8)]);
    }, 800);

    const stepDuration = 3000; // 3 seconds per step
    const stepInterval = setInterval(() => {
      setStep(prev => {
        if (prev < steps.length - 1) return prev + 1;
        return prev;
      });
    }, stepDuration);

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev < 100) return prev + 0.5;
        return prev;
      });
    }, 100);

    return () => {
      clearInterval(logInterval);
      clearInterval(apiInterval);
      clearInterval(stepInterval);
      clearInterval(progressInterval);
    };
  }, [steps.length]);

  return (
    <div className="min-h-[90vh] flex flex-col items-center justify-center px-4 py-20 relative overflow-hidden bg-brand-ink">
      <Background />
      
      <div className="max-w-4xl w-full space-y-12 relative z-10">
        {/* Swarm Neural Visualizer */}
        <div className="relative h-64 bg-white/[0.02] border border-white/5 rounded-[40px] overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-b from-brand-accent/5 to-transparent" />
          
          {/* Node Connections */}
          <div className="absolute inset-0 flex items-center justify-between px-20">
            <div className="w-16 h-16 rounded-2xl bg-brand-accent/20 border border-brand-accent/40 flex items-center justify-center text-brand-accent animate-pulse">
              <Network size={32} />
            </div>
            
            <div className="flex-1 h-px bg-gradient-to-r from-brand-accent/20 via-brand-accent/50 to-brand-accent/20 relative mx-4">
              {[...Array(8)].map((_, i) => (
                <DataParticle key={i} delay={i * 0.4} />
              ))}
            </div>

            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/50 group-hover:text-brand-accent transition-colors">
              <Cpu size={32} />
            </div>
          </div>

          {/* Neural Activity Overlay */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-2/3 h-24 opacity-30">
            <div className="flex items-end justify-between h-full gap-1">
              {[...Array(40)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ height: [`${Math.random() * 100}%`, `${Math.random() * 100}%`] }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
                  className="flex-1 bg-brand-accent rounded-full min-w-[2px]"
                />
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="flex items-end justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-brand-accent/20 rounded-xl text-brand-accent animate-spin">
                  <Loader2 size={16} />
                </div>
                <h3 className="text-2xl font-black text-white uppercase tracking-tighter">
                  Analysis <span className="text-brand-accent">In Progress</span>
                </h3>
              </div>
              <p className="text-gray-500 font-mono text-[10px] uppercase tracking-[0.3em]">
                {steps[step].label} // {steps[step].sub}
              </p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-white font-mono">{Math.floor(progress)}%</span>
              <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Aggregate_Sync</p>
            </div>
          </div>

          {/* Enhanced Progress Bar */}
          <div className="relative h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-600 via-brand-accent to-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.5)]"
            />
            <motion.div
              animate={{ x: ["-100%", "100%"] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
            />
          </div>

          {/* Dynamic Console Logs & API Flow */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 bg-black/40 rounded-3xl p-6 border border-white/5 font-mono text-[10px] h-64 overflow-hidden relative group">
              <div className="absolute top-0 right-0 p-4 opacity-20"><Activity size={16} /></div>
              <h4 className="text-[9px] text-gray-500 uppercase tracking-[0.2em] mb-4 flex items-center justify-between">
                Live_API_Flow <span className="animate-pulse text-brand-accent">●</span>
              </h4>
              <div className="space-y-2">
                <AnimatePresence mode="popLayout">
                  {apiCalls.map((call) => (
                    <motion.div
                      key={call.id}
                      initial={{ opacity: 0, scale: 0.95, x: -10 }}
                      animate={{ opacity: 1, scale: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95, x: 10 }}
                      className="flex items-center justify-between p-2 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/5 transition-colors group/call"
                    >
                      <div className="flex items-center gap-3">
                        <span className={cn(
                          "px-1.5 py-0.5 rounded text-[8px] font-bold",
                          call.method === "GET" ? "text-blue-400 bg-blue-400/10" :
                          call.method === "POST" ? "text-emerald-400 bg-emerald-400/10" :
                          "text-purple-400 bg-purple-400/10"
                        )}>
                          {call.method}
                        </span>
                        <span className="text-gray-400 truncate max-w-[100px]">{call.path}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-gray-600 font-bold">{call.duration}ms</span>
                        <span className={cn(
                          "font-bold",
                          call.status < 400 ? "text-emerald-500" : "text-red-500"
                        )}>
                          {call.status}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            <div className="lg:col-span-1 bg-black/40 rounded-3xl p-6 border border-white/5 font-mono text-[10px] h-64 overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-20"><Cpu size={16} /></div>
              <h4 className="text-[9px] text-gray-500 uppercase tracking-[0.2em] mb-4">Neural_Diagnostics</h4>
              <div className="space-y-1">
                <AnimatePresence mode="popLayout">
                  {logs.map((log, i) => (
                    <motion.div
                      key={log + i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1 - i * 0.15, x: 0 }}
                      className={cn(
                        "flex gap-4 p-1 rounded transition-colors",
                        log.includes("[SYS]") ? "text-brand-accent font-bold" : "text-gray-500"
                      )}
                    >
                      <span className="opacity-30">[{new Date().toLocaleTimeString('en-US', { hour12: false })}]</span>
                      <span className="truncate">{log}</span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            <div className="lg:col-span-1 flex flex-col justify-between p-6 bg-white/[0.02] border border-white/5 rounded-3xl h-64">
              <h4 className="text-[9px] text-gray-500 uppercase tracking-[0.2em]">Swarm_Sequence</h4>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-brand-accent">
                  {steps[step].icon}
                </div>
                <div>
                  <h4 className="text-white font-bold uppercase tracking-tight">{steps[step].label}</h4>
                  <p className="text-gray-500 text-[10px] font-mono">{steps[step].sub}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex gap-2">
                  {[...Array(steps.length)].map((_, i) => (
                    <div 
                      key={i} 
                      className={cn(
                        "h-1 flex-1 rounded-full transition-all duration-500",
                        i < step ? "bg-brand-accent" : i === step ? "bg-white/40 animate-pulse" : "bg-white/5"
                      )} 
                    />
                  ))}
                </div>
                <div className="flex justify-between items-center text-[8px] font-mono text-gray-600 uppercase tracking-widest">
                  <span>Step {step + 1} of {steps.length}</span>
                  <span className="text-brand-accent">Processing Node...</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

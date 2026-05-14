import React, { useState, useRef } from "react";
import { AgentFeedback } from "../lib/gemini";
import ReactMarkdown from "react-markdown";
import { 
  Shield, Layout, Settings, AlertTriangle, Lightbulb, Zap, 
  Activity, Cpu, CheckCircle2, Info, ChevronDown, ChevronUp, 
  Terminal, Download, Copy, RefreshCw, Layers, Loader2 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface FeedbackDisplayProps {
  results: AgentFeedback[];
  onRestart?: () => void;
  onNewAnalysis?: () => void;
  isHistoryItem?: boolean;
}

const getMetricIcon = (category: string) => {
  const cat = (category || "").toLowerCase();
  const label = cat.charAt(0).toUpperCase() + cat.slice(1);
  const iconProps = { size: 14, title: label };

  switch (cat) {
    case "security": return <Shield {...iconProps} className="text-red-400 cursor-help" />;
    case "performance": return <Zap {...iconProps} className="text-yellow-400 cursor-help" />;
    case "usability": return <Layout {...iconProps} className="text-blue-400 cursor-help" />;
    case "logic": return <Activity {...iconProps} className="text-emerald-400 cursor-help" />;
    default: return <Cpu {...iconProps} className="text-gray-400 cursor-help" />;
  }
};

const TrafficMonitor = React.memo(({ feedback, errors }: { feedback: string, errors: string[] }) => {
  // Simple heuristic to find content between triple backticks or simulated payload blocks
  const extractCode = (str: string) => {
    const match = str.match(/```(?:\w+)?\s*([\s\S]*?)```/);
    return match ? match[1].trim() : null;
  };

  const payload = extractCode((feedback || "")) || extractCode((Array.isArray(errors) ? errors : []).join('\n'));

  if (!payload) return null;

  // Try to detect status codes for color coding
  const getStatusColor = (text: string) => {
    if (text.match(/"status":\s*(4|5)\d\d/i) || text.match(/HTTP\/1\.1\s+(4|5)\d\d/i)) return "text-red-400";
    if (text.match(/"status":\s*2\d\d/i) || text.match(/HTTP\/1\.1\s+2\d\d/i)) return "text-emerald-400";
    if (text.match(/"status":\s*3\d\d/i) || text.match(/HTTP\/1\.1\s+3\d\d/i)) return "text-yellow-400";
    return "text-emerald-400/90";
  };

  const statusColor = getStatusColor(payload);

  return (
    <div className="mt-12 will-change-transform transform-gpu">
      <h4 className="text-[10px] font-mono text-emerald-500/70 border-b border-emerald-500/10 pb-2 mb-6 uppercase tracking-[0.2em] flex items-center justify-between">
        Live Traffic Monitor <Activity size={12} className="animate-pulse" />
      </h4>
      <div className="bg-black/60 rounded-3xl p-6 font-mono text-[10px] border border-white/5 shadow-2xl relative overflow-hidden group/monitor">
        <div className="flex items-center gap-2 mb-4 opacity-40">
          <div className="w-2 h-2 rounded-full bg-red-500/50" />
          <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
          <div className="w-2 h-2 rounded-full bg-green-500/50" />
          <div className="ml-4 h-px flex-1 bg-white/10" />
          <span className="text-[8px] uppercase tracking-tighter">debug_v4.2</span>
        </div>
        <pre className={cn("leading-relaxed overflow-x-auto selection:bg-emerald-500/20", statusColor)}>
          <code>{payload}</code>
        </pre>
        <div className="absolute top-2 right-4 text-[7px] text-emerald-500/30 uppercase font-bold group-hover/monitor:opacity-100 opacity-0 transition-opacity">
          {statusColor.includes("red") ? "Warning: Critical Error Detected" : "Encrypted_AES256"}
        </div>
      </div>
    </div>
  );
});

const ErrorCard = ({ error, index, isAPI = false }: { error: string, index: number, isAPI?: boolean }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Detection for request/response payloads
  const hasPayload = error.includes("Request Payload") || error.includes("Server Response") || error.includes("```");
  
  const extractPayloads = (text: string) => {
    const payloads: { label: string; content: string }[] = [];
    
    // Check for Request Payload
    const reqMatch = text.match(/Request Payload:?\s*([\s\S]*?)(?=Server Response|Feedback|$|```)/i);
    if (reqMatch) payloads.push({ label: "Request Payload", content: reqMatch[1].trim().replace(/```json|```/g, '') });
    
    // Check for Server Response
    const resMatch = text.match(/Server Response:?\s*([\s\S]*?)(?=Feedback|$|```)/i);
    if (resMatch) payloads.push({ label: "Server Response", content: resMatch[1].trim().replace(/```json|```/g, '') });

    // Fallback for general code blocks if no specific markers found
    if (payloads.length === 0) {
      const codeMatches = text.matchAll(/```(?:\w+)?\s*([\s\S]*?)```/g);
      for (const match of codeMatches) {
        payloads.push({ label: "Debug Artifact", content: match[1].trim() });
      }
    }
    
    return payloads;
  };

  const safeError = error || "";
  const payloads = hasPayload ? extractPayloads(safeError) : [];
  // Strip payloads from the main text display
  const mainText = safeError.split(/Request Payload|Server Response|```/i)[0].trim();

  return (
    <div className={cn(
      "group/error flex flex-col p-5 md:p-6 border transition-all duration-300 relative overflow-hidden will-change-transform transform-gpu",
      isAPI 
        ? "bg-red-500/[0.12] border-red-500/40 rounded-2xl md:rounded-3xl shadow-[0_0_30px_rgba(239,68,68,0.1)] backdrop-blur-sm" 
        : "bg-red-500/[0.05] border-red-500/20 rounded-xl md:rounded-2xl hover:bg-red-500/[0.08]"
    )}>
      {isAPI && (
        <div className="absolute top-0 right-0 p-2 bg-red-500/20 rounded-bl-xl">
          <span className="text-[8px] font-mono text-red-500 uppercase font-black tracking-tighter">API_CRITICAL</span>
        </div>
      )}
      <div className="flex gap-4">
        <div className={cn(
          "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5",
          isAPI ? "bg-red-500/30 text-white shadow-lg" : "bg-red-500/10 text-red-500/60"
        )}>
          {isAPI ? <Zap size={14} /> : <AlertTriangle size={14} />}
        </div>
        <div className="flex-1">
          <div className={cn(
            "text-xs leading-relaxed block mb-2 prose prose-invert prose-sm max-w-none",
            isAPI ? "text-white font-medium prose-p:text-white" : "text-gray-300 prose-p:text-gray-300"
          )}>
            <ReactMarkdown>{mainText}</ReactMarkdown>
          </div>
          
          {hasPayload && (
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-2 text-[9px] font-mono text-brand-accent uppercase tracking-widest hover:text-white transition-colors mt-2"
            >
              {isOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              {isOpen ? "Hide Diagnostics" : "View Diagnostics"}
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isOpen && payloads.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="mt-4 pt-4 border-t border-red-500/10 space-y-4">
              {payloads.map((p, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex items-center gap-2 text-[8px] font-mono text-gray-500 uppercase tracking-[0.2em]">
                    <Terminal size={10} />
                    {p.label}
                  </div>
                  <pre className="bg-black/60 rounded-xl p-4 font-mono text-[10px] text-emerald-400/80 overflow-x-auto border border-white/5 selection:bg-emerald-500/20">
                    <code>{p.content}</code>
                  </pre>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export function FeedbackDisplay({ results, onRestart, onNewAnalysis, isHistoryItem }: FeedbackDisplayProps) {
  const [activeAgent, setActiveAgent] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    executive: true,
    responsibilities: false,
    capabilities: false,
    traffic: true,
    flags: true,
    optimizations: false
  });

  const reportRef = useRef<HTMLDivElement>(null);

  const toggleSection = (id: string) => {
    setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopyReport = async () => {
    const reportHeader = `# AUDIT REPORT: ${reportId}\nGenerated at: ${reportDate}\n\n`;
    
    const reportText = results.map(agent => {
      const metricsText = (Array.isArray(agent.metrics) ? agent.metrics : [])
        .map(m => `- ${m.label}: ${m.value} (${m.category})`)
        .join("\n");

      const responsibilitiesText = (Array.isArray(agent.responsibilities) ? agent.responsibilities : [])
        .map(r => `- ${r}`)
        .join("\n");

      const errorsText = (Array.isArray(agent.errors) ? agent.errors : [])
        .map(e => `!!! ${e}`)
        .join("\n");

      const suggestionsText = (Array.isArray(agent.suggestions) ? agent.suggestions : [])
        .map(s => `+ ${s}`)
        .join("\n");

      return `## AGENT: ${agent.agentName}\n**ROLE:** ${agent.role}\n**SCORE:** ${agent.rating}/10\n\n### EXECUTIVE FEEDBACK\n${agent.feedback}\n\n${metricsText ? `### METRICS\n${metricsText}\n\n` : ""}${responsibilitiesText ? `### RESPONSIBILITIES\n${responsibilitiesText}\n\n` : ""}${errorsText ? `### CRITICAL FLAGS\n${errorsText}\n\n` : ""}${suggestionsText ? `### OPTIMIZATIONS\n${suggestionsText}\n\n` : ""}---\n`;
    }).join("\n");
    
    await navigator.clipboard.writeText(reportHeader + reportText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleExportPDF = async () => {
    if (!reportRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(reportRef.current, {
        backgroundColor: "#0a0a0c",
        scale: 2,
        useCORS: true,
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`audit-report-${reportId}.pdf`);
    } catch (err) {
      console.error("PDF Export failed:", err);
      alert("Failed to export PDF. Try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const reportId = React.useMemo(() => `REP-${Math.random().toString(36).substr(2, 9).toUpperCase()}`, []);
  const reportDate = new Date().toLocaleDateString("en-US", { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  if (!results || results.length === 0) {
    return (
      <section className="py-20 px-4 max-w-7xl mx-auto min-h-screen">
        <div className="flex flex-col lg:flex-row justify-between items-end gap-8 mb-20">
          <div className="space-y-4">
            <h2 className="text-4xl font-black text-white uppercase tracking-tighter">No Audit Data <span className="text-brand-accent">Found</span></h2>
            <p className="text-gray-500 max-w-md">The swarm was unable to retrieve the requested analysis. This can happen if the uplink was interrupted.</p>
            <button onClick={onRestart} className="px-6 py-2 bg-white text-black text-[10px] font-bold rounded-full uppercase tracking-widest hover:bg-gray-200 transition-all">Go to Launchpad</button>
          </div>
        </div>
      </section>
    );
  }

  const agent = results[activeAgent];

  if (!agent) {
    return (
      <section className="py-20 px-4 max-w-7xl mx-auto min-h-screen">
        <div className="flex flex-col items-center justify-center space-y-6">
          <AlertTriangle size={48} className="text-yellow-500" />
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Node Desync</h2>
          <p className="text-gray-500">The selected agent node is currently unreachable.</p>
          <button onClick={() => setActiveAgent(0)} className="px-6 py-2 bg-brand-accent text-white text-[10px] font-bold rounded-full uppercase tracking-widest hover:bg-brand-accent/80 transition-all">Reset Sync</button>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 px-4 max-w-7xl mx-auto" id="report-view">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 mb-20">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-[10px] font-mono text-brand-accent px-2 py-0.5 rounded border border-brand-accent/30 bg-brand-accent/5 uppercase tracking-[0.2em] animate-pulse">Live Report</span>
            <span className="text-[10px] font-mono text-gray-600 uppercase tracking-widest">{reportId}</span>
          </div>
          <h2 className="text-6xl md:text-8xl font-black text-white uppercase tracking-tighter leading-none mb-8">
            Analysis <br /> <span className="text-brand-accent italic font-serif lowercase not-italic">Summary</span>
          </h2>
          
          <div className="flex flex-wrap gap-4">
            <button 
              onClick={handleCopyReport}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-mono text-gray-400 uppercase tracking-widest hover:text-white transition-all"
            >
              <Copy size={12} className={isCopied ? "text-emerald-400" : ""} />
              {isCopied ? "Copied!" : "Copy Report"}
            </button>
            <button 
              onClick={handleExportPDF}
              disabled={isExporting}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-mono text-gray-400 uppercase tracking-widest hover:text-white transition-all disabled:opacity-50"
            >
              {isExporting ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
              Export to PDF
            </button>
            <button 
              onClick={onNewAnalysis}
              className="flex items-center gap-2 px-4 py-2 bg-brand-accent/20 border border-brand-accent/30 rounded-full text-[10px] font-mono text-brand-accent uppercase tracking-widest hover:bg-brand-accent/30 transition-all font-bold"
            >
              <RefreshCw size={12} />
              Request New Analysis
            </button>
          </div>
        </div>
        
        <div className="text-right">
          <p className="text-[10px] font-mono text-gray-600 uppercase tracking-widest mb-2 font-bold">Generated At</p>
          <p className="text-sm font-mono text-white uppercase tracking-tighter">{reportDate}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12" ref={reportRef}>
        {/* Navigation Sidebar */}
        <div className="lg:col-span-3 space-y-3">
          <p className="text-[9px] font-mono text-gray-500 uppercase tracking-[0.3em] mb-4 lg:mb-6 pl-4 font-bold">Agent Nodes</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2 lg:gap-2">
            {results.map((agentItem, idx) => (
              <button
                key={agentItem.agentName || `agent-${idx}`}
                onClick={() => setActiveAgent(idx)}
                className={cn(
                  "w-full text-left p-4 lg:p-6 rounded-2xl transition-all duration-500 group relative overflow-hidden transform-gpu will-change-transform",
                  activeAgent === idx 
                    ? "bg-brand-accent text-white shadow-[0_0_40px_rgba(59,130,246,0.2)] scale-[1.02]" 
                    : "bg-white/[0.02] border border-white/5 text-gray-500 hover:bg-white/5 hover:scale-[1.01]"
                )}
              >
                <div className="relative z-10 flex flex-col gap-1">
                  <span className="text-[8px] font-mono uppercase tracking-widest opacity-60">Unit {idx + 1}</span>
                  <span className="text-xs lg:text-sm font-bold uppercase tracking-tight truncate">{agentItem.agentName || `Agent ${idx + 1}`}</span>
                </div>
                {activeAgent === idx && (
                  <motion.div 
                    layoutId="agent-glow"
                    className="absolute inset-0 bg-gradient-to-tr from-brand-accent to-blue-400 opacity-50"
                  />
                )}
              </button>
            ))}
          </div>

          <div className="pt-8 lg:pt-12">
            <button 
              onClick={onRestart}
              className="w-full py-4 border border-white/10 rounded-2xl text-[10px] font-mono text-gray-500 uppercase tracking-widest hover:border-white/30 hover:text-white transition-all font-bold min-h-[44px] flex items-center justify-center"
            >
              Restart Swarm
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-9">
          <AnimatePresence mode="wait">
            <motion.div
              layout
              key={activeAgent}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="bg-white/[0.02] border border-white/10 rounded-[32px] md:rounded-[40px] p-6 md:p-16 relative overflow-hidden transform-gpu will-change-transform"
            >
              <div className="relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-brand-ink border border-white/10 rounded-3xl flex items-center justify-center text-brand-accent shrink-0">
                      {(agent.agentName || "").includes("Planner") && <Settings size={32} />}
                      {(agent.agentName || "").includes("UI") && <Layout size={32} />}
                      {(agent.agentName || "").includes("Functional") && <Activity size={32} />}
                      {(agent.agentName || "").includes("API") && <Cpu size={32} />}
                      {(agent.agentName || "").includes("Security") && <Shield size={32} />}
                      {(agent.agentName || "").includes("Performance") && <Zap size={32} />}
                      {(agent.agentName || "").includes("Bug") && <AlertTriangle size={32} />}
                    </div>
                    <div>
                      <h3 className="text-3xl font-black text-white uppercase tracking-tight mb-1">{agent.agentName || "Active Agent"}</h3>
                      <p className="text-xs font-mono text-gray-500 uppercase tracking-widest">{agent.role}</p>
                    </div>
                  </div>

                  <div className="w-full md:w-80 space-y-6">
                    <div>
                      <div className="flex justify-between items-end mb-2">
                        <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Node Integrity</span>
                        <span className="text-[10px] font-mono text-brand-accent">{agent.rating}/10</span>
                      </div>
                      <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(agent.rating || 0) * 10}%` }}
                          transition={{ duration: 1, delay: 0.3 }}
                          className="h-full bg-gradient-to-r from-brand-accent to-blue-400"
                        />
                      </div>
                    </div>

                    {/* Node Telemetry / Metrics Grouped */}
                    <div className="space-y-4">
                      {["performance", "security", "usability", "logic"].map(cat => {
                        const catMetrics = Array.isArray(agent.metrics) ? agent.metrics.filter(m => (m.category || "").toLowerCase() === cat) : [];
                        if (!catMetrics || catMetrics.length === 0) return null;
                        
                        return (
                          <div key={cat} className="space-y-2">
                            <div className="flex items-center gap-2 px-1">
                              {getMetricIcon(cat)}
                              <span className="text-[8px] font-mono text-gray-600 uppercase tracking-widest">{cat} metrics</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              {catMetrics.map((metric, mIdx) => (
                                <div 
                                  key={mIdx} 
                                  title={metric.description}
                                  className="bg-white/[0.02] border border-white/5 rounded-xl p-3 transition-all hover:border-white/10 group/metric cursor-help"
                                >
                                  <div className="text-[8px] font-mono text-gray-500 uppercase tracking-tighter truncate opacity-70 mb-0.5">{metric.label}</div>
                                  <div className="text-xs font-bold text-white tracking-tight">{metric.value}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16">
                  <div className="space-y-6 md:space-y-12">
                    {/* Executive Feedback */}
                    <motion.div layout className="bg-white/[0.01] border border-white/5 rounded-[24px] md:rounded-[32px] p-6 md:p-8 transform-gpu will-change-transform">
                      <button 
                        onClick={() => toggleSection("executive")}
                        className="w-full flex items-center justify-between group min-h-[44px]"
                      >
                        <h4 className="text-[10px] font-mono text-gray-500 uppercase tracking-[0.2em] group-hover:text-white transition-colors">
                          Executive Feedback
                        </h4>
                        <ChevronDown size={14} className={cn("text-gray-600 transition-transform duration-500", expandedSections.executive && "rotate-180")} />
                      </button>
                      
                      <AnimatePresence initial={false}>
                        {expandedSections.executive && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                            className="overflow-hidden"
                          >
                            <div className="pt-6 prose prose-invert prose-sm max-w-none prose-p:text-gray-400 prose-p:font-light leading-relaxed">
                              <ReactMarkdown>{agent.feedback}</ReactMarkdown>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>

                    {/* Agent Responsibilities */}
                    <motion.div layout className="bg-white/[0.01] border border-white/5 rounded-[24px] md:rounded-[32px] p-6 md:p-8 transform-gpu will-change-transform">
                      <button 
                        onClick={() => toggleSection("responsibilities")}
                        className="w-full flex items-center justify-between group min-h-[44px]"
                      >
                        <h4 className="text-[10px] font-mono text-gray-500 uppercase tracking-[0.2em] group-hover:text-white transition-colors">
                          Agent Responsibilities
                        </h4>
                        <ChevronDown size={14} className={cn("text-gray-600 transition-transform duration-500", expandedSections.responsibilities && "rotate-180")} />
                      </button>
                      
                      <AnimatePresence initial={false}>
                        {expandedSections.responsibilities && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                            className="overflow-hidden"
                          >
                            <div className="pt-6 space-y-3">
                              {(Array.isArray(agent.responsibilities) ? agent.responsibilities : []).map((resp, rIdx) => (
                                <motion.div 
                                  initial={{ x: -10, opacity: 0 }}
                                  animate={{ x: 0, opacity: 1 }}
                                  transition={{ delay: rIdx * 0.05 }}
                                  key={rIdx} 
                                  className="flex items-start gap-4"
                                >
                                  <CheckCircle2 size={14} className="text-brand-accent mt-0.5 shrink-0" />
                                  <span className="text-xs text-gray-400 leading-relaxed font-light">{resp}</span>
                                </motion.div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>

                    {/* Agent Capabilities */}
                    <motion.div layout className="bg-white/[0.01] border border-white/5 rounded-[24px] md:rounded-[32px] p-6 md:p-8 transform-gpu will-change-transform">
                      <button 
                        onClick={() => toggleSection("capabilities")}
                        className="w-full flex items-center justify-between group min-h-[44px]"
                      >
                        <h4 className="text-[10px] font-mono text-gray-500 uppercase tracking-[0.2em] group-hover:text-white transition-colors">
                          Agent Capabilities
                        </h4>
                        <ChevronDown size={14} className={cn("text-gray-600 transition-transform duration-500", expandedSections.capabilities && "rotate-180")} />
                      </button>
                      
                      <AnimatePresence initial={false}>
                        {expandedSections.capabilities && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                            className="overflow-hidden"
                          >
                            <div className="pt-6 flex flex-wrap gap-2">
                              { (agent.agentName || "").includes("Planner") && ["Task Breakdown", "Edge Discovery", "Req. Tracing"].map(cap => (
                                <span key={cap} className="text-[9px] font-mono text-gray-400 bg-white/5 px-2 py-1 rounded border border-white/5">{cap}</span>
                              ))}
                              { (agent.agentName || "").includes("UI") && ["Heuristic Analysis", "Flow Auditing", "Contrast Validation"].map(cap => (
                                <span key={cap} className="text-[9px] font-mono text-gray-400 bg-white/5 px-2 py-1 rounded border border-white/5">{cap}</span>
                              ))}
                              { (agent.agentName || "").includes("Security") && ["Pattern Matching", "Leak Detection", "Quality Guard"].map(cap => (
                                <span key={cap} className="text-[9px] font-mono text-gray-400 bg-white/5 px-2 py-1 rounded border border-white/5">{cap}</span>
                              ))}
                              { (agent.agentName || "").includes("Functional") && ["Logic Mapping", "State Control", "Flow Validation"].map(cap => (
                                <span key={cap} className="text-[9px] font-mono text-gray-400 bg-white/5 px-2 py-1 rounded border border-white/5">{cap}</span>
                              ))}
                              { (agent.agentName || "").includes("API") && ["Endpoint Mapping", "Schema Validation", "Latency Benchmarking"].map(cap => (
                                <span key={cap} className="text-[9px] font-mono text-gray-400 bg-white/5 px-2 py-1 rounded border border-white/5">{cap}</span>
                              ))}
                              { (agent.agentName || "").includes("Performance") && ["Load Balancing", "Stress Testing", "Resource Analysis"].map(cap => (
                                <span key={cap} className="text-[9px] font-mono text-gray-400 bg-white/5 px-2 py-1 rounded border border-white/5">{cap}</span>
                              ))}
                              { (agent.agentName || "").includes("Bug") && ["Severity Scoring", "Root Cause Analysis", "Fix Validation"].map(cap => (
                                <span key={cap} className="text-[9px] font-mono text-gray-400 bg-white/5 px-2 py-1 rounded border border-white/5">{cap}</span>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>

                    { (agent.agentName || "").includes("API") && expandedSections.traffic && (
                      <TrafficMonitor feedback={agent.feedback || ""} errors={agent.errors || []} />
                    )}
                  </div>

                  <div className="space-y-6 md:space-y-12">
                    {/* Critical Flags */}
                    <motion.div layout className="bg-red-500/[0.02] border border-red-500/10 rounded-[24px] md:rounded-[32px] p-6 md:p-8 transform-gpu will-change-transform">
                      <button 
                        onClick={() => toggleSection("flags")}
                        className="w-full flex items-center justify-between group min-h-[44px]"
                      >
                        <h4 className="text-[10px] font-mono text-red-500/70 uppercase tracking-[0.2em] flex items-center gap-2 group-hover:text-red-400 transition-colors">
                          Critical Flags <AlertTriangle size={12} />
                        </h4>
                        <ChevronDown size={14} className={cn("text-red-900/40 transition-transform duration-500", expandedSections.flags && "rotate-180")} />
                      </button>
                      
                      <AnimatePresence initial={false}>
                        {expandedSections.flags && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                            className="overflow-hidden"
                          >
                            <div className="pt-6 space-y-4">
                              {(Array.isArray(agent.errors) ? agent.errors : []).map((error, eIdx) => (
                                <ErrorCard key={eIdx} error={error} index={eIdx} isAPI={(agent.agentName || "").includes("API")} />
                              ))}
                              {(Array.isArray(agent.errors) && agent.errors.length === 0) && (
                                <div className="text-center py-10 opacity-20 font-mono text-[9px] uppercase tracking-widest italic">Zero anomalies reported_</div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>

                    {/* Optimization Suggestions */}
                    <motion.div layout className="bg-brand-accent/[0.02] border border-brand-accent/10 rounded-[24px] md:rounded-[32px] p-6 md:p-8 transform-gpu will-change-transform">
                      <button 
                        onClick={() => toggleSection("optimizations")}
                        className="w-full flex items-center justify-between group min-h-[44px]"
                      >
                        <h4 className="text-[10px] font-mono text-brand-accent/70 uppercase tracking-[0.2em] flex items-center gap-2 group-hover:text-brand-accent transition-colors">
                          Optimization Suggestions <Lightbulb size={12} />
                        </h4>
                        <ChevronDown size={14} className={cn("text-brand-accent/30 transition-transform duration-500", expandedSections.optimizations && "rotate-180")} />
                      </button>
                      
                      <AnimatePresence initial={false}>
                        {expandedSections.optimizations && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                            className="overflow-hidden"
                          >
                            <div className="pt-6 space-y-4">
                              {(Array.isArray(agent.suggestions) ? agent.suggestions : []).map((suggestion, sIdx) => (
                                <div key={sIdx} className="flex gap-4 p-4 md:p-5 bg-brand-accent/[0.05] border border-brand-accent/10 rounded-2xl group/opt hover:bg-brand-accent/[0.08] transition-all duration-300">
                                  <span className="text-[10px] font-black font-mono text-brand-accent/40 mt-0.5">{String(sIdx + 1).padStart(2, '0')}.</span>
                                  <span className="text-xs text-gray-300 leading-relaxed font-light">{suggestion}</span>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </div>
                </div>
              </div>

              {/* Decorative Scanline */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-brand-accent/[0.02] to-transparent h-[50%] w-full animate-[scan_6s_linear_infinite]" />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(200%); }
        }
      `}} />
    </section>
  );
}

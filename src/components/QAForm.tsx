import React, { useState, useEffect } from "react";
import gsap from "gsap";
import Editor from "react-simple-code-editor";
import Prism from "prismjs";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-css";
import { useDropzone } from "react-dropzone";
import { FileUp, Trash2, CheckCircle, Loader2, Globe } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "../lib/utils";

interface QAFormProps {
  onStartAnalysis: (srs: string, req: string, code: string, concurrentRequests: number) => void;
  isAnalyzing: boolean;
  srs: string;
  req: string;
  code: string;
  url: string;
  files: { name: string; content: string }[];
  concurrency: number;
  setSrs: (val: string) => void;
  setReq: (val: string) => void;
  setCode: (val: string) => void;
  setUrl: (val: string) => void;
  setFiles: (val: { name: string; content: string }[]) => void;
  setConcurrency: (val: number) => void;
}

export function QAForm({ 
  onStartAnalysis, 
  isAnalyzing,
  srs,
  req,
  code,
  url,
  files,
  concurrency,
  setSrs,
  setReq,
  setCode,
  setUrl,
  setFiles,
  setConcurrency
}: QAFormProps) {
  const [urlError, setUrlError] = useState("");

  const loadSample = (type: "ecommerce" | "saas") => {
    if (type === "ecommerce") {
      setSrs("E-commerce Storefront API V2. Full-stack application with user authentication, product catalog, cart management, and Stripe integration.");
      setReq("1. Users must be able to log in securely.\n2. Product search must be performant under load.\n3. Checkout should handle concurrent stock verification.\n4. API must return correct HTTP status codes for failures.");
      setCode(`// Product Controller\nexport const getProducts = async (req, res) => {\n  try {\n    const products = await db.products.findMany();\n    res.status(200).json(products);\n  } catch (err) {\n    res.status(500).json({ error: "Failed to fetch products" });\n  }\n}\n\n// Auth Middleware\nexport const authenticate = (req, res, next) => {\n  const token = req.headers.authorization;\n  if (!token) return res.status(401).send("Unauthorized");\n  next();\n}`);
      setUrl("https://sample-ecommerce-api.demo");
    } else {
      setSrs("Cloud SaaS Analytics Dashboard. Real-time data visualization platform for enterprise monitoring.");
      setReq("1. Real-time metrics updates via WebSockets.\n2. Role-based access control (RBAC).\n3. Export functionality for PDF reports.\n4. High availability and low latency data fetching.");
      setCode(`// Dashboard Layout\nimport { LineChart, ResponsiveContainer } from 'recharts';\n\nexport const MetricsGrid = ({ data }) => (\n  <div className="grid grid-cols-3 gap-6">\n    {data.map(m => (\n      <Card key={m.id} title={m.label} value={m.value} />\n    ))}\n  </div>\n)`);
      setUrl("https://sample-saas-dashboard.demo");
    }
    setUrlError("");
  };

  const validateUrl = (urlVal: string) => {
    if (!urlVal) {
      setUrlError("");
      return;
    }
    // Basic URL pattern
    const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/;
    if (!urlPattern.test(urlVal)) {
      setUrlError("Invalid URL format");
    } else {
      setUrlError("");
    }
  };

  const onDrop = async (acceptedFiles: File[]) => {
    const newFiles = await Promise.all(
      acceptedFiles.map(async (file) => {
        const content = await file.text();
        return { name: file.name, content };
      })
    );
    setFiles([...files, ...newFiles]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
  });

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!srs.trim() && !url.trim()) {
      alert("Please provide either a Target URL or an SRS description.");
      return;
    }

    if (url && urlError) {
      alert("Please fix the URL format error before proceeding.");
      return;
    }

    const hasCode = code.trim().length > 0;
    const hasFiles = files.length > 0;

    // Prepare content for analysis
    const analysisContent = `
${url ? `TARGET URL: ${url}\n` : ""}
${hasCode ? `PASTED CODE:\n${code}\n\n` : ""}
${hasFiles ? `UPLOADED FILES:\n${files.map((f) => `FILE: ${f.name}\n${f.content}`).join("\n\n")}` : ""}
    `.trim();

    onStartAnalysis(srs, req, analysisContent, concurrency);
  };

  const handleFocus = (target: string) => {
    gsap.to(target, {
      scale: 1.005,
      borderColor: "#3b82f6",
      duration: 0.4,
      ease: "power2.out",
    });
  };

  const handleBlur = (target: string) => {
    gsap.to(target, {
      scale: 1,
      borderColor: "rgba(255,255,255,0.1)",
      duration: 0.4,
      ease: "power2.inOut",
    });
  };

  return (
    <section className="py-20 lg:py-32 px-4 max-w-5xl mx-auto overflow-x-hidden" id="test-section">
      <div className="mb-12 lg:mb-16">
        <span className="text-[10px] lg:text-xs font-mono text-brand-accent tracking-[0.3em] uppercase block mb-4">Phase // Intake</span>
        <h2 className="text-4xl sm:text-5xl lg:text-7xl mb-4 italic font-serif">Provision <span className="not-italic font-sans font-black uppercase text-brand-accent">Agents</span></h2>
        <div className="flex flex-col md:flex-row items-center gap-6">
          <p className="text-gray-400 max-w-lg font-light text-sm lg:text-base">Fill in your specifications to deploy the autonomous swarm.</p>
          <div className="flex flex-wrap gap-3">
            <button 
              type="button"
              onClick={() => loadSample("ecommerce")}
              className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] lg:text-[10px] uppercase tracking-widest text-gray-400 hover:text-white hover:bg-white/10 transition-all font-mono min-h-[40px]"
            >
              Demo: E-commerce
            </button>
            <button 
              type="button"
              onClick={() => loadSample("saas")}
              className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] lg:text-[10px] uppercase tracking-widest text-gray-400 hover:text-white hover:bg-white/10 transition-all font-mono min-h-[40px]"
            >
              Demo: SaaS
            </button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-12 lg:space-y-16">
        {/* STEP 1: AUDIT TARGETS */}
        <div className="p-[1px] bg-gradient-to-b from-white/10 to-transparent rounded-3xl group transition-all duration-500">
          <div className="bg-[#0a0a0a] rounded-[23px] p-6 lg:p-8 space-y-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
              <div>
                <span className="text-[10px] font-mono text-brand-accent block mb-1">01 // TARGET_DEFINITION</span>
                <h3 className="text-lg lg:text-xl font-bold uppercase tracking-tight">Core Audit Targets</h3>
              </div>
              <p className="text-[9px] text-gray-500 font-mono uppercase max-w-xs text-right hidden xl:block leading-relaxed">
                Define the entry points for the analysis. Provide a live URL for real-time auditing or document the core system structure.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
              {/* URL INPUT */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Live Deployment URL</label>
                  <Globe size={14} className="text-brand-accent/40" />
                </div>
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-accent/20 to-blue-500/20 rounded-2xl blur opacity-20 group-focus-within:opacity-100 transition-opacity" />
                  <div className="relative">
                    <input
                      type="url"
                      id="url-input"
                      className="w-full p-4 md:p-5 bg-white/5 border border-white/10 rounded-2xl font-mono text-sm text-brand-accent focus:outline-none transition-all placeholder:text-gray-700 min-h-[56px]"
                      placeholder="https://your-app.com"
                      value={url}
                      onChange={(e) => {
                        setUrl(e.target.value);
                        validateUrl(e.target.value);
                      }}
                      onFocus={() => handleFocus("#url-input")}
                      onBlur={() => handleBlur("#url-input")}
                    />
                  </div>
                </div>
                <div className="flex justify-between items-center px-1 md:px-2">
                  {urlError ? (
                    <p className="text-[10px] text-red-500 font-mono uppercase font-bold animate-pulse">{urlError}</p>
                  ) : (
                    <p className="text-[9px] text-gray-600 font-mono uppercase">Agents will audit this specific endpoint</p>
                  )}
                </div>
              </div>

              {/* SRS INPUT */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">System Overview (SRS)</label>
                  <span className={cn(
                    "text-[10px] font-mono uppercase px-2 py-0.5 rounded",
                    srs.length > 5000 ? "bg-red-500/10 text-red-400" : "bg-white/5 text-gray-600"
                  )}>
                    {srs.length} / 5000
                  </span>
                </div>
                <textarea
                  required={!url}
                  id="srs-input"
                  className="w-full h-40 p-4 md:p-5 bg-white/5 border border-white/10 rounded-2xl font-sans text-sm text-gray-300 focus:outline-none transition-all resize-none placeholder:text-gray-700 leading-relaxed min-h-[160px]"
                  placeholder="Describe the application features, architecture, or paste your SRS content here..."
                  value={srs}
                  onChange={(e) => setSrs(e.target.value)}
                  onFocus={() => handleFocus("#srs-input")}
                  onBlur={() => handleBlur("#srs-input")}
                />
              </div>
            </div>
          </div>
        </div>

        {/* STEP 2: CONTEXT & PARAMETERS */}
        <div className="p-[1px] bg-gradient-to-b from-white/10 to-transparent rounded-3xl group transition-all duration-500">
          <div className="bg-[#0a0a0a] rounded-[23px] p-8 space-y-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
              <div>
                <span className="text-[10px] font-mono text-brand-accent block mb-1">02 // AUDIT_PARAMETERS</span>
                <h3 className="text-xl font-bold uppercase tracking-tight">Intelligence Context</h3>
              </div>
              <p className="text-[9px] text-gray-500 font-mono uppercase max-w-xs text-right hidden md:block leading-relaxed">
                Refine the swarm's focus by providing specific user goals and defining service capacity limits.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* REQUIREMENTS */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">User Requirements</label>
                  <span className={cn(
                    "text-[10px] font-mono uppercase px-2 py-0.5 rounded",
                    req.length > 2000 ? "bg-red-500/10 text-red-400" : "bg-white/5 text-gray-600"
                  )}>
                    {req.length} / 2000
                  </span>
                </div>
                <textarea
                  required={!url}
                  id="req-input"
                  className="w-full h-32 p-5 bg-white/5 border border-white/10 rounded-2xl font-sans text-sm text-gray-300 focus:outline-none transition-all resize-none placeholder:text-gray-700 leading-relaxed"
                  placeholder="What specific user flows should be tested? (e.g., 'User logs in and exports PDF')"
                  value={req}
                  onChange={(e) => setReq(e.target.value)}
                  onFocus={() => handleFocus("#req-input")}
                  onBlur={() => handleBlur("#req-input")}
                />
              </div>

              {/* CONCURRENCY SLIDER */}
              <div className="space-y-6 flex flex-col justify-center">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <label className="text-[10px] font-mono text-gray-500 uppercase tracking-widest block mb-1">API Load Simulation</label>
                    <p className="text-[11px] text-gray-400 font-light">Sets stress-test intensity for API probes</p>
                  </div>
                  <span className="text-lg font-black font-mono text-brand-accent bg-brand-accent/10 px-4 py-2 rounded-xl">
                    {concurrency} <span className="text-xs font-normal opacity-50">NODE_TPS</span>
                  </span>
                </div>
                <div className="relative py-4">
                  <input 
                    type="range" 
                    min="1" 
                    max="50" 
                    step="1"
                    value={concurrency}
                    onChange={(e) => setConcurrency(parseInt(e.target.value))}
                    className="w-full accent-brand-accent bg-white/5 h-2 rounded-full cursor-pointer appearance-none border border-white/10"
                  />
                  <div className="flex justify-between mt-2 text-[8px] font-mono text-gray-600 uppercase tracking-widest">
                    <span>Low Load</span>
                    <span>Mid Intensity</span>
                    <span>Stress Level</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* STEP 3: SOURCE ARTIFACTS */}
        <div className="p-[1px] bg-gradient-to-b from-white/10 to-transparent rounded-3xl group transition-all duration-500">
          <div className="bg-[#0a0a0a] rounded-[23px] p-8 space-y-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
              <div>
                <span className="text-[10px] font-mono text-brand-accent block mb-1">03 // SOURCE_ARTIFACTS</span>
                <h3 className="text-xl font-bold uppercase tracking-tight">Technical Deep-Dive</h3>
              </div>
              <p className="text-[9px] text-gray-500 font-mono uppercase max-w-xs text-right hidden md:block leading-relaxed">
                Provide code snippets or upload directory structures to enable full-stack vulnerability scanning and logic checks.
              </p>
            </div>

            <div className="space-y-8">
              {/* CODE EDITOR */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Pasted Source Snippet <span className="lowercase font-light opacity-50">(optional)</span></label>
                  <div className="flex gap-2">
                    <span className="text-[8px] bg-white/5 text-gray-500 px-2 py-0.5 rounded font-mono">JS</span>
                    <span className="text-[8px] bg-white/5 text-gray-500 px-2 py-0.5 rounded font-mono">TS</span>
                    <span className="text-[8px] bg-white/5 text-gray-500 px-2 py-0.5 rounded font-mono">TSX</span>
                  </div>
                </div>
                <div 
                  id="code-editor-container"
                  className="w-full h-80 bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden transition-all font-mono text-[11px]"
                  onFocus={() => handleFocus("#code-editor-container")}
                  onBlur={() => handleBlur("#code-editor-container")}
                >
                  <div className="h-full overflow-auto bg-transparent custom-scrollbar flex relative">
                    <div className="sticky left-0 top-0 h-fit min-h-full bg-white/[0.01] border-r border-white/5 px-4 py-6 text-gray-600 text-right select-none min-w-[3.5rem] z-10 font-mono">
                      {code.split("\n").map((_, i) => (
                        <div key={i} className="leading-5">{i + 1}</div>
                      ))}
                    </div>
                    <div className="flex-1 min-w-0 py-2">
                      <Editor
                        value={code}
                        onValueChange={(code) => setCode(code)}
                        highlight={(code) => Prism.highlight(code, Prism.languages.typescript || Prism.languages.javascript, "typescript")}
                        padding={24}
                        placeholder="// Paste critical logic here for the Security and Logic agents to analyze..."
                        className="min-h-full font-mono text-[11px] text-gray-400 focus:outline-none"
                        textareaId="code-input"
                        style={{
                          fontFamily: 'var(--font-mono)',
                          minHeight: "100%",
                          lineHeight: "1.25rem"
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* FILE UPLOAD GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                <div className="space-y-4">
                  <label className="text-[10px] font-mono text-gray-500 uppercase tracking-widest block">Project Artifacts <span className="lowercase font-light opacity-50">(zip / src)</span></label>
                  <div
                    {...getRootProps()}
                    className={cn(
                      "border-2 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center transition-all cursor-pointer h-48 group/drop",
                      isDragActive ? "border-brand-accent bg-brand-accent/5" : "border-white/5 hover:border-brand-accent/30 hover:bg-white/[0.02]"
                    )}
                  >
                    <input {...getInputProps()} />
                    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-4 group-hover/drop:scale-110 group-hover/drop:bg-brand-accent/10 transition-all">
                      <FileUp size={28} className={cn("transition-colors", isDragActive ? "text-brand-accent" : "text-gray-500")} />
                    </div>
                    <p className="text-xs text-gray-400 font-light text-center leading-relaxed">
                      {isDragActive ? (
                        <span className="text-brand-accent font-bold">Release to queue artifacts</span>
                      ) : (
                        <>Drag & drop source files or <span className="text-white border-b border-white/20">browse local</span></>
                      )}
                    </p>
                  </div>
                </div>

                {/* FILE QUEUE */}
                <div className="space-y-4 min-h-[12rem] flex flex-col">
                  <label className="text-[10px] font-mono text-gray-500 uppercase tracking-widest block">Deployment Queue</label>
                  <div className="flex-1 bg-white/[0.01] border border-white/5 rounded-3xl p-6 overflow-y-auto max-h-[12rem] custom-scrollbar">
                    {files.length > 0 ? (
                      <div className="grid grid-cols-1 gap-2">
                        {files.map((file, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-xl group/file hover:border-brand-accent/30 transition-all">
                            <div className="flex items-center gap-3 overflow-hidden">
                              <div className="w-2 h-2 rounded-full bg-brand-accent animate-pulse shrink-0" />
                              <span className="text-[11px] font-mono text-gray-300 truncate">{file.name}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeFile(idx)}
                              className="text-gray-600 hover:text-red-400 transition-colors p-1"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center opacity-30">
                        <span className="text-[10px] font-mono uppercase tracking-widest">Queue Empty</span>
                        <p className="text-[9px] mt-2 font-mono">0_FILES_ENQUEUED</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isAnalyzing}
          className={cn(
            "w-full py-7 bg-brand-accent text-white font-black rounded-full uppercase tracking-[0.3em] text-xs flex items-center justify-center gap-4 transition-all relative overflow-hidden group shadow-2xl",
            isAnalyzing ? "opacity-50 cursor-not-allowed" : "hover:scale-[1.01] hover:shadow-brand-accent/30"
          )}
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              <span className="animate-pulse">SWARM_UPLINKING::SECURE_CHANNEL</span>
            </>
          ) : (
            <>
              Commence Systematic Sweep
              <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-white/20 transition-all">
                <CheckCircle size={18} />
              </div>
            </>
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
        </button>
      </form>
    </section>
  );
}

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight, ShieldCheck, Zap, Cpu, Layout, Settings, Hexagon, Activity, Binary, CheckCircle2 } from "lucide-react";
import { cn } from "../lib/utils";
import { motion } from "motion/react";
import { Logo } from "./Logo";

gsap.registerPlugin(ScrollTrigger);

interface HeroProps {
  onStart?: () => void;
}

export function Hero({ onStart }: HeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Intro animation for the main title with masking
      const tl = gsap.timeline();
      
      tl.to(".char-inner", {
        y: "0%",
        duration: 1.2,
        stagger: 0.03,
        ease: "circ.out",
      })
      .from(".hero-sub", {
        y: 40,
        opacity: 0,
        duration: 1.5,
        ease: "power4.out",
      }, "-=0.8")
      .from(".logo-container", {
        scale: 0.5,
        opacity: 0,
        duration: 2,
        ease: "elastic.out(1, 0.5)"
      }, "-=1");

      // Scroll parallax for decorative elements
      gsap.utils.toArray<HTMLElement>(".scroll-parallax").forEach((el) => {
        const speed = parseFloat(el.dataset.speed || "1");
        gsap.to(el, {
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top top",
            end: "bottom top",
            scrub: 1,
          },
          y: -200 * speed,
          rotate: speed * 10,
          ease: "none"
        });
      });

      // 3D Logo Scroll Rotation
      gsap.to(".logo-container", {
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1,
        },
        rotateY: 180,
        rotateX: 45,
        scale: 1.2,
        y: 100,
        ease: "none"
      });

      // Background pulse
      gsap.to(".bg-glow-indigo", {
        scale: 1.2,
        duration: 8,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const renderTitle = (text: string, className: string) => (
    <div className={cn("flex flex-wrap items-center justify-center xl:justify-start overflow-hidden", className)}>
      {text.split("").map((char, i) => (
        <span key={i} className="text-mask inline-block">
          <span className="char-inner inline-block whitespace-pre transform-gpu will-change-transform">
            {char}
          </span>
        </span>
      ))}
    </div>
  );

  return (
    <section ref={containerRef} className="relative min-h-screen flex flex-col items-center justify-center pt-24 overflow-hidden px-4">
      {/* Decorative Blur Clusters */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-glow-indigo rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-[20%] right-[-10%] w-[40vw] h-[40vw] bg-glow-blue rounded-full blur-[100px] -z-10" />

        <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-12 gap-12 items-center z-10">
          <div className="lg:col-span-1 xl:col-span-5 text-center lg:text-left">
            <h1 ref={titleRef} className="text-7xl md:text-8xl xl:text-9xl mb-8 leading-[0.85] tracking-tight">
              {renderTitle("Clause", "font-serif italic text-white")}
              {renderTitle("Test", "font-sans font-black uppercase text-brand-accent")}
            </h1>

            <div className="hero-sub max-w-xl mx-auto lg:mx-0 space-y-8">
              <p className="text-lg md:text-xl font-light leading-relaxed text-gray-400">
                Deploy an enterprise-grade autonomous testing swarm to benchmark your architecture, security, and performance in real-time.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <button 
                  onClick={onStart}
                  className="px-8 py-4 bg-white text-black font-bold rounded-full uppercase tracking-tighter hover:bg-brand-accent hover:text-white transition-all flex items-center gap-2 group transform-gpu"
                >
                  Launch Swarm <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="px-8 py-4 border border-white/20 text-white font-bold rounded-full uppercase tracking-tighter hover:bg-white/5 transition-all">
                  Documentation
                </button>
              </div>
            </div>
          </div>

          {/* Swarm Visualization (Right Side) */}
          <div className="lg:col-span-1 xl:col-span-7 flex flex-col items-center justify-center relative min-h-[500px]">
            <Logo size="lg" className="logo-container" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mt-12 relative z-10 max-w-2xl px-4">
              {[
                { role: "UX Auditor", status: "Active", icon: <Layout size={14} /> },
                { role: "Regression Swarm", status: "Active", icon: <Settings size={14} /> },
                { role: "Architect Bot", status: "Processing", icon: <ShieldCheck size={14} /> },
                { role: "Detection engine", status: "Live", icon: <Zap size={14} />, highlighted: true },
              ].map((agent, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "p-4 rounded-2xl backdrop-blur-md border border-white/10 flex items-center justify-between transition-transform hover:scale-105 duration-500",
                    agent.highlighted ? "bg-brand-accent text-white" : "bg-white/5"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", agent.highlighted ? "bg-white/20" : "bg-white/5")}>
                      {agent.icon}
                    </div>
                    <h3 className={cn("text-[10px] font-bold uppercase tracking-widest", agent.highlighted ? "text-white" : "text-gray-300")}>{agent.role}</h3>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className={cn("w-1 h-1 rounded-full", agent.status === "Active" || agent.status === "Live" ? "bg-green-500 animate-pulse" : "bg-amber-500")} />
                    <span className={cn("text-[8px] font-bold uppercase tracking-widest", agent.status === "Active" || agent.status === "Live" ? "text-green-500" : "text-amber-500")}>
                      {agent.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      {/* Floating Elements / Swarm Visualization */}
      <div
        data-speed="1.2"
        className="scroll-parallax absolute top-[15%] left-[5%] p-6 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl hidden lg:block"
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-[10px] font-mono text-green-500 font-bold">ALPHA_UNIT</span>
        </div>
        <p className="font-mono text-[10px] text-gray-400">STATUS: CRAWLING_DOM</p>
      </div>

      <div
        data-speed="0.7"
        className="scroll-parallax absolute bottom-[15%] right-[8%] p-6 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl hidden lg:block"
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 bg-brand-accent rounded-full animate-pulse" />
          <span className="text-[10px] font-mono text-brand-accent font-bold">DELTA_SWARM</span>
        </div>
        <p className="font-mono text-[10px] text-gray-400">STATUS: REQ_COVERAGE</p>
      </div>

      {/* Methodology / About Section */}
      <section id="methodology" className="w-full max-w-7xl mt-40 pb-40 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="gsap-reveal space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full">
              <div className="w-2 h-2 rounded-full bg-brand-accent animate-pulse" />
              <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Protocol v4.0</span>
            </div>
            <h2 className="text-5xl font-black text-white uppercase tracking-tighter leading-none">
              Autonomous <br />
              <span className="text-brand-accent italic">Quality Assurance</span>
            </h2>
            <p className="text-gray-400 text-lg font-light leading-relaxed">
              CLAUSETEST isn't just an automation tool—it's a decentralized swarm of AI agents trained on millions of MNC-grade pull requests. By simulating real human behavior alongside formal verification, we catch the bugs that static analysis misses.
            </p>
            <div className="grid grid-cols-2 gap-8 pt-8">
              <div>
                <h4 className="text-white font-bold mb-2 flex items-center gap-2">
                  <ShieldCheck size={16} className="text-brand-accent" />
                  99.8% Coverage
                </h4>
                <p className="text-gray-500 text-sm">Our swarm explores every interactive element and logic path. We use state-space exploration to detect orphaned pages and broken logic gates.</p>
              </div>
              <div>
                <h4 className="text-white font-bold mb-2 flex items-center gap-2">
                  <Cpu size={16} className="text-brand-accent" />
                  60s Onboarding
                </h4>
                <p className="text-gray-500 text-sm">Zero-config infrastructure. Upload your artifacts and our Planner Agent instantly synthesizes a custom testing plan based on your SRS.</p>
              </div>
            </div>
          </div>
          
          <div className="gsap-reveal relative">
            <div className="absolute inset-0 bg-brand-accent/20 blur-[120px] rounded-full scale-110" />
            <div className="relative bg-[#0a0a0a] border border-white/10 rounded-[60px] p-12 overflow-hidden shadow-2xl">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-accent to-transparent" />
              <div className="space-y-6">
                <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                  <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-brand-accent">
                    <Hexagon size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">System Architecture</p>
                    <p className="text-white font-bold uppercase tracking-tight">The Neural Mesh</p>
                  </div>
                </div>
                {[
                  "Hierarchical Task Decomposition",
                  "Cross-Agent Feedback Loops",
                  "Real-time Logic Verification",
                  "Automated Severity Scoring"
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-4 group">
                    <div className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                      <CheckCircle2 size={12} />
                    </div>
                    <span className="text-gray-400 font-mono text-[11px] group-hover:text-white transition-colors">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Deep Dive Section */}
      <section className="w-full max-w-7xl mt-40 pb-40 px-4">
        <div className="gsap-reveal text-center mb-24 space-y-4">
          <h2 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter">
            Intelligence <span className="text-brand-accent italic">Matrix</span>
          </h2>
          <p className="text-gray-500 font-mono text-[10px] uppercase tracking-[0.4em]">The 7 Specialized QA Neural Nodes</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {[
            {
              role: "Planner Agent",
              specialty: "Architectural Mapping",
              desc: "The brain of the swarm. It deconstructs your application into logical flows (Auth, Checkout, State Persistence) before any data is sent to the workers.",
              tools: ["Flowcharting", "Req. Analysis"],
              icon: <Settings className="text-blue-400" />
            },
            {
              role: "UI Testing Agent",
              specialty: "Visual Perception",
              desc: "Utilizes Computer Vision and OCR to detect micro-pixel misalignments, color contrast violations, and layout breakages across all viewports.",
              tools: ["Playwright", "Computer Vision"],
              icon: <Layout className="text-brand-accent" />
            },
            {
              role: "Functional Agent",
              specialty: "Interaction Logic",
              desc: "Simulates complex human behaviors. It handles negative testing, form validation, and clicks deep into hidden UI paths to find edge-case crashes.",
              tools: ["Selenium", "User Simulation"],
              icon: <Activity className="text-emerald-400" />
            },
            {
              role: "API Testing Agent",
              specialty: "Protocol Integrity",
              desc: "Validates all REST/GraphQL endpoints for status code parity, JSON schema strictness, and handles your specified concurrent load simulations.",
              tools: ["Schema Analysis", "Load Sim"],
              icon: <Cpu className="text-purple-400" />
            },
            {
              role: "Security Agent",
              specialty: "Fortress Defense",
              desc: "Conducts automated infiltration tests. Screens for broken auth tokens, injection vulnerabilities, and insecure API headers.",
              tools: ["Vulnerability Scan", "Auth Audit"],
              icon: <ShieldCheck className="text-red-400" />
            },
            {
              role: "Performance Agent",
              specialty: "Stress Dynamics",
              desc: "Identifies memory leaks and slow API responses. It benchmarks your app's performance under the heavy load specified in your config.",
              tools: ["Bottleneck ID", "Resource Monitoring"],
              icon: <Zap className="text-yellow-400" />
            },
            {
              role: "Bug Reporter",
              specialty: "Synthesis & Severity",
              desc: "The final node. It aggregates all telemetry from the swarm into a clean, reproducible report with severity scoring and fix suggestions.",
              tools: ["Severity Scoring", "PDF Synthesis"],
              icon: <Binary className="text-gray-400" />
            }
          ].map((agent, i) => (
            <div key={i} className="gsap-reveal bg-white/[0.01] border border-white/5 p-10 rounded-[48px] hover:bg-white/[0.03] transition-all duration-500 group">
              <div className="flex items-start justify-between mb-8">
                <div className="p-4 bg-white/5 rounded-3xl group-hover:scale-110 transition-transform duration-500">
                  {agent.icon}
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono text-gray-600 block">SPECIALTY</span>
                  <span className="text-xs font-bold text-white uppercase tracking-widest">{agent.specialty}</span>
                </div>
              </div>
              <h3 className="text-3xl font-black text-white uppercase tracking-tight mb-4 group-hover:text-brand-accent transition-colors">{agent.role}</h3>
              <p className="text-gray-400 text-sm font-light leading-relaxed mb-8">{agent.desc}</p>
              <div className="flex flex-wrap gap-2">
                {agent.tools.map(tool => (
                  <span key={tool} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[9px] font-mono text-gray-500 uppercase">{tool}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="w-full max-w-6xl mt-40 grid grid-cols-1 md:grid-cols-3 gap-12 pb-32">
        <div className="md:col-span-3 text-center mb-10">
          <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Operational <span className="text-brand-accent italic">Blueprint</span></h2>
          <p className="text-gray-500 font-mono text-[10px] uppercase tracking-[0.3em] mt-4">Sequence of automated intelligence</p>
        </div>
        {[
          { 
            id: "01", 
            title: "Artifact Injection", 
            desc: "Upload SRS documents, Figma exports, or live URLs. Our Planner Agent decodes the structural DNA of your application.", 
            icon: <Zap size={24} />,
            color: "from-blue-500/20 to-transparent"
          },
          { 
            id: "02", 
            title: "Swarm Synthesis", 
            desc: "7 specialized agents execute deep audits across UI, API, Logic, and Security vectors using neural pattern matching.", 
            icon: <ShieldCheck size={24} />,
            color: "from-brand-accent/20 to-transparent"
          },
          { 
            id: "03", 
            title: "Audit Finalization", 
            desc: "Receive an enterprise-grade QA report with reproducible steps, severity metrics, and AI-suggested code fixes.", 
            icon: <Cpu size={24} />,
            color: "from-purple-500/20 to-transparent"
          },
        ].map((item, idx) => (
          <div key={item.id} className="gsap-reveal group relative bg-white/[0.02] border border-white/10 p-10 rounded-[40px] hover:border-brand-accent/40 transition-all duration-500 overflow-hidden">
            <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-10">
                <span className="text-[10px] font-mono text-brand-accent border border-brand-accent/20 bg-brand-accent/5 px-3 py-1 rounded-full">{item.id} // PHASE</span>
                <div className="text-gray-400 group-hover:text-white group-hover:scale-110 transition-all duration-500 bg-white/5 p-3 rounded-2xl">{item.icon}</div>
              </div>
              <h3 className="text-2xl font-bold text-white uppercase tracking-tight mb-4">{item.title}</h3>
              <p className="text-gray-400 text-sm font-light leading-relaxed group-hover:text-gray-300 transition-colors">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

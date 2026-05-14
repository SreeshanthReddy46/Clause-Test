import React from "react";
import { motion } from "motion/react";
import { Hexagon } from "lucide-react";
import { cn } from "../lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function Logo({ className, size = "md" }: LogoProps) {
  const innerSize = size === "sm" ? 16 : size === "md" ? 40 : 100;
  const containerSize = size === "sm" ? "w-8 h-8" : size === "md" ? "w-20 h-20" : "w-80 h-80";

  return (
    <div className={cn("relative perspective-2000 preserve-3d group/logo will-change-transform", containerSize, className)}>
      <motion.div 
        animate={{ rotateY: 360 }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="w-full h-full relative preserve-3d transform-gpu"
      >
        {/* Outer Glow Ring */}
        <div className="absolute inset-0 border border-brand-accent/20 rounded-full blur-xl scale-125 opacity-20 group-hover/logo:opacity-50 transition-opacity" />

        {/* Floating Geometry Layer 1 */}
        <div className={cn(
          "absolute inset-0 border-2 border-brand-accent/30 rounded-full flex items-center justify-center transform translate-z-[40px] bg-brand-accent/5 backdrop-blur-xl shadow-[0_0_50px_rgba(59,130,246,0.3)]",
          size === "sm" ? "translate-z-[10px] border" : "translate-z-[60px]"
        )}>
          <Hexagon size={innerSize} className="text-brand-accent animate-pulse fill-brand-accent/10" strokeWidth={1} />
        </div>
        
        {/* Hex Grid Background */}
        <div className={cn(
          "absolute inset-0 transform translate-z-[-20px] scale-90 opacity-20",
          size === "sm" && "hidden"
        )}>
          <div className="w-full h-full border border-white/10 rounded-full rotate-45 animate-[spin_60s_linear_infinite]" />
        </div>

        {/* Structural Rings */}
        <div className={cn(
          "absolute inset-0 border-[0.5px] border-white/10 rounded-full transform translate-z-[-40px] rotate-12",
          size === "sm" ? "translate-z-[-10px]" : "translate-z-[-80px]"
        )} />
        
        {/* Orbital Particles (lg only) */}
        {size === "lg" && [...Array(3)].map((_, i) => (
          <div 
            key={i} 
            className="absolute inset-[-40px] border-[0.5px] border-brand-accent/30 rounded-full"
            style={{ 
              transform: `rotateX(${30 + (i * 60)}deg) rotateY(${i * 45}deg)`,
              animation: `logo-spin ${15 + (i * 5)}s linear infinite`
            }}
          />
        ))}

        {/* Central Core Signal */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-white rounded-full blur-[2px] animate-ping" />
      </motion.div>

      <style dangerouslySetInnerHTML={{ __html: `
        .perspective-2000 { perspective: 2000px; }
        .preserve-3d { transform-style: preserve-3d; }
        
        @keyframes logo-spin {
          from { transform: rotateX(var(--rx, 45deg)) rotateY(0deg); }
          to { transform: rotateX(var(--rx, 45deg)) rotateY(360deg); }
        }
      `}} />
    </div>
  );
}

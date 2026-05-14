import React, { useEffect, useState } from 'react';
import { db, OperationType, handleFirestoreError } from '../lib/firebase';
import { collection, query, where, orderBy, getDocs, Timestamp } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { AgentFeedback } from '../lib/gemini';
import { motion } from 'motion/react';
import { Calendar, Clock, Target, Activity, ChevronRight, Search, Filter } from 'lucide-react';
import { cn } from '../lib/utils';

export interface AuditRecord {
  id: string;
  userId: string;
  timestamp: Timestamp;
  srs: string;
  req: string;
  url: string;
  concurrency: number;
  results: AgentFeedback[];
}

interface HistoryViewProps {
  onSelectAudit: (audit: AuditRecord) => void;
}

export function HistoryView({ onSelectAudit }: HistoryViewProps) {
  const { user } = useAuth();
  const [audits, setAudits] = useState<AuditRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function fetchAudits() {
      if (!user) return;
      
      const auditsPath = 'audits';
      try {
        const q = query(
          collection(db, auditsPath),
          where('userId', '==', user.uid),
          orderBy('timestamp', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const fetchedAudits: AuditRecord[] = [];
        querySnapshot.forEach((doc) => {
          fetchedAudits.push({ id: doc.id, ...doc.data() } as AuditRecord);
        });
        setAudits(fetchedAudits);
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, auditsPath);
      } finally {
        setLoading(false);
      }
    }
    fetchAudits();
  }, [user]);

  const filteredAudits = audits.filter(a => 
    a.url.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.srs.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-brand-accent/20 border-t-brand-accent rounded-full animate-spin" />
        <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Retrieving Secure Archives...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-20 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-16">
        <div>
          <span className="text-[10px] font-mono text-brand-accent tracking-[0.3em] uppercase block mb-4">Archives // History</span>
          <h2 className="text-6xl md:text-8xl font-black text-white uppercase tracking-tighter leading-none">
            Audit <br /> <span className="text-brand-accent italic font-serif lowercase not-italic">Ledger</span>
          </h2>
        </div>
        
        <div className="w-full md:w-auto relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 transition-colors group-focus-within:text-brand-accent" size={16} />
          <input 
            type="text" 
            placeholder="Search archives..."
            className="w-full md:w-80 pl-12 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-sm text-gray-300 focus:outline-none focus:border-brand-accent/50 transition-all placeholder:text-gray-700"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {filteredAudits.length === 0 ? (
        <div className="text-center py-40 border border-white/5 bg-white/[0.01] rounded-[40px]">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
            <Filter size={24} className="text-gray-600" />
          </div>
          <h3 className="text-xl font-bold text-white uppercase mb-2">No Records Found</h3>
          <p className="text-gray-500 font-light text-sm">Your secure audit history will appear here once you complete a test.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredAudits.map((audit, idx) => (
            <motion.button
              key={audit.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => onSelectAudit(audit)}
              className="group text-left p-6 md:p-8 bg-white/[0.02] border border-white/5 rounded-[32px] hover:bg-white/[0.05] hover:border-brand-accent/30 transition-all flex flex-col md:flex-row items-start md:items-center gap-8 group/item hover:scale-[1.01] active:scale-[0.99] transform-gpu will-change-transform"
            >
              <div className="flex-1 space-y-4 w-full">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5">
                    <Calendar size={12} className="text-brand-accent" />
                    <span className="text-[10px] font-mono text-gray-400 uppercase tracking-tight">
                      {audit.timestamp.toDate().toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5">
                    <Clock size={12} className="text-brand-accent" />
                    <span className="text-[10px] font-mono text-gray-400 uppercase tracking-tight">
                      {audit.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-brand-accent/10 rounded-full border border-brand-accent/20">
                    <Activity size={12} className="text-brand-accent" />
                    <span className="text-[10px] font-mono text-brand-accent font-bold uppercase tracking-widest">
                      {audit.concurrency} TPS
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-accent animate-pulse" />
                  <h3 className="text-xl font-bold text-white uppercase tracking-tight truncate max-w-lg">
                    {audit.url || "Manual Scan"}
                  </h3>
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex flex-col">
                    <span className="text-[8px] font-mono text-gray-500 uppercase tracking-widest mb-1">Mean Score</span>
                    <span className="text-2xl font-black text-white font-mono">
                      {(audit.results.reduce((acc, r) => acc + (r.rating || 0), 0) / audit.results.length).toFixed(1)}
                    </span>
                  </div>
                  <div className="h-8 w-[1px] bg-white/10" />
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-[8px] font-mono text-gray-500 uppercase tracking-widest mb-1">SRS Snippet</span>
                    <span className="text-xs text-gray-400 font-light truncate italic max-w-md">"{audit.srs.slice(0, 80)}..."</span>
                  </div>
                </div>
              </div>

              <div className="w-full md:w-auto flex justify-end">
                <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center group-hover/item:bg-brand-accent group-hover/item:border-brand-accent group-hover/item:text-white transition-all duration-500">
                  <ChevronRight size={20} className="transform group-hover/item:translate-x-1 transition-transform" />
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
}


import React, { useState, useEffect } from 'react';
import { RankingSnapshot } from '../types';
import { History, Search, FileText, Download, ShieldCheck, Trash2 } from 'lucide-react';

const RankingHistory: React.FC = () => {
  const [snapshots, setSnapshots] = useState<RankingSnapshot[]>([]);

  useEffect(() => {
    const db = JSON.parse(localStorage.getItem('ctspro_history_db') || '[]');
    setSnapshots(db);
  }, []);

  const handleTakeSnapshot = () => {
    const profilesDB = JSON.parse(localStorage.getItem('ctspro_profiles_db') || '[]');
    const tripsDB = JSON.parse(localStorage.getItem('ctspro_trips_db') || '[]');
    
    // Simplificado para o exemplo: capturando dados brutos
    const now = new Date();
    const snapshot: RankingSnapshot = {
      id: 'snap_' + Math.random().toString(36).substr(2, 9),
      month: `${now.getMonth() + 1}/${now.getFullYear()}`,
      data: profilesDB,
      createdAt: now.toISOString()
    };

    const db = JSON.parse(localStorage.getItem('ctspro_history_db') || '[]');
    const updated = [snapshot, ...db];
    localStorage.setItem('ctspro_history_db', JSON.stringify(updated));
    setSnapshots(updated);
    alert("Snapshot de Ranking concluído e arquivado!");
  };

  const deleteSnapshot = (id: string) => {
    if(!window.confirm("Remover permanentemente este arquivo?")) return;
    const updated = snapshots.filter(s => s.id !== id);
    localStorage.setItem('ctspro_history_db', JSON.stringify(updated));
    setSnapshots(updated);
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div className="space-y-4">
          <h2 className="text-5xl font-gaming font-black text-white uppercase tracking-tighter">Arquivos de <span className="text-indigo-500">Log</span></h2>
          <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.5em]">Snapshots Mensais e Auditoria Histórica</p>
        </div>
        <button onClick={handleTakeSnapshot} className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-3 transition-all">
          <FileText className="w-4 h-4" /> Fechar Ranking Mensal
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
         {snapshots.map(snap => (
           <div key={snap.id} className="glass p-8 rounded-[40px] border border-white/5 space-y-6 group hover:border-indigo-500/30 transition-all">
              <div className="flex justify-between items-start">
                 <div className="p-4 bg-indigo-600/10 rounded-2xl">
                    <History className="w-6 h-6 text-indigo-500" />
                 </div>
                 <button onClick={() => deleteSnapshot(snap.id)} className="p-2 text-slate-700 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div>
              <div>
                 <h4 className="text-2xl font-gaming font-black text-white">Ranking {snap.month}</h4>
                 <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">Auditado em {new Date(snap.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-2 text-green-500/50 bg-green-500/5 px-4 py-2 rounded-xl border border-green-500/10 w-fit">
                 <ShieldCheck className="w-3.5 h-3.5" />
                 <span className="text-[8px] font-black uppercase tracking-widest">Snapshot Integrado</span>
              </div>
              <button className="w-full py-4 bg-white/5 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center gap-3">
                 <Download className="w-4 h-4" /> Baixar Dados JSON
              </button>
           </div>
         ))}
         {snapshots.length === 0 && (
           <div className="col-span-full py-40 text-center opacity-30">
              <History className="w-20 h-20 text-slate-600 mx-auto mb-6" />
              <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500">Nenhum snapshot arquivado até o momento.</p>
           </div>
         )}
      </div>
    </div>
  );
};

export default RankingHistory;

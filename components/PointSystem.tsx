
import React, { useState, useEffect } from 'react';
import { UserProfile, PointLog, Segment } from '../types';
import { Clock, Zap, Play, Square, ListTodo, ChevronRight } from 'lucide-react';

interface PointSystemProps {
  profile: UserProfile;
}

const PointSystem: React.FC<PointSystemProps> = ({ profile }) => {
  const [logs, setLogs] = useState<PointLog[]>([]);
  const [activeShift, setActiveShift] = useState<PointLog | null>(null);
  const [routeType, setRouteType] = useState('');

  useEffect(() => {
    // Sincronizar rota padrão com base no segmento do cadastro
    if (!routeType) {
      if (profile.segment === Segment.BUS) setRouteType('Transporte de Passageiros (Bus)');
      else if (profile.segment === Segment.TRUCK) setRouteType('Carga Pesada (Nacional)');
      else setRouteType('Misto (Carga & Passageiros)');
    }

    const db = JSON.parse(localStorage.getItem('ctspro_point_db') || '[]');
    const myLogs = db.filter((l: PointLog) => l.uid === profile.uid);
    setLogs(myLogs);
    
    const sorted = [...myLogs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    if (sorted[0]?.type === 'IN') {
      setActiveShift(sorted[0]);
    }
  }, [profile.uid, profile.segment]);

  const handlePoint = (type: 'IN' | 'OUT') => {
    const newLog: PointLog = {
      id: 'pt_' + Math.random().toString(36).substr(2, 9),
      uid: profile.uid,
      name: profile.name,
      companyName: profile.companyName || 'AUTÔNOMO',
      type: type,
      timestamp: new Date().toISOString(),
      routeType: routeType
    };

    const db = JSON.parse(localStorage.getItem('ctspro_point_db') || '[]');
    const updated = [newLog, ...db];
    localStorage.setItem('ctspro_point_db', JSON.stringify(updated));
    
    setLogs(prev => [newLog, ...prev]);
    setActiveShift(type === 'IN' ? newLog : null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h2 className="text-2xl font-gaming font-black text-white uppercase tracking-tighter">Ponto <span className="text-blue-500">Digital</span></h2>
          <p className="text-slate-500 font-bold text-[7px] uppercase tracking-[0.4em]">Controle de Jornada Mobile & PC</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         <div className="glass p-5 rounded-[25px] border border-blue-500/20 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 text-blue-400">
               <Clock className="w-4 h-4" />
               <h3 className="text-[9px] font-gaming font-black uppercase tracking-widest">Operação</h3>
            </div>
            
            <div className="space-y-1">
               <label className="text-[7px] font-black text-slate-500 uppercase tracking-widest px-1">Rota Atribuída</label>
               <div className="relative">
                 <select 
                   disabled={!!activeShift}
                   value={routeType}
                   onChange={e => setRouteType(e.target.value)}
                   className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-[10px] font-bold text-white outline-none focus:border-blue-500 appearance-none disabled:opacity-50"
                 >
                   <option value="Carga Pesada (Nacional)">Carga Pesada (Nacional)</option>
                   <option value="Carga Fracionada (Urbano)">Carga Fracionada (Urbano)</option>
                   <option value="Transporte de Passageiros (Bus)">Transporte de Passageiros (Bus)</option>
                   <option value="Misto (Carga & Passageiros)">Misto (Carga & Passageiros)</option>
                 </select>
                 <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-600 pointer-events-none rotate-90" />
               </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
               <button 
                 disabled={!!activeShift}
                 onClick={() => handlePoint('IN')}
                 className="py-3 bg-green-600 hover:bg-green-500 disabled:bg-slate-800 disabled:opacity-30 text-white rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-md text-[8px]"
               >
                  <Play className="w-3 h-3" /> <span>Entrada</span>
               </button>
               <button 
                 disabled={!activeShift}
                 onClick={() => handlePoint('OUT')}
                 className="py-3 bg-red-600 hover:bg-red-500 disabled:bg-slate-800 disabled:opacity-30 text-white rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-md text-[8px]"
               >
                  <Square className="w-3 h-3" /> <span>Saída</span>
               </button>
            </div>
         </div>

         <div className="glass p-5 rounded-[25px] border border-white/5 space-y-4 shadow-xl">
            <h3 className="text-[9px] font-gaming font-black text-white uppercase flex items-center gap-2"><ListTodo className="w-4 h-4 text-slate-500" /> Histórico Recente</h3>
            <div className="space-y-2 max-h-[160px] overflow-y-auto custom-scrollbar pr-1">
               {logs.map(log => (
                 <div key={log.id} className="bg-white/[0.02] p-2.5 rounded-xl border border-white/5 flex justify-between items-center group hover:border-blue-500/20 transition-all">
                    <div className="flex items-center gap-3">
                       <div className={`p-1.5 rounded-lg ${log.type === 'IN' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                          {log.type === 'IN' ? <Play className="w-3 h-3" /> : <Square className="w-3 h-3" />}
                       </div>
                       <div>
                          <p className="text-[7px] font-black text-white uppercase">{log.type === 'IN' ? 'INÍCIO' : 'FIM'}</p>
                          <p className="text-[6px] font-bold text-slate-600 uppercase truncate max-w-[100px]">{log.routeType}</p>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className="text-[8px] font-mono font-black text-slate-400">{new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                    </div>
                 </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
};

export default PointSystem;

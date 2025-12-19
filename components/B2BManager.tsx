
import React, { useState, useEffect } from 'react';
import { UserProfile, B2BContract, CompanyGoal, UserCategory, UserStatus } from '../types';
import { Target, Handshake, TrendingUp, Plus, X, ArrowRight, ShieldCheck, User, Users, ChevronRight, LayoutGrid } from 'lucide-react';

interface B2BManagerProps {
  profile: UserProfile;
}

const B2BManager: React.FC<B2BManagerProps> = ({ profile }) => {
  const [goals, setGoals] = useState<CompanyGoal[]>([]);
  const [contracts, setContracts] = useState<B2BContract[]>([]);
  const [allCompanies, setAllCompanies] = useState<UserProfile[]>([]);
  const [teamMembers, setTeamMembers] = useState<UserProfile[]>([]);
  
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [isAddingContract, setIsAddingContract] = useState(false);

  const [newGoal, setNewGoal] = useState({ 
    title: '', 
    targetValue: 10000, 
    deadline: '', 
    type: 'GENERAL' as 'GENERAL' | 'INDIVIDUAL',
    targetUid: ''
  });
  
  const [newB2B, setNewB2B] = useState({ partner: '', percentageMe: 50, description: '' });

  useEffect(() => {
    const refreshB2B = () => {
      const goalsDB = JSON.parse(localStorage.getItem('ctspro_goals_db') || '[]');
      setGoals(goalsDB.filter((g: CompanyGoal) => g.companyName === profile.companyName));

      const b2bDB = JSON.parse(localStorage.getItem('ctspro_b2b_db') || '[]');
      setContracts(b2bDB.filter((c: B2BContract) => c.companyA === profile.companyName || c.companyB === profile.companyName));

      const profilesDB: UserProfile[] = JSON.parse(localStorage.getItem('ctspro_profiles_db') || '[]');
      const companies = profilesDB.filter(p => 
        p.status === UserStatus.APPROVED && 
        p.category === UserCategory.ENTREPRENEUR && 
        p.companyName !== profile.companyName
      );
      setAllCompanies(companies);

      setTeamMembers(profilesDB.filter(p => 
        p.companyName === profile.companyName && 
        p.uid !== profile.uid &&
        p.status === UserStatus.APPROVED
      ));
    };

    refreshB2B();
  }, [profile.companyName, profile.uid]);

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const targetMember = teamMembers.find(m => m.uid === newGoal.targetUid);
    const goal: CompanyGoal = {
      id: 'gl_' + Math.random().toString(36).substr(2, 9),
      companyName: profile.companyName!,
      title: newGoal.title,
      targetValue: newGoal.targetValue,
      currentValue: 0,
      deadline: newGoal.deadline,
      type: newGoal.type,
      targetUid: newGoal.type === 'INDIVIDUAL' ? newGoal.targetUid : undefined,
      targetName: newGoal.type === 'INDIVIDUAL' ? targetMember?.name : undefined
    };
    const db = JSON.parse(localStorage.getItem('ctspro_goals_db') || '[]');
    localStorage.setItem('ctspro_goals_db', JSON.stringify([goal, ...db]));
    setGoals([goal, ...goals]);
    setIsAddingGoal(false);
  };

  const handleAddB2B = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newB2B.partner) {
      alert("Selecione uma empresa.");
      return;
    }
    const contract: B2BContract = {
      id: 'b2b_' + Math.random().toString(36).substr(2, 9),
      companyA: profile.companyName!,
      companyB: newB2B.partner,
      percentageA: newB2B.percentageMe,
      percentageB: 100 - newB2B.percentageMe,
      status: 'PENDING',
      description: newB2B.description,
      createdAt: new Date().toISOString()
    };
    const db = JSON.parse(localStorage.getItem('ctspro_b2b_db') || '[]');
    localStorage.setItem('ctspro_b2b_db', JSON.stringify([contract, ...db]));
    setContracts([contract, ...contracts]);
    setIsAddingContract(false);
    alert(`Solicitação B2B enviada.`);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-16 max-w-6xl mx-auto px-1">
      <div className="flex flex-col md:flex-row justify-between items-center md:items-end gap-6">
        <div className="space-y-2 text-center md:text-left">
          <h2 className="text-4xl font-gaming font-black text-white uppercase tracking-tighter leading-none">Logística de <br/><span className="text-indigo-500">Parcerias</span></h2>
          <p className="text-slate-500 font-bold text-[8px] uppercase tracking-[0.4em]">Metas Individuais e Acordos Comerciais</p>
        </div>
        <div className="grid grid-cols-2 gap-2 w-full sm:w-auto">
           <button onClick={() => setIsAddingGoal(true)} className="px-5 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black uppercase text-[8px] tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95">
             <Target className="w-4 h-4" /> Nova Meta
           </button>
           <button onClick={() => setIsAddingContract(true)} className="px-5 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black uppercase text-[8px] tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95">
             <Handshake className="w-4 h-4" /> Novo B2B
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="glass p-6 md:p-8 rounded-[35px] border border-white/5 space-y-6 shadow-2xl">
           <h3 className="text-base font-gaming font-black text-white uppercase flex items-center gap-3"><TrendingUp className="w-4 h-4 text-blue-500" /> Metas Ativas</h3>
           <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-1">
              {goals.map(goal => (
                <div key={goal.id} className="bg-white/[0.02] p-4 rounded-2xl border border-white/5 space-y-3">
                   <div className="flex justify-between items-start">
                      <div className="space-y-1">
                         <div className="flex items-center gap-2">
                            {goal.type === 'INDIVIDUAL' ? <User className="w-3 h-3 text-yellow-500" /> : <LayoutGrid className="w-3 h-3 text-blue-500" />}
                            <p className="text-[10px] font-black text-white uppercase">{goal.title}</p>
                         </div>
                         <p className="text-[7px] font-black text-slate-600 uppercase">
                           {goal.type === 'INDIVIDUAL' ? `Foco: ${goal.targetName}` : 'Objetivo Geral'}
                         </p>
                      </div>
                      <p className="text-sm font-mono font-black text-blue-500">{Math.round((goal.currentValue/goal.targetValue)*100)}%</p>
                   </div>
                   <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-white/5">
                      <div className="h-full bg-blue-600" style={{ width: `${Math.min(100, (goal.currentValue/goal.targetValue)*100)}%` }}></div>
                   </div>
                </div>
              ))}
           </div>
        </div>

        <div className="glass p-6 md:p-8 rounded-[35px] border border-white/5 space-y-6 shadow-2xl">
           <h3 className="text-base font-gaming font-black text-white uppercase flex items-center gap-3"><Handshake className="w-4 h-4 text-indigo-500" /> Acordos B2B</h3>
           <div className="space-y-4">
              {contracts.map(c => (
                <div key={c.id} className="bg-white/[0.02] p-4 rounded-2xl border border-white/5 space-y-2">
                   <div className="flex justify-between items-center">
                      <p className="text-[9px] font-black text-white uppercase">{c.companyA} <span className="text-indigo-500">↔</span> {c.companyB}</p>
                      <span className="text-[6px] px-2 py-0.5 bg-yellow-600/10 text-yellow-500 rounded border border-yellow-500/20 font-black uppercase">{c.status}</span>
                   </div>
                   <p className="text-[8px] text-slate-500 font-bold uppercase truncate">{c.description}</p>
                </div>
              ))}
           </div>
        </div>
      </div>

      {isAddingGoal && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-xl">
           <form onSubmit={handleAddGoal} className="w-full max-w-sm glass p-6 rounded-[30px] border border-blue-500/20 space-y-4 shadow-2xl">
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                 <h3 className="text-xs font-gaming font-black text-white uppercase">Criar Alvo</h3>
                 <button type="button" onClick={() => setIsAddingGoal(false)} className="p-1.5 bg-white/5 rounded-lg hover:bg-red-600"><X className="w-4 h-4" /></button>
              </div>
              <div className="space-y-3">
                 <div className="flex bg-slate-900 p-1 rounded-xl border border-white/5">
                    <button type="button" onClick={() => setNewGoal({...newGoal, type: 'GENERAL'})} className={`flex-1 py-2 rounded-lg text-[8px] font-black uppercase transition-all ${newGoal.type === 'GENERAL' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500'}`}>Geral</button>
                    <button type="button" onClick={() => setNewGoal({...newGoal, type: 'INDIVIDUAL'})} className={`flex-1 py-2 rounded-lg text-[8px] font-black uppercase transition-all ${newGoal.type === 'INDIVIDUAL' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500'}`}>Individual</button>
                 </div>

                 {newGoal.type === 'INDIVIDUAL' && (
                    <select 
                      required 
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-[10px] font-bold text-white outline-none"
                      value={newGoal.targetUid}
                      onChange={e => setNewGoal({...newGoal, targetUid: e.target.value})}
                    >
                       <option value="">Selecione o Membro</option>
                       {teamMembers.map(m => <option key={m.uid} value={m.uid}>{m.name}</option>)}
                    </select>
                 )}

                 <input type="text" required placeholder="Título" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-[10px] font-bold text-white outline-none" value={newGoal.title} onChange={e => setNewGoal({...newGoal, title: e.target.value})} />
                 <input type="number" required placeholder="Faturamento Alvo" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-[10px] font-bold text-white outline-none" value={newGoal.targetValue} onChange={e => setNewGoal({...newGoal, targetValue: parseInt(e.target.value)})} />
                 <input type="date" required className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-[10px] font-bold text-white outline-none" value={newGoal.deadline} onChange={e => setNewGoal({...newGoal, deadline: e.target.value})} />
              </div>
              <button type="submit" className="w-full py-3.5 bg-blue-600 text-white font-black uppercase rounded-xl shadow-lg text-[9px] tracking-widest">ATIVAR META</button>
           </form>
        </div>
      )}

      {isAddingContract && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-xl">
           <form onSubmit={handleAddB2B} className="w-full max-w-sm glass p-6 rounded-[30px] border border-indigo-500/20 space-y-4 shadow-2xl">
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                 <h3 className="text-xs font-gaming font-black text-white uppercase">Formalizar B2B</h3>
                 <button type="button" onClick={() => setIsAddingContract(false)} className="p-1.5 bg-white/5 rounded-lg hover:bg-red-600"><X className="w-4 h-4" /></button>
              </div>
              <div className="space-y-3">
                 <select 
                    required 
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-[10px] font-bold text-white outline-none appearance-none cursor-pointer"
                    value={newB2B.partner}
                    onChange={e => setNewB2B({...newB2B, partner: e.target.value})}
                 >
                    <option value="">Selecione Empresa Parceira...</option>
                    {allCompanies.map(c => <option key={c.uid} value={c.companyName}>{c.companyName}</option>)}
                 </select>
                 
                 <div className="space-y-1.5 bg-white/[0.03] p-3 rounded-xl border border-white/5">
                    <div className="flex justify-between text-[7px] font-black uppercase tracking-widest text-slate-500">
                       <span>Minha Cota: {newB2B.percentageMe}%</span>
                    </div>
                    <input type="range" min="10" max="90" className="w-full accent-indigo-500" value={newB2B.percentageMe} onChange={e => setNewB2B({...newB2B, percentageMe: parseInt(e.target.value)})} />
                 </div>
                 <textarea placeholder="Objetivo da parceria..." className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-[10px] font-bold text-white outline-none h-20" value={newB2B.description} onChange={e => setNewB2B({...newB2B, description: e.target.value})} />
              </div>
              <button type="submit" className="w-full py-3.5 bg-indigo-600 text-white font-black uppercase rounded-xl shadow-lg text-[9px] tracking-widest">SOLICITAR PARCERIA</button>
           </form>
        </div>
      )}
    </div>
  );
};

export default B2BManager;

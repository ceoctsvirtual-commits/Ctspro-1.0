
import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, UserStatus, CustomRole, Permissions, UserCategory } from '../types';
import { 
  Shield, Search, Users, CheckCircle2, 
  Settings2, Lock, ShieldCheck, Download, Upload, 
  Database, AlertTriangle, RefreshCw, Save, HardDrive, History, FileJson
} from 'lucide-react';

interface AdminPanelProps {
  onUpdateStatus: (p: UserProfile) => void;
  currentUser: UserProfile;
  onBackupAction: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onUpdateStatus, currentUser, onBackupAction }) => {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [roles, setRoles] = useState<CustomRole[]>([]);
  const [activeTab, setActiveTab] = useState<'queue' | 'users' | 'roles' | 'backup'>('queue');
  const [searchTerm, setSearchTerm] = useState('');
  const [lastBackupDate, setLastBackupDate] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [newRoleName, setNewRoleName] = useState('');
  const [newRolePerms, setNewRolePerms] = useState<Permissions>({
    pode_aprovar: false,
    pode_editar: false,
    pode_gerenciar_viagens: false,
    pode_atribuir_cargos: false,
    pode_banir: false,
    pode_ver_financeiro: false,
    pode_gerenciar_b2b: false
  });

  const isMaster = currentUser.email === 'ctsproadmim@gmail.com';

  useEffect(() => {
    refreshData();
    setLastBackupDate(localStorage.getItem('data_ultimo_backup'));
  }, []);

  const refreshData = () => {
    setProfiles(JSON.parse(localStorage.getItem('ctspro_profiles_db') || '[]'));
    setRoles(JSON.parse(localStorage.getItem('ctspro_roles_db') || '[]'));
  };

  const handleStatusChange = (uid: string, newStatus: UserStatus) => {
    const db = JSON.parse(localStorage.getItem('ctspro_profiles_db') || '[]');
    const idx = db.findIndex((p: any) => p.uid === uid);
    if (idx > -1) {
      db[idx].status = newStatus;
      localStorage.setItem('ctspro_profiles_db', JSON.stringify(db));
      refreshData();
    }
  };

  const updateFactor = (uid: string, factor: number) => {
    const db = JSON.parse(localStorage.getItem('ctspro_profiles_db') || '[]');
    const idx = db.findIndex((p: any) => p.uid === uid);
    if (idx > -1) {
      db[idx].performanceFactor = factor;
      localStorage.setItem('ctspro_profiles_db', JSON.stringify(db));
      refreshData();
      alert(`Fator do membro atualizado para ${factor}x`);
    }
  };

  const handleRoleCreation = () => {
    if (!newRoleName) return;
    const newRole: CustomRole = {
      id: 'role_' + Math.random().toString(36).substr(2, 9),
      name: newRoleName.toUpperCase(),
      permissions: newRolePerms
    };
    const updated = [...roles, newRole];
    localStorage.setItem('ctspro_roles_db', JSON.stringify(updated));
    setRoles(updated);
    setNewRoleName('');
    alert("Cargo criado com sucesso!");
  };

  const exportarBackup = () => {
    try {
      const backupData = {
        metadata: {
          nome_sistema: "CTSPRO GLOBAL",
          versao_backup: "4.8-ULTRA",
          data_criacao: new Date().toISOString(),
          autor: currentUser.email,
          uid_autor: currentUser.uid
        },
        database: {
          usuarios: JSON.parse(localStorage.getItem('ctspro_profiles_db') || '[]'),
          viagens: JSON.parse(localStorage.getItem('ctspro_trips_db') || '[]'),
          ponto_eletronico: JSON.parse(localStorage.getItem('ctspro_point_db') || '[]'),
          cargos: JSON.parse(localStorage.getItem('ctspro_roles_db') || '[]'),
          metas: JSON.parse(localStorage.getItem('ctspro_goals_db') || '[]'),
          parcerias: JSON.parse(localStorage.getItem('ctspro_b2b_db') || '[]'),
          historico: JSON.parse(localStorage.getItem('ctspro_history_db') || '[]'),
          autenticacao: JSON.parse(localStorage.getItem('ctspro_auth_db') || '[]')
        }
      };

      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `CTSPRO_BACKUP_MASTER_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      const now = new Date().toISOString();
      localStorage.setItem('data_ultimo_backup', now);
      setLastBackupDate(now);
      onBackupAction(); // Notifica o Dashboard para atualizar a UI do alerta
      alert("BACKUP CONCLUÍDO! O arquivo de segurança foi gerado.");
    } catch (err) {
      alert("ERRO CRÍTICO: Falha ao compilar dados.");
    }
  };

  const importarBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!window.confirm("⚠️ ALERTA: Esta ação irá sobrescrever TODOS os dados atuais. Para continuar, você será deslogado e precisará entrar com as credenciais do backup. Deseja prosseguir?")) {
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const backup = JSON.parse(content);

        if (!backup.database) throw new Error("Estrutura do arquivo de backup inválida.");

        const db = backup.database;
        localStorage.setItem('ctspro_profiles_db', JSON.stringify(db.usuarios || []));
        localStorage.setItem('ctspro_trips_db', JSON.stringify(db.viagens || []));
        localStorage.setItem('ctspro_point_db', JSON.stringify(db.ponto_eletronico || []));
        localStorage.setItem('ctspro_roles_db', JSON.stringify(db.cargos || []));
        localStorage.setItem('ctspro_goals_db', JSON.stringify(db.metas || []));
        localStorage.setItem('ctspro_b2b_db', JSON.stringify(db.parcerias || []));
        localStorage.setItem('ctspro_history_db', JSON.stringify(db.historico || []));
        localStorage.setItem('ctspro_auth_db', JSON.stringify(db.autenticacao || []));

        localStorage.setItem('data_ultimo_backup', new Date().toISOString());
        
        // Limpa a sessão atual ANTES de recarregar
        localStorage.removeItem('ctspro_user');
        localStorage.removeItem('user_email');
        localStorage.removeItem('ctspro_status'); 

        alert("✅ SISTEMA RESTAURADO! A aplicação será reiniciada. Por favor, faça login com as credenciais do backup.");
        window.location.reload();
      } catch (err) {
        alert("❌ ERRO NA RESTAURAÇÃO: Arquivo corrompido ou incompatível. " + (err as Error).message);
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  const pending = profiles.filter(p => p.status === UserStatus.PENDING);
  const approved = profiles.filter(p => p.status === UserStatus.APPROVED);

  return (
    <div className="space-y-12 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-wrap gap-3 bg-slate-900/50 p-2 rounded-3xl border border-white/5 w-fit">
        {[
          { id: 'queue', label: `Fila (${pending.length})`, icon: <CheckCircle2 className="w-4 h-4" /> },
          { id: 'users', label: 'Todos Membros', icon: <Users className="w-4 h-4" /> },
          { id: 'roles', label: 'Cargos Staff', icon: <Shield className="w-4 h-4" /> },
          { id: 'backup', label: 'Backup Global', icon: <Database className="w-4 h-4" /> }
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex items-center gap-3 px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-xl' : 'text-slate-500 hover:text-slate-300'}`}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <div className="glass rounded-[50px] p-8 md:p-12 shadow-2xl border border-white/5 min-h-[500px] relative overflow-hidden">
        {activeTab === 'queue' && (
          <div className="grid grid-cols-1 gap-4">
            <h3 className="text-2xl font-gaming font-black text-white uppercase mb-6">Solicitações <span className="text-blue-500">Pendentes</span></h3>
            {pending.map(p => (
              <div key={p.uid} className="bg-slate-950/50 p-6 rounded-[35px] border border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 group hover:border-blue-500/30 transition-all">
                <div className="flex items-center gap-6 flex-1">
                  <img src={p.photoUrl} className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-800" alt="" />
                  <div>
                    <h4 className="font-black text-white uppercase text-lg">{p.name}</h4>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">{p.category}</p>
                    <p className="text-[8px] text-blue-500 font-mono mt-1 uppercase">{p.email}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => handleStatusChange(p.uid, UserStatus.APPROVED)} className="px-8 py-3.5 bg-green-600 hover:bg-green-500 text-white rounded-xl font-black uppercase text-[9px] tracking-widest transition-all active:scale-95">Aprovar Registro</button>
                  <button onClick={() => handleStatusChange(p.uid, UserStatus.REJECTED)} className="px-8 py-3.5 bg-white/5 hover:bg-red-600/20 text-red-500 rounded-xl font-black uppercase text-[9px] tracking-widest transition-all active:scale-95 border border-red-500/10">Recusar</button>
                </div>
              </div>
            ))}
            {pending.length === 0 && (
              <div className="flex flex-col items-center justify-center py-32 space-y-4 opacity-30">
                 <ShieldCheck className="w-16 h-16 text-slate-600" />
                 <p className="text-slate-600 font-bold uppercase text-[10px] tracking-[0.4em]">Fila Limpa</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'users' && (
           <div className="space-y-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                 <h3 className="text-2xl font-gaming font-black text-white uppercase">Membros <span className="text-blue-500">Auditados</span></h3>
                 <div className="relative group w-full md:w-80">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                    <input type="text" placeholder="Filtrar por nome ou e-mail..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-6 py-4 text-xs font-bold text-white focus:border-blue-600 outline-none transition-all shadow-inner" />
                 </div>
              </div>
              <div className="grid grid-cols-1 gap-4">
                 {approved.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase())).map(u => (
                   <div key={u.uid} className="bg-white/[0.02] p-6 rounded-[35px] border border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 hover:bg-white/[0.04] transition-all">
                      <div className="flex items-center gap-5 flex-1">
                         <img src={u.photoUrl} className="w-14 h-14 rounded-2xl object-cover border border-white/10" alt="" />
                         <div>
                            <p className="text-sm font-black text-white uppercase leading-none">{u.name}</p>
                            <p className="text-[9px] text-slate-600 font-bold uppercase mt-1.5 flex items-center gap-2">
                              {u.category === UserCategory.ENTREPRENEUR ? <Shield className="w-3 h-3 text-blue-500" /> : <Users className="w-3 h-3" />}
                              {u.companyName || 'AUTÔNOMO'}
                            </p>
                         </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-4">
                         <div className="flex items-center gap-3 bg-slate-950/80 p-2.5 rounded-2xl border border-white/5">
                            <span className="text-[8px] font-black text-slate-500 uppercase px-2">Fator:</span>
                            <select 
                              value={u.performanceFactor || 1.0} 
                              onChange={e => updateFactor(u.uid, parseFloat(e.target.value))}
                              className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-1.5 text-[10px] font-black text-blue-500 outline-none focus:border-blue-500"
                            >
                               <option value="1.0">1.0x</option>
                               <option value="1.1">1.1x</option>
                               <option value="1.2">1.2x</option>
                               <option value="1.5">1.5x</option>
                               <option value="2.0">2.0x</option>
                            </select>
                         </div>
                         <button onClick={() => handleStatusChange(u.uid, UserStatus.BANNED)} className="p-3 bg-red-600/10 text-red-500 rounded-xl hover:bg-red-600 hover:text-white transition-all border border-red-500/20 active:scale-95">
                            <Lock className="w-4 h-4" />
                         </button>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        )}

        {activeTab === 'roles' && (
          <div className="space-y-12">
            <div className="bg-blue-600/5 p-8 md:p-12 rounded-[45px] border border-blue-600/20 space-y-10 relative overflow-hidden shadow-2xl">
               <div className="absolute top-0 right-0 p-10 opacity-5 rotate-12"><Shield className="w-40 h-40 text-blue-500" /></div>
               <div className="relative z-10 space-y-2">
                  <h3 className="text-3xl font-gaming font-black text-white flex items-center gap-4 uppercase tracking-tighter">Gestão de <span className="text-blue-500">Cargos</span></h3>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Defina permissões para a Staff</p>
               </div>
               <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 relative z-10">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Nome do Cargo</label>
                    <input type="text" value={newRoleName} onChange={e => setNewRoleName(e.target.value)} placeholder="EX: GERENTE" className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-8 py-5 text-sm font-black text-white uppercase focus:border-blue-500 outline-none shadow-inner" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 bg-slate-950/80 p-8 rounded-[35px] border border-white/5">
                     {Object.keys(newRolePerms).map(k => (
                       <label key={k} className="flex items-center gap-4 cursor-pointer group select-none">
                         <input type="checkbox" checked={(newRolePerms as any)[k]} onChange={e => setNewRolePerms({...newRolePerms, [k]: e.target.checked})} className="peer hidden" />
                         <div className="w-5 h-5 bg-slate-900 border-2 border-slate-800 rounded-lg peer-checked:bg-blue-600 peer-checked:border-blue-400 transition-all flex items-center justify-center shadow-lg"><CheckCircle2 className="w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100" /></div>
                         <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest group-hover:text-white transition-all">{k.replace('pode_', '').replace(/_/g, ' ')}</span>
                       </label>
                     ))}
                  </div>
               </div>
               <button onClick={handleRoleCreation} className="w-full py-6 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-[0.5em] rounded-[25px] transition-all shadow-xl active:scale-[0.98]">
                  <Save className="w-6 h-6" /> CRIAR CARGO
               </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {roles.map((r: any) => (
                 <div key={r.id} className="bg-slate-950/50 p-8 rounded-[40px] border border-white/5 space-y-6 hover:border-blue-500/30 transition-all group">
                    <div className="flex justify-between items-center border-b border-white/5 pb-4">
                       <span className="text-sm font-gaming font-black text-white uppercase tracking-tighter">{r.name}</span>
                       {r.isLocked ? <Lock className="w-4 h-4 text-yellow-500" /> : <Settings2 className="w-4 h-4 text-slate-700" />}
                    </div>
                    <div className="space-y-3">
                       {Object.entries(r.permissions).map(([k, v]) => (
                         <div key={k} className="flex justify-between items-center">
                            <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{k.replace('pode_', '').replace(/_/g, ' ')}</span>
                            {v ? <ShieldCheck className="w-3.5 h-3.5 text-blue-500" /> : <Lock className="w-3.5 h-3.5 text-slate-900" />}
                         </div>
                       ))}
                    </div>
                 </div>
               ))}
            </div>
          </div>
        )}

        {activeTab === 'backup' && (
          <div className="space-y-12 animate-in slide-in-from-bottom duration-500">
             <div className="flex flex-col md:flex-row justify-between items-center gap-8 border-b border-white/5 pb-10">
                <div className="space-y-2 text-center md:text-left">
                   <h3 className="text-3xl font-gaming font-black text-white uppercase tracking-tighter leading-tight">Segurança Global<br/><span className="text-blue-500">Backup & Restore</span></h3>
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Último backup realizado: {lastBackupDate ? new Date(lastBackupDate).toLocaleString('pt-BR') : 'Nunca'}</p>
                </div>
                <div className="flex items-center gap-4 bg-blue-600/10 px-8 py-4 rounded-3xl border border-blue-500/20 shadow-xl">
                   <ShieldCheck className="w-6 h-6 text-blue-500" />
                   <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Protocolo Master Founder</span>
                </div>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="glass p-10 rounded-[45px] border border-blue-500/10 space-y-8 bg-blue-600/5 relative group overflow-hidden shadow-2xl">
                   <div className="absolute -top-10 -right-10 opacity-5 group-hover:scale-110 transition-transform duration-700"><Download className="w-44 h-44" /></div>
                   <div className="flex items-center gap-6">
                      <div className="p-5 bg-blue-600/20 rounded-3xl shadow-lg border border-blue-500/30">
                         <FileJson className="w-8 h-8 text-blue-500" />
                      </div>
                      <div>
                         <h4 className="text-2xl font-gaming font-black text-white uppercase tracking-tighter">Gerar Backup</h4>
                         <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Extrair todos os dados (.json)</p>
                      </div>
                   </div>
                   <p className="text-xs font-bold text-slate-400 leading-relaxed">
                      Recomendamos realizar o backup pelo menos uma vez por semana para garantir que seus motoristas e viagens nunca sejam perdidos.
                   </p>
                   <button onClick={exportarBackup} className="w-full py-6 bg-blue-600 hover:bg-blue-500 text-white rounded-[25px] font-black uppercase tracking-[0.4em] transition-all shadow-xl active:scale-95 flex items-center justify-center gap-4 text-xs">
                      <Download className="w-5 h-5" /> GERAR BACKUP MASTER (.JSON)
                   </button>
                </div>

                <div className="glass p-10 rounded-[45px] border border-red-500/10 space-y-8 bg-red-600/5 relative group overflow-hidden shadow-2xl">
                   <div className="absolute -top-10 -right-10 opacity-5 group-hover:scale-110 transition-transform duration-700"><Upload className="w-44 h-44" /></div>
                   <div className="flex items-center gap-6">
                      <div className="p-5 bg-red-600/20 rounded-3xl shadow-lg border border-red-500/30">
                         <RefreshCw className="w-8 h-8 text-red-500" />
                      </div>
                      <div>
                         <h4 className="text-2xl font-gaming font-black text-white uppercase tracking-tighter">Restaurar Dados</h4>
                         <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Sincronizar arquivo externo</p>
                      </div>
                   </div>
                   <p className="text-xs font-bold text-slate-400 leading-relaxed">
                      Este processo irá sobrescrever o estado atual do sistema com os dados do arquivo selecionado.
                   </p>
                   <div className="relative">
                      <input type="file" ref={fileInputRef} accept=".json" onChange={importarBackup} className="hidden" />
                      <button onClick={() => fileInputRef.current?.click()} className="w-full py-6 bg-slate-900 hover:bg-red-600 text-white rounded-[25px] font-black uppercase tracking-[0.4em] transition-all shadow-xl active:scale-95 flex items-center justify-center gap-4 border border-red-500/20 text-xs">
                         <Upload className="w-5 h-5" /> CARREGAR BACKUP (.JSON)
                      </button>
                   </div>
                </div>
             </div>

             <div className="bg-slate-950/80 p-10 rounded-[45px] border border-white/5 space-y-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5"><History className="w-32 h-32 text-slate-600" /></div>
                <div className="flex items-center gap-5 text-yellow-500">
                   <AlertTriangle className="w-8 h-8" />
                   <h5 className="text-lg font-gaming font-black uppercase tracking-tighter">Aviso de Segurança</h5>
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest leading-loose max-w-3xl">
                   Como Fundador, seu perfil e cargos master estão blindados no código do sistema. O backup manual é essencial para salvaguardar o faturamento e os cadastros dos outros membros da frota global.
                </p>
                <div className="flex flex-wrap gap-4 pt-4 border-t border-white/5">
                   <div className="flex items-center gap-3 bg-white/5 px-5 py-3 rounded-2xl border border-white/10">
                      <HardDrive className="w-4 h-4 text-slate-600" />
                      <span className="text-[10px] font-black text-slate-400 uppercase">Tamanho: {(JSON.stringify(localStorage).length / 1024).toFixed(2)} KB</span>
                   </div>
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;

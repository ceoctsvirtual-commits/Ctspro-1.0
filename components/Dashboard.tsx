
import React, { useState, useEffect } from 'react';
import { UserProfile, UserCategory, UserStatus, CustomRole, PointLog } from '../types';
import { ICONS } from '../constants';
import Badge from './Badge';
import TripLog from './TripLog';
import Ranking from './Ranking';
import AdminPanel from './AdminPanel';
import ProfileSetup from './ProfileSetup';
import PointSystem from './PointSystem';
import B2BManager from './B2BManager';
import RankingHistory from './RankingHistory';
import TeamManager from './TeamManager';

import { 
  Users, ShieldCheck, LayoutDashboard, LogOut, Menu, X, Clock, 
  Settings2, Zap, History, Handshake, AlertTriangle, Database
} from 'lucide-react';

interface DashboardProps {
  profile: UserProfile;
  onLogout: () => void;
  onUpdateProfile: (p: UserProfile) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ profile, onLogout, onUpdateProfile }) => {
  const [activeTab, setActiveTab] = useState<'home' | 'trips' | 'ranking' | 'admin' | 'settings' | 'members' | 'point' | 'b2b' | 'history'>('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editingMember, setEditingMember] = useState<UserProfile | null>(null);
  const [pointFeed, setPointFeed] = useState<PointLog[]>([]);
  const [showBackupToast, setShowBackupToast] = useState(false);

  const CTS_LOGO = "https://i.postimg.cc/q7fWdwyL/cts-logo.png";

  const checkBackupStatus = () => {
    if (profile.email !== 'ctsproadmim@gmail.com') return;
    const lastBackup = localStorage.getItem('data_ultimo_backup');
    if (!lastBackup) {
      setShowBackupToast(true);
    } else {
      const diff = Math.floor((Date.now() - new Date(lastBackup).getTime()) / (1000 * 60 * 60 * 24));
      setShowBackupToast(diff >= 7);
    }
  };

  useEffect(() => {
    const loadPoints = () => {
      try {
        const db = JSON.parse(localStorage.getItem('ctspro_point_db') || '[]');
        const sorted = [...db].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setPointFeed(sorted.slice(0, 30));
      } catch (e) {}
    };
    loadPoints();
    checkBackupStatus();
    const pointInterval = setInterval(loadPoints, 10000);
    return () => clearInterval(pointInterval);
  }, [profile.email]);

  const roles = JSON.parse(localStorage.getItem('ctspro_roles_db') || '[]');
  const currentRoleObj = roles.find((r: any) => r.id === (profile.roleId || 'default_user'));
  const perms = currentRoleObj?.permissions || { 
    pode_aprovar: false, pode_editar: false, pode_gerenciar_viagens: false, 
    pode_atribuir_cargos: false, pode_banir: false, pode_ver_financeiro: false 
  };

  const isMaster = profile.email === 'ctsproadmim@gmail.com';
  const hasAdminAccess = perms.pode_aprovar || perms.pode_editar || perms.pode_gerenciar_viagens || perms.pode_atribuir_cargos || perms.pode_banir || isMaster;

  const navItems = [
    { id: 'home', label: 'Início', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'point', label: 'Ponto Eletrônico', icon: <Zap className="w-5 h-5" /> },
    { id: 'trips', label: 'Viagens', icon: ICONS.Truck },
    { id: 'ranking', label: 'Hall da Fama', icon: ICONS.Ranking },
  ];

  if (profile.category === UserCategory.ENTREPRENEUR || profile.category === UserCategory.GROUPING || isMaster) {
    navItems.push({ id: 'members', label: 'Meu Time', icon: <Users className="w-5 h-5" /> });
    navItems.push({ id: 'b2b', label: 'Metas & B2B', icon: <Handshake className="w-5 h-5" /> });
  }

  const adminNavItems = [];
  if (hasAdminAccess) {
    adminNavItems.push({ id: 'admin', label: 'Staff Admin', icon: <ShieldCheck className="w-5 h-5" /> });
    adminNavItems.push({ id: 'history', label: 'Arquivos Ranking', icon: <History className="w-5 h-5" /> });
  }

  const handleEditProfile = (p: UserProfile) => {
    setEditingMember(p);
    setIsEditingProfile(true);
  };

  if (isEditingProfile && editingMember) {
    return (
      <ProfileSetup 
        user={{ uid: editingMember.uid, email: editingMember.email, name: editingMember.name, photoURL: editingMember.photoUrl }}
        onComplete={(newP) => {
          onUpdateProfile(newP);
          setIsEditingProfile(false);
          setEditingMember(null);
        }}
        onBack={() => {
          setIsEditingProfile(false);
          setEditingMember(null);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#020617] text-slate-200 bg-grid">
      
      {/* Backup Toast - Non Invasive */}
      {showBackupToast && (
        <div className="fixed bottom-10 right-10 z-[300] animate-in slide-in-from-right duration-500">
           <div className="bg-red-600/90 backdrop-blur-md border border-red-500/30 p-4 rounded-2xl shadow-2xl flex items-center gap-4 max-w-xs">
              <div className="bg-white/20 p-2 rounded-xl"><Database className="w-5 h-5 text-white" /></div>
              <div className="flex-1">
                 <p className="text-[10px] font-black text-white uppercase leading-none">Backup Pendente!</p>
                 <p className="text-[8px] text-white/70 font-bold uppercase mt-1">Sincronize sua frota agora.</p>
              </div>
              <button onClick={() => { setActiveTab('admin'); setShowBackupToast(false); }} className="px-3 py-1.5 bg-white text-red-600 rounded-lg text-[8px] font-black uppercase">Fazer</button>
              <button onClick={() => setShowBackupToast(false)} className="text-white/50 hover:text-white"><X className="w-4 h-4" /></button>
           </div>
        </div>
      )}

      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 glass sticky top-0 z-[100] border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full border border-blue-500/30 bg-slate-900 flex items-center justify-center overflow-hidden">
             <img src={CTS_LOGO} className="w-full h-full object-contain p-0.5" alt="CTS Logo" />
          </div>
          <h1 className="font-gaming font-black text-xl text-blue-500 uppercase tracking-tighter">CTSPRO</h1>
        </div>
        <button onClick={() => setIsSidebarOpen(true)} className="p-2 bg-white/5 rounded-xl border border-white/10"><Menu className="w-6 h-6" /></button>
      </div>

      <aside className={`fixed inset-0 lg:sticky lg:top-0 lg:flex flex-col w-full sm:w-72 h-screen glass border-r border-white/10 z-[150] transition-transform duration-500 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Sidebar Brand Section */}
        <div className="p-8 border-b border-white/5 bg-white/[0.02] relative text-center">
           <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden absolute top-4 right-4 p-2 text-slate-500"><X className="w-5 h-5" /></button>
           
           <div className="mb-6 flex justify-center">
              <div className="w-20 h-20 rounded-full border-2 border-blue-500/30 bg-slate-900 shadow-[0_0_25px_rgba(37,99,235,0.2)] flex items-center justify-center overflow-hidden">
                 <img src={CTS_LOGO} className="w-full h-full object-contain p-1" alt="CTS Logo" />
              </div>
           </div>

           <div className="flex flex-col items-center gap-4">
              <div className="relative group cursor-pointer" onClick={() => handleEditProfile(profile)}>
                 <div className="w-20 h-20 rounded-[30px] overflow-hidden border-4 border-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.3)]">
                    <img src={profile.photoUrl} alt="User" className="w-full h-full object-cover" />
                 </div>
                 <div className="absolute -bottom-1 -right-1 bg-blue-600 p-1.5 rounded-xl border-2 border-[#0f172a]"><Settings2 className="w-3 h-3 text-white" /></div>
              </div>
              <div className="space-y-1 w-full">
                 <h2 className="text-lg font-gaming font-black text-white uppercase truncate px-2 leading-none">{profile.name}</h2>
                 <div className="inline-block px-3 py-1 bg-white/5 rounded-lg border border-white/5">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{currentRoleObj?.name || 'OPERADOR'}</span>
                 </div>
              </div>
           </div>
        </div>
        
        <nav className="flex-1 px-4 py-8 space-y-1 overflow-y-auto custom-scrollbar">
          {navItems.map(item => (
            <button key={item.id} onClick={() => { setActiveTab(item.id as any); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-xl font-black text-[10px] uppercase transition-all ${activeTab === item.id ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}>
              {item.icon} <span className="tracking-widest">{item.label}</span>
            </button>
          ))}
          {adminNavItems.length > 0 && (
            <>
              <p className="px-5 pt-6 mb-2 text-[8px] font-black text-slate-600 uppercase tracking-widest">Master Admin</p>
              {adminNavItems.map(item => (
                <button key={item.id} onClick={() => { setActiveTab(item.id as any); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-xl font-black text-[10px] uppercase transition-all ${activeTab === item.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}>
                  {item.icon} <span className="tracking-widest">{item.label}</span>
                </button>
              ))}
            </>
          )}
        </nav>
        
        <div className="p-6 border-t border-white/5">
          <button onClick={onLogout} className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl font-black text-[9px] text-red-500 bg-red-600/5 hover:bg-red-600 hover:text-white transition-all border border-red-500/10 uppercase tracking-widest">
            <LogOut className="w-4 h-4" /> Trocar Conta
          </button>
        </div>
      </aside>

      <main className="flex-1 p-4 lg:p-10 overflow-y-auto max-h-screen custom-scrollbar relative flex flex-col">
        <div className="max-w-6xl mx-auto w-full space-y-12">
            {activeTab === 'home' && (
              <div className="space-y-10 animate-in fade-in duration-700">
                 <div className="glass p-6 rounded-[35px] border border-blue-500/10 overflow-hidden relative">
                    <h3 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] mb-4 flex items-center gap-2"><Zap className="w-4 h-4 animate-pulse" /> Logs Globais</h3>
                    <div className="space-y-2 max-h-[84px] overflow-y-auto custom-scrollbar">
                       {pointFeed.map(log => (
                         <div key={log.id} className="flex items-center justify-between text-[9px] font-bold text-slate-400 border-b border-white/5 pb-1">
                            <p><span className="text-white">[{log.name}]</span> {log.type === 'IN' ? 'iniciou' : 'encerrou'} turno em <span className="text-blue-400">{log.companyName}</span>.</p>
                            <span className="text-[8px] opacity-50">{new Date(log.timestamp).toLocaleTimeString()}</span>
                         </div>
                       ))}
                    </div>
                 </div>
                 <div className="relative glass p-8 md:p-12 rounded-[40px] border border-blue-500/20">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                       <div className="space-y-4 text-center md:text-left">
                          <h2 className="text-responsive-title font-gaming font-black text-white uppercase leading-tight">Painel de<br/><span className="text-blue-500">Frota</span></h2>
                          <p className="text-slate-400 font-bold text-responsive-subtitle uppercase tracking-widest max-w-md">Gerenciando logística global.</p>
                       </div>
                       <Badge profile={profile} onEdit={handleEditProfile} />
                    </div>
                 </div>
              </div>
            )}
            {activeTab === 'point' && <PointSystem profile={profile} />}
            {activeTab === 'trips' && <TripLog profile={profile} />}
            {activeTab === 'ranking' && <Ranking />}
            {activeTab === 'members' && <TeamManager profile={profile} onEditProfile={handleEditProfile} />}
            {activeTab === 'b2b' && <B2BManager profile={profile} />}
            {activeTab === 'history' && isMaster && <RankingHistory />}
            {activeTab === 'admin' && hasAdminAccess && <AdminPanel onUpdateStatus={onUpdateProfile} currentUser={profile} onBackupAction={checkBackupStatus} />}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

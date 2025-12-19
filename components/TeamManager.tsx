
import React, { useState, useEffect } from 'react';
import { UserProfile, CustomRole, UserCategory, UserStatus } from '../types';
import Badge from './Badge';
import { Users, ShieldCheck, UserCog, Search, X, Star, Edit3 } from 'lucide-react';

interface TeamManagerProps {
  profile: UserProfile;
  onEditProfile?: (p: UserProfile) => void;
}

const TeamManager: React.FC<TeamManagerProps> = ({ profile, onEditProfile }) => {
  const [members, setMembers] = useState<UserProfile[]>([]);
  const [roles, setRoles] = useState<CustomRole[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMember, setSelectedMember] = useState<UserProfile | null>(null);

  useEffect(() => {
    const refreshData = () => {
      const allProfiles: UserProfile[] = JSON.parse(localStorage.getItem('ctspro_profiles_db') || '[]');
      const isMaster = profile.email === 'ctsproadmim@gmail.com';
      
      const team = allProfiles.filter(p => {
        const isSameCompany = p.companyName === profile.companyName && profile.companyName !== '';
        const isApproved = p.status === UserStatus.APPROVED;
        return (isMaster || isSameCompany) && isApproved;
      });
      
      const sortedTeam = [...team].sort((a, b) => {
        if (a.uid === profile.uid) return -1;
        if (b.uid === profile.uid) return 1;
        return 0;
      });

      setMembers(sortedTeam);
      setRoles(JSON.parse(localStorage.getItem('ctspro_roles_db') || '[]'));
    };
    refreshData();
  }, [profile]);

  const handleAssignRole = (memberUid: string, roleId: string) => {
    const allProfiles: UserProfile[] = JSON.parse(localStorage.getItem('ctspro_profiles_db') || '[]');
    const updated = allProfiles.map(p => {
      if (p.uid === memberUid) return { ...p, roleId };
      return p;
    });
    localStorage.setItem('ctspro_profiles_db', JSON.stringify(updated));
    setMembers(members.map(m => m.uid === memberUid ? { ...m, roleId } : m));
    setSelectedMember(null);
    alert("Cargo atualizado.");
  };

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="space-y-1 text-center md:text-left">
          <h2 className="text-4xl font-gaming font-black text-white uppercase tracking-tighter leading-none">Gestão de <br/><span className="text-blue-500">Frota</span></h2>
          <p className="text-slate-500 font-bold text-[8px] uppercase tracking-[0.4em]">{profile.companyName}</p>
        </div>
        <div className="relative group w-full md:w-72">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input type="text" placeholder="Buscar membros..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-11 pr-5 py-3.5 text-[10px] font-bold text-white outline-none shadow-xl" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredMembers.map(member => (
          <div key={member.uid} className="flex flex-col items-center gap-5 group">
             <div className="w-full transform group-hover:-translate-y-2 transition-all duration-500 relative">
                {member.uid === profile.uid && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20 bg-blue-600 text-white px-4 py-1 rounded-full text-[8px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2">
                    <Star className="w-3 h-3" /> Líder da Frota
                  </div>
                )}
                {/* forceMemberView garante que donos vejam sua foto/CNH na lista de time */}
                <Badge profile={member} forceMemberView={true} />
             </div>
             
             <div className="flex gap-2 w-full max-w-[240px]">
               {member.uid === profile.uid ? (
                 <button onClick={() => onEditProfile?.(member)} className="flex-1 py-3 bg-blue-600 text-white rounded-xl flex items-center justify-center gap-3 text-[8px] font-black uppercase tracking-widest hover:bg-blue-500 transition-all shadow-lg active:scale-95">
                   <Edit3 className="w-3.5 h-3.5" /> Editar Perfil
                 </button>
               ) : (
                 <button onClick={() => setSelectedMember(member)} className="flex-1 py-3 bg-slate-900 border border-white/5 rounded-xl flex items-center justify-center gap-3 text-[8px] font-black uppercase tracking-widest text-slate-500 hover:text-white hover:bg-blue-600 transition-all shadow-lg active:scale-95">
                   <UserCog className="w-3.5 h-3.5" /> Atribuir Cargo
                 </button>
               )}
             </div>
          </div>
        ))}
      </div>

      {selectedMember && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-6 bg-slate-950/95 backdrop-blur-xl animate-in zoom-in duration-300">
           <div className="w-full max-w-sm glass p-7 rounded-[35px] border border-blue-500/30 space-y-6 relative overflow-hidden shadow-2xl">
              <div className="flex justify-between items-center">
                 <h3 className="text-xs font-gaming font-black text-white uppercase tracking-widest">Alterar Cargo</h3>
                 <button onClick={() => setSelectedMember(null)} className="p-1.5 bg-white/5 rounded-lg hover:bg-red-600 text-white"><X className="w-4 h-4" /></button>
              </div>
              
              <div className="flex items-center gap-4 p-4 bg-white/[0.03] rounded-2xl border border-white/5">
                 <img src={selectedMember.photoUrl} className="w-12 h-12 rounded-xl object-cover" alt="" />
                 <div>
                    <p className="text-[10px] font-black text-white uppercase leading-none">{selectedMember.name}</p>
                 </div>
              </div>

              <div className="space-y-2">
                 <div className="grid grid-cols-1 gap-1.5 max-h-[220px] overflow-y-auto custom-scrollbar">
                    {roles.map(role => (
                      <button key={role.id} onClick={() => handleAssignRole(selectedMember.uid, role.id)} className={`w-full p-4 rounded-xl border flex items-center justify-between transition-all ${selectedMember.roleId === role.id ? 'bg-blue-600 border-blue-400 text-white shadow-md' : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700'}`}>
                         <span className="text-[9px] font-black uppercase tracking-widest">{role.name}</span>
                         {selectedMember.roleId === role.id && <ShieldCheck className="w-3.5 h-3.5" />}
                      </button>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default TeamManager;

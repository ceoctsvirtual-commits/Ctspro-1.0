
import React, { useState, useEffect } from 'react';
import { UserProfile, UserCategory, Segment, CustomRole, UserStatus } from '../types';
import { ICONS } from '../constants';
import { X, ShieldCheck, Globe, Edit3, Trash2, QrCode, Flag, Medal, ChevronLeft, User, MapPin, Calendar, Award, FileText } from 'lucide-react';

interface BadgeProps {
  profile: UserProfile;
  viewerRole?: UserCategory; 
  onDelete?: (uid: string) => void;
  onEdit?: (profile: UserProfile) => void;
  forceMemberView?: boolean; // Nova prop para forçar exibição de motorista (foto + CNH)
}

const Badge: React.FC<BadgeProps> = ({ profile, viewerRole, onDelete, onEdit, forceMemberView }) => {
  const [showDoc, setShowDoc] = useState(false);
  const [roles, setRoles] = useState<CustomRole[]>([]);
  const primaryColor = profile.brandColor || '#2563eb';
  
  // Se forceMemberView for true, tratamos como motorista comum para exibição
  const isBusiness = !forceMemberView && [UserCategory.ENTREPRENEUR, UserCategory.AUTONOMOUS, UserCategory.GROUPING].includes(profile.category);
  const isGrouping = !forceMemberView && profile.category === UserCategory.GROUPING;

  useEffect(() => {
    setRoles(JSON.parse(localStorage.getItem('ctspro_roles_db') || '[]'));
  }, []);

  const getExpiryDate = () => {
    const created = new Date(profile.createdAt || Date.now());
    created.setFullYear(created.getFullYear() + 5);
    return created.toLocaleDateString('pt-BR');
  };

  const getBirthDate = () => {
    const today = new Date();
    today.setFullYear(today.getFullYear() - (profile.age || 20));
    return today.toLocaleDateString('pt-BR');
  };

  const getCategory = () => {
    if (profile.segment === Segment.BOTH) return 'D E';
    if (profile.segment === Segment.BUS) return 'D';
    return 'E';
  };

  return (
    <>
      <div className="relative group max-w-[280px] sm:max-w-sm mx-auto animate-in fade-in duration-500">
        <div className="absolute -inset-1 rounded-[35px] blur-lg opacity-20 group-hover:opacity-40 transition" style={{ backgroundColor: primaryColor }}></div>
        <div className={`relative glass rounded-[30px] overflow-hidden border ${isGrouping ? 'border-yellow-500/30' : 'border-white/10'} shadow-xl`}>
          
          <div className="h-32 sm:h-40 relative flex items-center justify-center" style={{ backgroundColor: `${primaryColor}15` }}>
            {isBusiness ? (
              <div className="relative z-10 w-full px-4 flex flex-col items-center">
                <div className={`rounded-xl overflow-hidden border-2 ${isGrouping ? 'border-yellow-500 shadow-lg' : 'border-white/20'} bg-slate-900 ${isGrouping ? 'w-32 sm:w-40 aspect-[3/2]' : 'w-16 h-16 sm:w-20 sm:h-20'}`}>
                  {profile.flagUrl || profile.logoUrl ? (
                    <img src={profile.flagUrl || profile.logoUrl} className="w-full h-full object-cover" alt="Logo" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><Globe className="text-slate-700 w-8 h-8" /></div>
                  )}
                </div>
              </div>
            ) : (
              <ShieldCheck className="w-12 h-12 text-white/10" />
            )}
          </div>

          <div className={`px-6 pb-8 ${isBusiness ? 'pt-6' : '-mt-12'} text-center relative z-10`}>
            {!isBusiness && (
              <div className="inline-block relative mb-4">
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-[30px] overflow-hidden border-4 border-[#020617] shadow-xl bg-slate-900">
                  <img src={profile.photoUrl} alt={profile.name} className="w-full h-full object-cover" />
                </div>
              </div>
            )}

            <div className="space-y-1 mb-6">
              <h2 className="text-lg sm:text-xl font-gaming font-black text-white uppercase truncate px-2 leading-tight">{profile.name}</h2>
              <p className="text-[8px] font-black uppercase tracking-widest opacity-60" style={{ color: primaryColor }}>
                {profile.category.replace(/_/g, ' ')}
              </p>
            </div>

            <button onClick={() => setShowDoc(true)} className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[9px] font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95">
              <FileText className="w-4 h-4" /> {isBusiness ? 'CERTIFICADO' : 'CNH DIGITAL'}
            </button>
          </div>
        </div>
      </div>

      {showDoc && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-lg md:max-w-2xl animate-in zoom-in-95 flex flex-col gap-4 py-8">
            <div className="flex justify-end">
              <button onClick={() => setShowDoc(false)} className="w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-red-600 text-white rounded-full transition-all border border-white/10"><X className="w-5 h-5" /></button>
            </div>

            {isBusiness ? (
              <div className="bg-[#1e293b] rounded-3xl p-8 md:p-12 border-4 border-[#334155] shadow-2xl relative overflow-hidden">
                <div className="relative z-10 text-center space-y-8">
                   <div className="flex flex-col items-center gap-4">
                      <div className="p-4 bg-yellow-500/10 rounded-full border-2 border-yellow-500/50">
                         <Award className="w-10 h-10 text-yellow-500" />
                      </div>
                      <h1 className="text-xl md:text-2xl font-gaming font-black text-white uppercase tracking-tighter">Certificado de Registro</h1>
                   </div>
                   <div className="space-y-4">
                      <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Organização Autorizada:</p>
                      <h2 className="text-xl md:text-3xl font-black text-white uppercase">{profile.companyName}</h2>
                      <div className="text-2xl md:text-4xl font-mono font-black text-blue-500 tracking-wider py-4 bg-black/30 rounded-2xl">{profile.cnpj || 'CERT-REG-OFFICIAL'}</div>
                   </div>
                   <div className="flex justify-between border-t border-white/5 pt-8">
                      <div className="text-left">
                         <span className="block text-[7px] font-black text-slate-500 uppercase">Emissão</span>
                         <span className="text-white text-xs font-bold">{new Date(profile.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="text-right">
                         <span className="block text-[7px] font-black text-slate-500 uppercase">Validade</span>
                         <span className="text-white text-xs font-bold">{getExpiryDate()}</span>
                      </div>
                   </div>
                </div>
              </div>
            ) : (
              <div className="cnh-digital rounded-xl overflow-hidden shadow-2xl flex flex-col select-none max-w-md mx-auto w-full">
                 <div className="cnh-header">
                    <p className="text-[6px] font-bold tracking-widest opacity-80 uppercase">República Federativa do Brasil</p>
                    <p className="text-[8px] font-black tracking-tight uppercase">Carteira Nacional de Habilitação</p>
                 </div>
                 
                 <div className="p-4 bg-[#e8f3e5] space-y-3">
                    <div className="border-b border-black/10 pb-2">
                       <p className="cnh-field-label">Nome</p>
                       <p className="cnh-field-value">{profile.name}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <div className="border-b border-black/10 pb-2">
                          <p className="cnh-field-label">Doc. Identidade</p>
                          <p className="cnh-field-value">CTSPRO-{profile.uid.slice(0, 8)}</p>
                       </div>
                       <div className="border-b border-black/10 pb-2">
                          <p className="cnh-field-label">CPF</p>
                          <p className="cnh-field-value">***.***.***-**</p>
                       </div>
                       <div className="border-b border-black/10 pb-2">
                          <p className="cnh-field-label">Data Nascimento</p>
                          <p className="cnh-field-value">{getBirthDate()}</p>
                       </div>
                       <div className="border-b border-black/10 pb-2">
                          <p className="cnh-field-label">Nº Registro</p>
                          <p className="cnh-field-value">{profile.cnh || '00000000000'}</p>
                       </div>
                    </div>

                    <div className="flex gap-4">
                       <div className="w-24 h-32 rounded-lg overflow-hidden border-2 border-black/10 bg-white">
                          <img src={profile.photoUrl} className="w-full h-full object-cover grayscale" alt="" />
                       </div>
                       <div className="flex-1 space-y-3">
                          <div className="border-b border-black/10 pb-2 flex justify-between items-end">
                             <div>
                                <p className="cnh-field-label">Validade</p>
                                <p className="cnh-field-value">{getExpiryDate()}</p>
                             </div>
                             <div className="text-right">
                                <p className="cnh-field-label">Cat.</p>
                                <p className="text-3xl font-black">{getCategory()}</p>
                             </div>
                          </div>
                          <div className="flex items-center justify-center p-2 bg-white rounded-lg border border-black/5">
                             <QrCode className="w-12 h-12 opacity-80" />
                          </div>
                       </div>
                    </div>

                    <div className="text-center pt-2">
                       <p className="cnh-field-label italic">Assinatura Digital do Condutor</p>
                       <p className="font-signature text-xl opacity-60">{profile.name.split(' ')[0]}</p>
                    </div>
                 </div>
                 
                 <div className="bg-[#1a3a16] p-2 text-center">
                    <p className="text-[6px] font-black text-white/50 uppercase tracking-[0.5em]">Conselho Nacional de Trânsito - CTSPRO</p>
                 </div>
              </div>
            )}

            <button onClick={() => setShowDoc(false)} className="w-full py-4 bg-blue-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl">FECHAR DOCUMENTO</button>
          </div>
        </div>
      )}
    </>
  );
};

export default Badge;


import React, { useState } from 'react';
import { UserProfile, UserCategory, UserStatus, Platform, Segment } from '../types';
import { PLATFORMS } from '../constants';
import { 
  Camera, Upload, Building2, ShieldCheck, Flag, Mail, 
  Calendar, Layout, Truck, Bus, AlertCircle, CheckCircle,
  Gamepad2, Layers, Loader2, PartyPopper, FileText, ArrowRight,
  ArrowLeft, RefreshCw, Smartphone, UserPlus, X, ChevronLeft
} from 'lucide-react';

const FOUNDER_EMAIL = 'ctsproadmim@gmail.com';

interface ProfileSetupProps {
  user: any;
  onComplete: (profile: UserProfile) => void;
  onBack?: () => void;
}

const ProfileSetup: React.FC<ProfileSetupProps> = ({ user, onComplete, onBack }) => {
  const [step, setStep] = useState<'form' | 'saving' | 'success'>('form');
  const [generatedProfile, setGeneratedProfile] = useState<UserProfile | null>(null);

  const CTS_LOGO = "https://i.postimg.cc/q7fWdwyL/cts-logo.png";

  // Estados do Formulário
  const [category, setCategory] = useState<UserCategory>(UserCategory.DRIVER);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [segment, setSegment] = useState<Segment | ''>('');
  const [age, setAge] = useState<number | ''>('');
  const [name, setName] = useState(user.name || '');
  const [companyName, setCompanyName] = useState('');
  const [description, setDescription] = useState('');
  const [brandColor, setBrandColor] = useState('#2563eb');
  
  // Estados de Mídia
  const [photoPreview, setPhotoPreview] = useState<string>(user.photoURL || '');
  const [mediaPreview, setMediaPreview] = useState<string | undefined>(undefined);
  
  const [touched, setTouched] = useState(false);

  // Lógicas de UI
  const isGrouping = category === UserCategory.GROUPING;
  const isBusiness = [UserCategory.ENTREPRENEUR, UserCategory.AUTONOMOUS, UserCategory.GROUPING].includes(category);
  
  const isFormValid = 
    name.trim().length >= 3 &&
    age !== '' && Number(age) >= 18 &&
    platforms.length > 0 &&
    segment !== '' &&
    photoPreview !== '' &&
    (isBusiness ? (mediaPreview !== undefined && companyName.trim().length >= 3) : true);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'photo' | 'media') => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("O arquivo excede o limite de 2MB!");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'photo') setPhotoPreview(reader.result as string);
        else setMediaPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const togglePlatform = (p: Platform) => {
    if (platforms.includes(p)) {
      setPlatforms(platforms.filter(item => item !== p));
    } else {
      setPlatforms([...platforms, p]);
    }
  };

  const generateCNPJ = () => {
    const n = () => Math.floor(Math.random() * 9);
    return `${n()}${n()}.${n()}${n()}${n()}.${n()}${n()}${n()}/0001-${n()}${n()}`;
  };

  const generateCNH = () => {
    let cnh = "";
    for(let i=0; i<11; i++) cnh += Math.floor(Math.random() * 10);
    return cnh;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);

    if (!isFormValid) return;

    setStep('saving');

    // Sincronização Simulada
    await new Promise(resolve => setTimeout(resolve, 2500));

    // Trava Mestra: O Fundador entra APROVADO (Case Insensitive)
    const isFounder = user.email.toLowerCase() === FOUNDER_EMAIL.toLowerCase();

    const newProfile: UserProfile = {
      uid: user.uid,
      email: user.email.toLowerCase(),
      name: name,
      age: Number(age),
      category: category,
      roleId: isFounder ? 'master_founder' : 'default_user',
      status: isFounder ? UserStatus.APPROVED : UserStatus.PENDING,
      platforms: platforms,
      segment: segment as Segment,
      photoUrl: photoPreview,
      companyName: isBusiness ? companyName : (category === UserCategory.AUTONOMOUS ? 'AUTÔNOMO' : ''),
      brandColor: brandColor,
      createdAt: new Date().toISOString(),
      description: description
    };

    if (isGrouping) newProfile.flagUrl = mediaPreview;
    else if (isBusiness) newProfile.logoUrl = mediaPreview;

    if (isBusiness) newProfile.cnpj = generateCNPJ();
    else newProfile.cnh = generateCNH();

    setGeneratedProfile(newProfile);
    setStep('success');
  };

  if (step === 'saving') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020617] bg-grid">
        <div className="flex flex-col items-center gap-8 text-center px-6">
          <div className="relative">
            <Loader2 className="w-24 h-24 text-blue-500 animate-spin" />
            <Smartphone className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-white" />
          </div>
          <div className="space-y-3">
            <h2 className="text-3xl font-gaming font-black text-white uppercase tracking-tighter">Sincronizando Dados</h2>
            <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.4em] max-w-sm">
              Conectando ao Firestore e registrando credenciais globais de simulação...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'success' && generatedProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-grid p-6">
        <div className="w-full max-w-4xl glass p-12 md:p-20 rounded-[60px] shadow-2xl text-center space-y-10 animate-in fade-in zoom-in duration-700 relative overflow-hidden border border-blue-500/20">
          <div className="absolute top-0 left-0 w-full h-2" style={{ backgroundColor: brandColor }}></div>
          <div className="mb-4 flex justify-center">
            <div className="w-24 h-24 rounded-full border-2 border-blue-500/30 bg-slate-900 shadow-2xl flex items-center justify-center overflow-hidden">
               <img src={CTS_LOGO} className="w-full h-full object-contain p-1" alt="" />
            </div>
          </div>
          <PartyPopper className="w-16 h-16 text-blue-500 mx-auto animate-bounce" />
          <div className="space-y-4">
             <h2 className="text-5xl font-gaming font-black text-white uppercase tracking-tighter text-glow">Acesso Confirmado!</h2>
             <p className="text-slate-400 font-bold text-sm uppercase tracking-widest leading-loose">
               Seus dados de Plataforma e Segmento foram vinculados ao e-mail <span className="text-white">{generatedProfile.email}</span>.
             </p>
          </div>
          <button 
            onClick={() => onComplete(generatedProfile)}
            className="w-full py-8 bg-blue-600 text-white font-black uppercase tracking-[0.6em] rounded-[30px] hover:bg-blue-500 transition-all shadow-2xl flex items-center justify-center gap-4 group"
          >
             <span>INICIALIZAR DASHBOARD</span>
             <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 flex items-center justify-center bg-grid py-20 relative overflow-hidden">
      
      {/* Botão de Voltar Global */}
      <div className="fixed top-10 left-10 z-[100]">
        <button 
          onClick={onBack}
          className="p-5 bg-white/5 border border-white/10 rounded-full text-slate-400 hover:text-white hover:bg-red-600 transition-all group"
        >
          <ChevronLeft className="w-8 h-8 group-hover:-translate-x-1 transition-transform" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-5xl glass p-8 md:p-16 rounded-[60px] shadow-2xl space-y-12 border border-white/10 relative z-10 animate-in fade-in zoom-in duration-500">
        
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-10 border-b border-white/5">
           <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-blue-600 shadow-lg shadow-blue-600/20">
                 <img src={photoPreview || user.photoURL} alt="User" className="w-full h-full object-cover" />
              </div>
              <div>
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Mail className="w-3 h-3 text-blue-500" /> Registro Autenticado
                 </p>
                 <p className="text-lg font-black text-white">{user.email}</p>
              </div>
           </div>
           
           {/* Logo CTS no Setup */}
           <div className="w-20 h-20 rounded-full border border-blue-500/20 bg-slate-900 shadow-xl flex items-center justify-center overflow-hidden">
              <img src={CTS_LOGO} className="w-full h-full object-contain p-1.5" alt="" />
           </div>

           <button 
             type="button" 
             onClick={onBack}
             className="px-6 py-3 bg-red-600/10 border border-red-500/20 rounded-2xl text-[10px] font-black text-red-500 hover:bg-red-600 hover:text-white transition-all uppercase tracking-widest flex items-center gap-3"
           >
              <RefreshCw className="w-4 h-4" /> Trocar Conta
           </button>
        </div>

        <div className="text-center">
           <h2 className="text-5xl font-gaming font-black text-white uppercase mb-4 tracking-tighter">Registro de Piloto</h2>
           <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em]">Complete sua ficha técnica global no CTSPRO</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 flex items-center gap-2">
                 <UserPlus className="w-3 h-3 text-blue-500" /> Nome Completo
              </label>
              <input 
                type="text" 
                required 
                placeholder="Seu nome no simulador"
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                className={`w-full bg-slate-900 border rounded-2xl px-6 py-4 font-bold text-white outline-none transition-all ${touched && name.trim().length < 3 ? 'border-red-500' : 'border-slate-800 focus:border-blue-500'}`} 
              />
           </div>

           <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 flex items-center gap-2">
                 <Calendar className="w-3 h-3 text-blue-500" /> Idade (Mín. 18)
              </label>
              <input 
                type="number" 
                required 
                placeholder="Ex: 25"
                value={age} 
                onChange={(e) => setAge(e.target.value === '' ? '' : parseInt(e.target.value))} 
                className={`w-full bg-slate-900 border rounded-2xl px-6 py-4 font-bold text-white outline-none transition-all ${touched && (age === '' || Number(age) < 18) ? 'border-red-500' : 'border-slate-800 focus:border-blue-500'}`} 
              />
           </div>

           <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 flex items-center gap-2">
                 <Layout className="w-3 h-3 text-blue-500" /> Perfil de Usuário
              </label>
              <select 
                value={category} 
                onChange={(e) => { setCategory(e.target.value as UserCategory); setMediaPreview(undefined); }} 
                className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-6 py-4 font-bold text-white outline-none focus:border-blue-500 appearance-none shadow-xl"
              >
                <option value={UserCategory.DRIVER}>Motorista Freelancer</option>
                <option value={UserCategory.ENTREPRENEUR}>Empresário Logístico</option>
                <option value={UserCategory.AUTONOMOUS}>Motorista Autônomo</option>
                <option value={UserCategory.GROUPING}>Líder de Agrupamento</option>
              </select>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 bg-white/[0.02] p-8 rounded-[40px] border border-white/5">
           <div className="space-y-6">
              <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-2">
                 <Gamepad2 className="w-4 h-4" /> 3. Seleção de Plataformas Principal
              </label>
              <div className={`grid grid-cols-2 sm:grid-cols-3 gap-3 ${touched && platforms.length === 0 ? 'p-1 rounded-2xl border-2 border-red-500' : ''}`}>
                 {PLATFORMS.map(p => (
                   <button
                     key={p.id}
                     type="button"
                     onClick={() => togglePlatform(p.id as Platform)}
                     className={`px-4 py-4 rounded-xl text-[9px] font-black uppercase tracking-tighter border transition-all ${platforms.includes(p.id as Platform) ? 'bg-blue-600 border-blue-400 text-white shadow-lg' : 'bg-slate-900 border-slate-800 text-slate-600 hover:border-slate-700'}`}
                   >
                     {p.id}
                   </button>
                 ))}
              </div>
           </div>

           <div className="space-y-6">
              <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-2">
                 <Layers className="w-4 h-4" /> 4. Seleção de Segmento de Atuação
              </label>
              <div className="grid grid-cols-1 gap-4">
                 {[
                   { id: Segment.TRUCK, label: 'Caminhão', icon: <Truck className="w-5 h-5" /> },
                   { id: Segment.BUS, label: 'Ônibus', icon: <Bus className="w-5 h-5" /> },
                   { id: Segment.BOTH, label: 'Ambos (Full Logistcs)', icon: <CheckCircle className="w-5 h-5" /> }
                 ].map(seg => (
                   <button
                     key={seg.id}
                     type="button"
                     onClick={() => setSegment(seg.id)}
                     className={`w-full px-6 py-5 rounded-2xl border flex items-center justify-between transition-all ${segment === seg.id ? 'bg-indigo-600 border-indigo-400 text-white shadow-xl' : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700'}`}
                   >
                     <div className="flex items-center gap-4">
                        {seg.icon}
                        <span className="text-xs font-black uppercase tracking-widest">{seg.label}</span>
                     </div>
                     {segment === seg.id && <CheckCircle className="w-5 h-5" />}
                   </button>
                 ))}
              </div>
           </div>
        </div>

        <div className="flex flex-col lg:flex-row items-center justify-center gap-16 py-10 border-y border-white/5">
           <div className="text-center space-y-4">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Foto de Perfil</span>
              <div className="relative group w-44 h-44 rounded-[50px] overflow-hidden border-4 border-slate-800 bg-slate-900 mx-auto group-hover:border-blue-500 transition-all">
                 {photoPreview ? <img src={photoPreview} className="w-full h-full object-cover" alt="" /> : <Camera className="w-12 h-12 text-slate-700 m-auto mt-12" />}
                 <label className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white">
                    <Camera className="w-8 h-8 mb-2" />
                    <span className="text-[8px] font-black uppercase">Alterar</span>
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'photo')} />
                 </label>
              </div>
           </div>

           {isBusiness && (
              <div className="text-center space-y-4 animate-in zoom-in duration-500">
                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">
                   {isGrouping ? 'Carregar Bandeira (3:2)' : 'Carregar Logotipo (1:1)'}
                 </span>
                 <div className={`relative group overflow-hidden border-4 border-slate-800 border-dashed bg-slate-900/30 flex items-center justify-center transition-all ${isGrouping ? 'w-72 aspect-[3/2] rounded-[30px]' : 'w-44 h-44 rounded-[50px]'}`}>
                    {mediaPreview ? <img src={mediaPreview} className="w-full h-full object-cover" alt="" /> : (
                      <div className="text-center space-y-2">
                        <Upload className="w-10 h-10 text-slate-700 mx-auto" />
                        <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">OBRIGATÓRIO</p>
                      </div>
                    )}
                    <label className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white">
                       <Upload className="w-8 h-8 mb-2" />
                       <span className="text-[8px] font-black uppercase">Subir Arquivo</span>
                       <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'media')} />
                    </label>
                 </div>
              </div>
           )}
        </div>

        {isBusiness && (
           <div className="space-y-4 animate-in slide-in-from-bottom duration-500">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 flex items-center gap-2">
                 <Building2 className="w-3 h-3 text-blue-500" /> {isGrouping ? 'Nome do Agrupamento' : 'Razão Social da Empresa'}
              </label>
              <input 
                type="text" 
                required 
                placeholder={isGrouping ? "Ex: Comando da Noite" : "Ex: TransLog Brasil"}
                value={companyName} 
                onChange={(e) => setCompanyName(e.target.value)} 
                className={`w-full bg-slate-900 border rounded-2xl px-6 py-4 font-bold text-white outline-none transition-all ${touched && companyName.trim().length < 3 ? 'border-red-500' : 'border-slate-800 focus:border-blue-500'}`} 
              />
           </div>
        )}

        <div className="pt-10">
          {!isFormValid && touched && (
            <div className="mb-6 flex items-center gap-4 text-red-500 bg-red-500/10 p-5 rounded-2xl border border-red-500/20 animate-in shake duration-300">
               <AlertCircle className="w-6 h-6 flex-shrink-0" />
               <p className="text-[10px] font-black uppercase tracking-widest">Erro: Verifique Plataforma, Segmento, Idade (18+) e Fotos.</p>
            </div>
          )}

          <button 
            type="submit" 
            disabled={!isFormValid && touched}
            onClick={() => setTouched(true)}
            className={`w-full py-8 text-white font-black uppercase tracking-[0.6em] rounded-[30px] transition-all duration-500 shadow-2xl flex items-center justify-center gap-5 ${
              isFormValid 
                ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/30' 
                : 'bg-slate-800 text-slate-600 cursor-not-allowed opacity-70'
            }`}
          >
             {isFormValid ? <CheckCircle className="w-7 h-7" /> : <ShieldCheck className="w-7 h-7" />}
             <span>FINALIZAR REGISTRO GLOBAL</span>
          </button>
          
          <p className="text-center text-[9px] font-black text-slate-700 uppercase tracking-[0.5em] mt-8 italic">
             Sincronização Cloud Firestore v4.2 - Todos os direitos reservados
          </p>
        </div>
      </form>
    </div>
  );
};

export default ProfileSetup;

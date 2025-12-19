
import React, { useState, useEffect } from 'react';
import { UserProfile, Trip, Platform, UserCategory, Segment } from '../types';
import { PLATFORMS } from '../constants';
import { 
  Camera, 
  AlertCircle, 
  CheckCircle2, 
  MapPin, 
  Calendar, 
  DollarSign, 
  X, 
  Check, 
  Truck, 
  ArrowRight, 
  User, 
  Package, 
  Flag, 
  ShieldCheck, 
  Fingerprint, 
  SearchCheck,
  Gamepad2,
  Layers,
  Building2
} from 'lucide-react';

interface TripLogProps {
  profile: UserProfile;
}

const TripLog: React.FC<TripLogProps> = ({ profile }) => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Estado para os previews das imagens
  const [previews, setPreviews] = useState<{ initial?: string; final?: string }>({});

  const [formData, setFormData] = useState({
    origin: '',
    destination: '',
    date: new Date().toISOString().split('T')[0],
    value: '', // Armazenado como string formatada para UI
    platform: profile.platforms[0] || Platform.WTDS,
    segment: profile.segment || Segment.TRUCK
  });

  useEffect(() => {
    const savedTrips = JSON.parse(localStorage.getItem('ctspro_trips_db') || '[]');
    const isMaster = profile.email === 'ctsproadmim@gmail.com';
    const isOwner = profile.category === UserCategory.ENTREPRENEUR || profile.category === UserCategory.GROUPING;

    if (isMaster) {
      setTrips(savedTrips);
    } else if (isOwner) {
      setTrips(savedTrips.filter((t: Trip) => t.companyName === profile.companyName));
    } else {
      setTrips(savedTrips.filter((t: Trip) => t.driverUid === profile.uid));
    }
  }, [profile]);

  const formatCurrency = (val: string) => {
    let cleanValue = val.replace(/\D/g, "");
    if (!cleanValue) return "";
    let numberValue = (parseInt(cleanValue) / 100).toFixed(2);
    return numberValue.replace(".", ",");
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrency(e.target.value);
    setFormData({ ...formData, value: formatted });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'initial' | 'final') => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviews(prev => ({ ...prev, [type]: url }));
    }
  };

  const calculateHash = async (file: File) => {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const initialInput = document.getElementById('trip_img_initial') as HTMLInputElement;
    const finalInput = document.getElementById('trip_img_final') as HTMLInputElement;
    
    const fileInitial = initialInput?.files?.[0];
    const fileFinal = finalInput?.files?.[0];

    if (!fileInitial || !fileFinal) {
      setError('SISTEMA BLOQUEADO: Ambos os comprovantes são obrigatórios para auditoria.');
      setLoading(false);
      return;
    }

    try {
      const hashInitial = await calculateHash(fileInitial);
      const hashFinal = await calculateHash(fileFinal);
      
      const allTrips = JSON.parse(localStorage.getItem('ctspro_trips_db') || '[]');
      
      const duplicateDetected = allTrips.some((t: Trip) => 
        t.imageHashInitial === hashInitial || 
        t.imageHashFinal === hashInitial || 
        t.imageHashInitial === hashFinal || 
        t.imageHashFinal === hashFinal
      );

      if (duplicateDetected) {
        setError('TENTATIVA DE FRAUDE: Esta imagem já foi utilizada em outra viagem.');
        setLoading(false);
        return;
      }

      const newTrip: Trip = {
        id: 't_' + Math.random().toString(36).substr(2, 9),
        driverUid: profile.uid,
        driverName: profile.name,
        companyName: profile.companyName,
        origin: formData.origin,
        destination: formData.destination,
        date: formData.date,
        value: parseFloat(formData.value.replace(',', '.')),
        platform: formData.platform as Platform,
        segment: formData.segment as Segment,
        imageHashInitial: hashInitial,
        imageHashFinal: hashFinal,
        photoUrlInitial: previews.initial!,
        photoUrlFinal: previews.final!
      };

      const updatedTrips = [newTrip, ...allTrips];
      localStorage.setItem('ctspro_trips_db', JSON.stringify(updatedTrips));
      
      setTrips(prev => [newTrip, ...prev]);
      setIsAdding(false);
      setLoading(false);
      setPreviews({});
      setFormData({
        ...formData,
        origin: '',
        destination: '',
        value: ''
      });
    } catch (err) {
      setError('ERRO DE PROCESSAMENTO: Falha ao validar imagens.');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20">
      
      <div className="flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="space-y-3 text-center md:text-left">
          <div className="inline-flex items-center gap-2 bg-blue-600/10 border border-blue-500/20 px-3 py-1 rounded-full text-[8px] font-black text-blue-400 uppercase tracking-widest">
            <ShieldCheck className="w-3 h-3" /> Monitoramento SHA-256 Ativo
          </div>
          <h2 className="text-5xl font-gaming font-black text-white tracking-tighter uppercase leading-none">Diário de<br/><span className="text-blue-500">Logística</span></h2>
          <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.5em]">
            {profile.category === UserCategory.ENTREPRENEUR ? `Auditando Empresa: ${profile.companyName}` : 'Seus Registros Individuais'}
          </p>
        </div>
        <button 
          onClick={() => {
            setIsAdding(!isAdding);
            if (!isAdding) setError('');
          }}
          className={`px-10 py-5 rounded-2xl flex items-center gap-4 font-black text-xs uppercase transition-all shadow-2xl ${
            isAdding 
              ? 'bg-red-600/10 text-red-500 border border-red-500/20' 
              : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20'
          }`}
        >
          {isAdding ? <><X className="w-5 h-5" /> Cancelar Lançamento</> : <><Camera className="w-5 h-5" /> Lançar Nova Viagem</>}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="glass p-10 md:p-14 rounded-[50px] border border-blue-500/30 space-y-10 animate-in slide-in-from-top duration-500 shadow-[0_0_80px_rgba(37,99,235,0.1)] relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Fingerprint className="w-40 h-40 text-blue-500" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
            {/* Campos Travados: Motorista e Empresa */}
            <div className="space-y-4">
              <label className="text-[10px] font-black text-blue-500 uppercase tracking-widest px-2 flex items-center gap-2">
                 <User className="w-3 h-3" /> Motorista Identificado
              </label>
              <div className="w-full bg-slate-900/50 border border-white/5 rounded-2xl px-8 py-5 font-black text-sm text-slate-300 uppercase tracking-widest flex items-center gap-3">
                 <ShieldCheck className="w-4 h-4 text-blue-600" />
                 {profile.name}
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-blue-500 uppercase tracking-widest px-2 flex items-center gap-2">
                 <Building2 className="w-3 h-3" /> Empresa / Vínculo
              </label>
              <div className="w-full bg-slate-900/50 border border-white/5 rounded-2xl px-8 py-5 font-black text-sm text-slate-300 uppercase tracking-widest flex items-center gap-3">
                 <Flag className="w-4 h-4 text-blue-600" />
                 {profile.companyName || 'AUTÔNOMO'}
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 flex items-center gap-2">
                 <MapPin className="w-3 h-3 text-blue-500" /> Origem da Carga
              </label>
              <input type="text" required placeholder="Cidade/Estado de Coleta" className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-8 py-5 focus:ring-4 focus:ring-blue-500/20 outline-none font-bold text-sm text-white shadow-inner transition-all focus:border-blue-500" value={formData.origin} onChange={e => setFormData({...formData, origin: e.target.value})} />
            </div>
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 flex items-center gap-2">
                 <ArrowRight className="w-3 h-3 text-blue-500" /> Destino de Entrega
              </label>
              <input type="text" required placeholder="Cidade/Estado de Entrega" className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-8 py-5 focus:ring-4 focus:ring-blue-500/20 outline-none font-bold text-sm text-white shadow-inner transition-all focus:border-blue-500" value={formData.destination} onChange={e => setFormData({...formData, destination: e.target.value})} />
            </div>
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 flex items-center gap-2">
                 <Calendar className="w-3 h-3 text-blue-500" /> Data da Operação
              </label>
              <input type="date" required className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-8 py-5 focus:ring-4 focus:ring-blue-500/20 outline-none font-bold text-sm text-white shadow-inner transition-all focus:border-blue-500" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
            </div>
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 flex items-center gap-2">
                 <DollarSign className="w-3 h-3 text-blue-500" /> Valor do Frete Líquido (R$)
              </label>
              <input type="text" required placeholder="0,00" className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-8 py-5 focus:ring-4 focus:ring-blue-500/20 outline-none font-bold text-sm text-white shadow-inner font-mono transition-all focus:border-blue-500" value={formData.value} onChange={handleValueChange} />
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 flex items-center gap-2">
                 <Gamepad2 className="w-3 h-3 text-blue-500" /> Plataforma Utilizada
              </label>
              <select 
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-8 py-5 font-bold text-sm text-white focus:border-blue-500 outline-none appearance-none cursor-pointer"
                value={formData.platform}
                onChange={e => setFormData({...formData, platform: e.target.value as Platform})}
              >
                {PLATFORMS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 flex items-center gap-2">
                 <Layers className="w-3 h-3 text-blue-500" /> Segmento da Viagem
              </label>
              <select 
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-8 py-5 font-bold text-sm text-white focus:border-blue-500 outline-none appearance-none cursor-pointer"
                value={formData.segment}
                onChange={e => setFormData({...formData, segment: e.target.value as Segment})}
              >
                <option value={Segment.TRUCK}>Caminhão</option>
                <option value={Segment.BUS}>Ônibus</option>
                <option value={Segment.BOTH}>Misto (Caminhão & Ônibus)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-6">
              <div className="flex justify-between items-center px-2">
                <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-2">
                  <Package className="w-4 h-4" /> 1. Comprovante Inicial
                </label>
                <span className="text-[8px] font-bold text-slate-600 uppercase">Print da Carga</span>
              </div>
              <div className="relative group h-44">
                  <label className="flex flex-col items-center justify-center w-full h-full border-2 border-slate-800 border-dashed rounded-[35px] cursor-pointer bg-slate-950/30 hover:bg-slate-900 hover:border-blue-500/50 transition-all shadow-inner overflow-hidden">
                      {previews.initial ? (
                        <img src={previews.initial} className="w-full h-full object-cover animate-in fade-in" alt="Preview Inicial" />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-slate-600 group-hover:text-blue-400 text-center space-y-3">
                          <Camera className="w-10 h-10 transition-transform group-hover:scale-110" />
                          <p className="text-[9px] font-black uppercase tracking-[0.2em]">Upload do Comprovante</p>
                        </div>
                      )}
                      <input id="trip_img_initial" type="file" className="hidden" accept="image/*" onChange={e => handleImageChange(e, 'initial')} />
                  </label>
                  {previews.initial && (
                    <button type="button" onClick={() => setPreviews({...previews, initial: undefined})} className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full z-20"><X className="w-3 h-3"/></button>
                  )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex justify-between items-center px-2">
                <label className="text-[10px] font-black text-green-400 uppercase tracking-widest flex items-center gap-2">
                  <Flag className="w-4 h-4" /> 2. Print Final
                </label>
                <span className="text-[8px] font-bold text-slate-600 uppercase">Print da Entrega</span>
              </div>
              <div className="relative group h-44">
                  <label className="flex flex-col items-center justify-center w-full h-full border-2 border-slate-800 border-dashed rounded-[35px] cursor-pointer bg-slate-950/30 hover:bg-slate-900 hover:border-green-500/50 transition-all shadow-inner overflow-hidden">
                      {previews.final ? (
                        <img src={previews.final} className="w-full h-full object-cover animate-in fade-in" alt="Preview Final" />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-slate-600 group-hover:text-green-400 text-center space-y-3">
                          <Camera className="w-10 h-10 transition-transform group-hover:scale-110" />
                          <p className="text-[9px] font-black uppercase tracking-[0.2em]">Upload da Entrega</p>
                        </div>
                      )}
                      <input id="trip_img_final" type="file" className="hidden" accept="image/*" onChange={e => handleImageChange(e, 'final')} />
                  </label>
                  {previews.final && (
                    <button type="button" onClick={() => setPreviews({...previews, final: undefined})} className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full z-20"><X className="w-3 h-3"/></button>
                  )}
              </div>
            </div>
          </div>

          <div className="bg-slate-900/50 border border-white/5 p-6 rounded-3xl flex items-start gap-4">
            <SearchCheck className="w-6 h-6 text-blue-500 flex-shrink-0" />
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
              Nosso sistema utiliza <span className="text-white">Assinatura Digital SHA-256</span>. Prints editados, cortados ou repetidos serão bloqueados automaticamente.
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 p-8 rounded-[35px] flex items-center gap-6 text-red-500 text-[10px] font-black uppercase tracking-widest animate-in shake duration-300">
              <AlertCircle className="w-10 h-10 flex-shrink-0" />
              <div className="flex-1 leading-loose">{error}</div>
            </div>
          )}

          <button type="submit" disabled={loading} className="w-full py-8 bg-blue-600 hover:bg-blue-500 rounded-[30px] font-black uppercase tracking-[0.6em] flex items-center justify-center gap-5 transition-all disabled:opacity-50 shadow-2xl shadow-blue-600/30 active:scale-95">
            {loading ? <><div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin"></div> EXECUTANDO VARREDURA...</> : <><ShieldCheck className="w-7 h-7" /> VALIDAR E SINCRONIZAR VIAGEM</>}
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 gap-6">
        {trips.map(trip => (
          <div key={trip.id} className="glass p-8 rounded-[40px] border border-white/5 flex flex-col md:flex-row items-center gap-10 hover:border-blue-500/30 transition-all group hover:bg-white/[0.02] relative overflow-hidden">
            
            <div className="flex gap-4 flex-shrink-0 relative z-10">
                <div className="w-28 h-36 rounded-2xl overflow-hidden bg-slate-950 border border-white/10 shadow-2xl relative group/img cursor-zoom-in">
                  <img src={trip.photoUrlInitial} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt="Carregamento" />
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-blue-600/80 backdrop-blur-md px-3 py-1 rounded-lg">
                     <span className="text-[7px] font-black text-white uppercase tracking-widest">CARGA</span>
                  </div>
                </div>
                <div className="w-28 h-36 rounded-2xl overflow-hidden bg-slate-950 border border-white/10 shadow-2xl relative group/img cursor-zoom-in">
                  <img src={trip.photoUrlFinal} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt="Entrega" />
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-green-600/80 backdrop-blur-md px-3 py-1 rounded-lg">
                     <span className="text-[7px] font-black text-white uppercase tracking-widest">ENTREGA</span>
                  </div>
                </div>
            </div>

            <div className="flex-1 space-y-5 w-full text-center md:text-left relative z-10">
              <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
                <div>
                   <h4 className="font-gaming font-black text-2xl uppercase tracking-tighter text-white group-hover:text-blue-500 transition-colors">
                      {trip.origin} <span className="text-slate-700">→</span> {trip.destination}
                   </h4>
                   <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-5 gap-y-2 mt-2">
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5" /> {new Date(trip.date).toLocaleDateString()} 
                      </p>
                      <span className="hidden md:block w-1.5 h-1.5 bg-slate-800 rounded-full"></span>
                      <p className="text-[9px] font-black text-blue-500/70 uppercase tracking-[0.4em] flex items-center gap-2">
                        <User className="w-3.5 h-3.5" /> {trip.driverName}
                      </p>
                      <span className="hidden md:block w-1.5 h-1.5 bg-slate-800 rounded-full"></span>
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] bg-white/5 px-3 py-1 rounded-full">
                        {trip.platform} | {trip.segment}
                      </p>
                   </div>
                </div>
                <div className="text-right">
                   <div className="text-3xl font-mono text-green-500 font-black tracking-tighter">R$ {trip.value.toFixed(2).replace('.', ',')}</div>
                   <div className="text-[8px] font-black text-slate-700 uppercase tracking-[0.3em] mt-1">Auditado & Verificado</div>
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-5 border-t border-white/5">
                 <div className="flex flex-col gap-1.5 w-full md:w-auto">
                    <div className="text-[7px] font-mono text-slate-700 truncate max-w-[300px] uppercase">
                       ID_SHA_START: <span className="text-blue-500/50">{trip.imageHashInitial}</span>
                    </div>
                    <div className="text-[7px] font-mono text-slate-700 truncate max-w-[300px] uppercase">
                       ID_SHA_FINAL: <span className="text-green-500/50">{trip.imageHashFinal}</span>
                    </div>
                 </div>
                 <div className="flex items-center gap-4 bg-green-500/10 px-6 py-2 rounded-2xl border border-green-500/20 shadow-lg shadow-green-500/5">
                    <ShieldCheck className="w-5 h-5 text-green-500 animate-pulse" />
                    <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">STATUS: LEGALIZADO</span>
                 </div>
              </div>
            </div>
          </div>
        ))}
        {trips.length === 0 && !isAdding && (
          <div className="glass p-32 rounded-[60px] border border-white/5 text-center space-y-10 opacity-40">
            <div className="w-24 h-24 bg-slate-900 rounded-[40px] flex items-center justify-center mx-auto mb-8 border border-white/5">
               <Fingerprint className="w-12 h-12 text-slate-700" />
            </div>
            <div className="space-y-4">
              <p className="text-slate-500 font-black uppercase tracking-[0.5em] text-xs">Vazio: Nenhuma operação detectada.</p>
              <p className="text-[9px] font-bold text-slate-700 uppercase tracking-widest">Aguardando manifesto de carga sincronizado com dupla validação biométrica de imagem.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TripLog;

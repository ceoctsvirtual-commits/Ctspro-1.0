
import React, { useState, useEffect } from 'react';
import { Platform, Segment, UserProfile, UserStatus, UserCategory, Trip } from '../types';
import { Trophy, Medal, Award, Users, Building, Flag, Briefcase, Star, TrendingUp, Search, ShieldCheck, DollarSign, Package } from 'lucide-react';

interface RankedUser extends UserProfile {
  totalFreight: number;
  tripCount: number;
}

const Ranking: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<UserCategory>(UserCategory.DRIVER);
  const [platform, setPlatform] = useState<Platform>(Platform.WTDS);
  const [segment, setSegment] = useState<Segment>(Segment.TRUCK);
  const [rankedData, setRankedData] = useState<RankedUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const profilesDB: UserProfile[] = JSON.parse(localStorage.getItem('ctspro_profiles_db') || '[]');
    const tripsDB: Trip[] = JSON.parse(localStorage.getItem('ctspro_trips_db') || '[]');

    const filteredTrips = tripsDB.filter(t => {
      const matchPlatform = t.platform === platform;
      const matchSegment = segment === Segment.BOTH || t.segment === segment;
      return matchPlatform && matchSegment;
    });

    let results: RankedUser[] = [];

    if (activeCategory === UserCategory.DRIVER) {
      results = profilesDB
        .filter(u => u.status === UserStatus.APPROVED)
        .map(user => {
          const userTrips = filteredTrips.filter(t => t.driverUid === user.uid);
          const totalValue = userTrips.reduce((acc, trip) => acc + trip.value, 0);
          return { ...user, totalFreight: totalValue, tripCount: userTrips.length };
        })
        .filter(u => u.tripCount > 0 || u.category === UserCategory.DRIVER);
    } else if (activeCategory === UserCategory.ENTREPRENEUR) {
      const companyMap = new Map<string, RankedUser>();
      profilesDB.forEach(u => {
        if (u.category === UserCategory.ENTREPRENEUR && u.companyName) {
          const companyTrips = filteredTrips.filter(t => t.companyName === u.companyName);
          const total = companyTrips.reduce((acc, t) => acc + t.value, 0);
          companyMap.set(u.companyName, { ...u, totalFreight: total, tripCount: companyTrips.length });
        }
      });
      results = Array.from(companyMap.values());
    } else {
      results = profilesDB
        .filter(u => u.status === UserStatus.APPROVED && u.category === activeCategory)
        .map(user => {
          const userTrips = filteredTrips.filter(t => t.driverUid === user.uid);
          const totalValue = userTrips.reduce((acc, trip) => acc + trip.value, 0);
          return { ...user, totalFreight: totalValue, tripCount: userTrips.length };
        });
    }

    const filteredResults = results.filter(u => 
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (u.companyName?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

    const sorted = filteredResults.sort((a, b) => b.totalFreight - a.totalFreight || b.tripCount - a.tripCount);
    setRankedData(sorted);
  }, [platform, segment, activeCategory, searchTerm]);

  const categories = [
    { id: UserCategory.DRIVER, label: 'Motoristas', icon: <Users className="w-4 h-4" /> },
    { id: UserCategory.ENTREPRENEUR, label: 'Empresas', icon: <Building className="w-4 h-4" /> },
    { id: UserCategory.GROUPING, label: 'Agrupamentos', icon: <Flag className="w-4 h-4" /> },
    { id: UserCategory.AUTONOMOUS, label: 'Autônomos', icon: <Briefcase className="w-4 h-4" /> },
  ];

  const formatBRL = (val: number) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className="space-y-16 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col xl:flex-row justify-between xl:items-end gap-10">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 px-5 py-2 rounded-full text-[10px] font-black text-yellow-500 uppercase tracking-widest">
            <Star className="w-4 h-4 fill-current" /> Elite Global
          </div>
          <h2 className="text-6xl font-gaming font-black text-white tracking-tighter uppercase leading-none">Hall da<br/><span className="text-blue-500">Fama</span></h2>
        </div>
        <div className="flex flex-wrap gap-4 items-center">
          <div className="relative group w-full sm:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input type="text" placeholder="Buscar..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-12 pr-6 py-4 text-xs font-bold text-white outline-none" />
          </div>
          <select value={platform} onChange={(e) => setPlatform(e.target.value as Platform)} className="bg-slate-900 border border-slate-800 rounded-2xl px-6 py-4 text-[10px] font-black uppercase text-white outline-none">
            {Object.values(Platform).map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 p-2 bg-slate-900/50 rounded-3xl border border-white/5 w-fit mx-auto">
         {categories.map(cat => (
           <button key={cat.id} onClick={() => setActiveCategory(cat.id)} className={`flex items-center gap-3 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeCategory === cat.id ? 'bg-blue-600 text-white shadow-xl' : 'text-slate-500 hover:text-slate-300'}`}>
             {cat.icon} {cat.label}
           </button>
         ))}
      </div>

      <div className="glass rounded-[50px] border border-white/5 shadow-2xl overflow-hidden max-w-6xl mx-auto">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left">
            <thead className="bg-white/[0.02] text-slate-500 text-[9px] font-black uppercase tracking-[0.3em] border-b border-white/5">
              <tr>
                <th className="px-10 py-10">Posição</th>
                <th className="px-10 py-10">Membro / Operação</th>
                <th className="px-10 py-10">Viagens</th>
                <th className="px-10 py-10 text-right">Faturamento</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {rankedData.map((user, idx) => {
                // Prioridade de imagem: Se for aba empresa, busca logo primeiro. Se for motorista, busca foto primeiro.
                const displayImg = activeCategory === UserCategory.ENTREPRENEUR 
                  ? (user.logoUrl || user.flagUrl || user.photoUrl)
                  : (user.photoUrl || user.logoUrl || user.flagUrl);

                return (
                  <tr key={user.uid || user.companyName} className="hover:bg-white/[0.03] transition-all group">
                    <td className="px-10 py-8">
                      <span className={`text-2xl font-gaming font-black ${idx < 3 ? 'text-yellow-500' : 'text-slate-700'}`}>#{idx + 1}</span>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-4">
                         <img src={displayImg} className="w-10 h-10 rounded-xl object-cover" alt="" />
                         <div>
                            <div className="text-sm font-black text-white uppercase">{activeCategory === UserCategory.ENTREPRENEUR ? user.companyName : user.name}</div>
                            <div className="text-[8px] text-slate-500 font-bold uppercase">{user.category}</div>
                         </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <span className="text-sm font-mono font-black text-white">{user.tripCount}</span>
                    </td>
                    <td className="px-10 py-8 text-right">
                      <div className="text-lg font-mono font-black text-blue-500">{formatBRL(user.totalFreight)}</div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Ranking;

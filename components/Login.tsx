
import React, { useState, useEffect } from 'react';
import { Mail, Lock, LogIn, UserPlus, ShieldCheck, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';

interface LoginProps {
  onLogin: (email: string, password: string, isSignUp: boolean, rememberMe: boolean) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  // Logo Oficial CTS
  const CTS_LOGO = "https://i.postimg.cc/YStPGLRj/Design-sem-nome-(16).png";

  useEffect(() => {
    const savedEmail = localStorage.getItem('ctspro_remembered_email');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Campos obrigatórios ausentes.');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    onLogin(email, password, isRegistering, rememberMe);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-[#020617] bg-grid">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] -z-10"></div>
      
      <div className="w-full max-w-lg glass p-10 sm:p-14 rounded-[50px] shadow-2xl relative z-10 border border-white/5 animate-in fade-in zoom-in duration-500">
        <div className="mb-12 text-center">
          <div className="relative inline-block mb-8">
             {/* Efeito de brilho/aura atrás do logo */}
             <div className="absolute inset-0 bg-blue-600/20 blur-[40px] rounded-full scale-150 animate-pulse"></div>
             <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-blue-500/30 shadow-[0_0_60px_rgba(37,99,235,0.3)] bg-slate-900 flex items-center justify-center overflow-hidden">
                <img 
                  src={CTS_LOGO} 
                  alt="Legalizadora CTS" 
                  className="w-full h-full object-contain p-0.5"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "https://www.svgrepo.com/show/447953/shield-check.svg"; // Fallback se a URL falhar
                  }}
                />
             </div>
          </div>
          <h1 className="text-5xl font-gaming font-black tracking-tighter bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent mb-2 uppercase">
            CTSPRO
          </h1>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em]">Logística Global e Simulação</p>
        </div>

        <div className="flex bg-slate-950/50 p-1.5 rounded-2xl border border-white/5 mb-10">
          <button 
            type="button"
            onClick={() => { setIsRegistering(false); setError(''); }}
            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!isRegistering ? 'bg-blue-600 text-white shadow-xl' : 'text-slate-500'}`}
          >
            Acessar
          </button>
          <button 
            type="button"
            onClick={() => { setIsRegistering(true); setError(''); }}
            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isRegistering ? 'bg-blue-600 text-white shadow-xl' : 'text-slate-500'}`}
          >
            Registrar
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 flex items-center gap-2">
              <Mail className="w-3 h-3 text-blue-500" /> E-mail de Acesso
            </label>
            <input 
              type="email" 
              placeholder="piloto@ctspro.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-6 py-5 text-sm font-bold text-white focus:border-blue-600 outline-none transition-all shadow-inner"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 flex items-center gap-2">
              <Lock className="w-3 h-3 text-blue-500" /> Senha de Segurança
            </label>
            <div className="relative">
              <input 
                type={showPassword ? 'text' : 'password'} 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-6 py-5 pr-16 text-sm font-bold text-white focus:border-blue-600 outline-none transition-all shadow-inner"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 hover:text-blue-500 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between px-1">
            <label className="flex items-center gap-3 cursor-pointer group select-none">
              <div className="relative">
                <input 
                  type="checkbox" 
                  checked={rememberMe} 
                  onChange={(e) => setRememberMe(e.target.checked)} 
                  className="peer hidden" 
                />
                <div className="w-5 h-5 bg-slate-900 border-2 border-slate-800 rounded-md peer-checked:bg-blue-600 peer-checked:border-blue-400 transition-all flex items-center justify-center">
                  <CheckCircle2 className="w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100" />
                </div>
              </div>
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest group-hover:text-slate-300">Lembrar meus dados</span>
            </label>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center gap-3 text-red-500 text-[10px] font-black uppercase tracking-widest animate-in shake">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="pt-4">
            <button 
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-500 text-white py-6 rounded-2xl font-black uppercase tracking-[0.4em] transition-all transform hover:scale-[1.01] active:scale-95 shadow-2xl shadow-blue-600/20 flex items-center justify-center gap-4 text-xs"
            >
              {isRegistering ? 'CRIAR CONTA GLOBAL' : 'AUTENTICAR NO HUB'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;

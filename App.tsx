
import React, { useState, useEffect } from 'react';
import { UserProfile, UserStatus, UserCategory, CustomRole, Platform, Segment } from './types';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import ProfileSetup from './components/ProfileSetup';
import { Loader2, AlertTriangle } from 'lucide-react';

const FOUNDER_EMAIL = 'ctsproadmim@gmail.com';

const MASTER_ROLE: CustomRole = {
  id: 'master_founder',
  name: 'MASTER FOUNDER',
  isLocked: true,
  permissions: {
    pode_aprovar: true,
    pode_editar: true,
    pode_gerenciar_viagens: true,
    pode_atribuir_cargos: true,
    pode_banir: true,
    pode_ver_financeiro: true,
    pode_gerenciar_b2b: true
  }
};

const INITIAL_FOUNDER_PROFILE: UserProfile = {
  uid: 'founder_001',
  email: FOUNDER_EMAIL,
  name: 'O FUNDADOR',
  age: 99,
  category: UserCategory.ENTREPRENEUR,
  roleId: 'master_founder',
  status: UserStatus.APPROVED,
  platforms: [Platform.ETS2, Platform.WTDS, Platform.GTO],
  segment: Segment.BOTH,
  photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
  companyName: 'CTSPRO GLOBAL ADMIN',
  brandColor: '#2563eb',
  createdAt: new Date('2024-01-01').toISOString(),
  description: 'Sistema Master de Gestão Global - CTSPRO'
};

function getInitialState<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    return defaultValue;
  }
}

const App: React.FC = () => {
  const [user, setUser] = useState<any>(() => getInitialState('ctspro_user', null));
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorBoundary, setErrorBoundary] = useState(false);

  useEffect(() => {
    const bootstrap = () => {
      try {
        const dbKeys = [
            'ctspro_roles_db', 'ctspro_auth_db', 'ctspro_profiles_db', 'ctspro_trips_db',
            'ctspro_point_db', 'ctspro_goals_db', 'ctspro_b2b_db', 'ctspro_history_db'
        ];
        dbKeys.forEach(key => {
            if (!localStorage.getItem(key)) localStorage.setItem(key, '[]');
        });

        // Garantir Perfil do Fundador no DB Real para Ranking
        const profilesDB = getInitialState<UserProfile[]>('ctspro_profiles_db', []);
        if (!profilesDB.some(p => p.email === FOUNDER_EMAIL)) {
          profilesDB.push(INITIAL_FOUNDER_PROFILE);
          localStorage.setItem('ctspro_profiles_db', JSON.stringify(profilesDB));
        }

        let savedRoles = getInitialState<CustomRole[]>('ctspro_roles_db', []);
        if (!savedRoles.some(r => r.id === 'master_founder')) {
            localStorage.setItem('ctspro_roles_db', JSON.stringify([MASTER_ROLE, ...savedRoles]));
        }

        if (user && user.email) {
          const freshProfiles = getInitialState<UserProfile[]>('ctspro_profiles_db', []);
          const foundProfile = freshProfiles.find(p => p.email.toLowerCase() === user.email.toLowerCase());
          setProfile(foundProfile || null);
        }
      } catch (err) {
        setErrorBoundary(true);
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, [user?.uid]);

  const handleAuth = async (email: string, password: string, isSignUp: boolean, rememberMe: boolean) => {
    setLoading(true);
    const normalizedEmail = email.toLowerCase();
    
    if (rememberMe) localStorage.setItem('ctspro_remembered_email', normalizedEmail);
    else localStorage.removeItem('ctspro_remembered_email');

    try {
      const authDB = getInitialState('ctspro_auth_db', []);
      let authenticatedUser = null;

      if (isSignUp) {
        if (authDB.some((u: any) => u.email.toLowerCase() === normalizedEmail)) {
          alert("E-mail já registrado.");
          setLoading(false); return;
        }
        authenticatedUser = { uid: 'u_' + Math.random().toString(36).substr(2, 9), email: normalizedEmail, name: normalizedEmail.split('@')[0] };
        authDB.push({ ...authenticatedUser, password });
        localStorage.setItem('ctspro_auth_db', JSON.stringify(authDB));
      } else {
        if (normalizedEmail === FOUNDER_EMAIL && password === 'admin123') {
           authenticatedUser = { uid: INITIAL_FOUNDER_PROFILE.uid, email: normalizedEmail, name: 'Fundador' };
        } else {
          const found = authDB.find((u: any) => u.email.toLowerCase() === normalizedEmail && u.password === password);
          if (!found) {
            alert("Credenciais inválidas.");
            setLoading(false); return;
          }
          authenticatedUser = { uid: found.uid, email: found.email, name: found.name };
        }
      }

      localStorage.setItem('ctspro_user', JSON.stringify(authenticatedUser));
      localStorage.setItem('user_email', normalizedEmail);
      setUser(authenticatedUser);

    } catch (err) {
      setErrorBoundary(true);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('ctspro_user');
    localStorage.removeItem('user_email');
    localStorage.removeItem('ctspro_status');
    setUser(null);
    setProfile(null);
    window.location.reload();
  };

  const salvarCadastroDefinitivo = (newProfile: UserProfile) => {
    try {
      const profilesDB = getInitialState<UserProfile[]>('ctspro_profiles_db', []);
      const idx = profilesDB.findIndex(p => p.uid === newProfile.uid || p.email.toLowerCase() === newProfile.email.toLowerCase());
      
      let updatedDB;
      if (idx > -1) {
        updatedDB = [...profilesDB];
        updatedDB[idx] = { ...profilesDB[idx], ...newProfile };
      } else {
        updatedDB = [...profilesDB, newProfile];
      }
      
      localStorage.setItem('ctspro_profiles_db', JSON.stringify(updatedDB));
      localStorage.setItem('ctspro_status', 'logado_e_cadastrado');
      setProfile(newProfile);
    } catch (err) {
      setErrorBoundary(true);
    }
  };

  if (errorBoundary) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#020617] p-6 text-center">
        <div className="glass p-12 rounded-[50px] border border-red-500/20 space-y-6">
           <AlertTriangle className="w-16 h-16 text-red-500 mx-auto" />
           <h2 className="text-2xl font-gaming font-black text-white uppercase">Erro de Sincronização</h2>
           <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest">Reiniciar Sistema</button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#020617] bg-grid">
         <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!user) return <Login onLogin={handleAuth} />;
  
  const isSetupComplete = localStorage.getItem('ctspro_status') === 'logado_e_cadastrado' && profile;

  if (!isSetupComplete) {
    return <ProfileSetup user={user} onComplete={salvarCadastroDefinitivo} onBack={handleLogout} />;
  }

  return (
    <Dashboard 
      key={`dash-${user.uid}`} 
      profile={profile} 
      onLogout={handleLogout} 
      onUpdateProfile={salvarCadastroDefinitivo} 
    />
  );
};

export default App;

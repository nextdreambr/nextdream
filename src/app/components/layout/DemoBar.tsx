import React from 'react';
import { useApp, AppRole } from '../../context/AppContext';
import { useNavigate } from 'react-router';
import { Eye, User, Heart, Shield } from 'lucide-react';

const roles: { value: AppRole; label: string; icon: React.ReactNode; path: string; color: string }[] = [
  { value: 'public',   label: 'Público',  icon: <Eye className="w-3.5 h-3.5" />,   path: '/',                   color: 'bg-gray-100 text-gray-700 border-gray-300'      },
  { value: 'paciente', label: 'Paciente', icon: <User className="w-3.5 h-3.5" />,  path: '/paciente/dashboard',  color: 'bg-pink-100 text-pink-700 border-pink-300'      },
  { value: 'apoiador', label: 'Apoiador', icon: <Heart className="w-3.5 h-3.5" />, path: '/apoiador/dashboard',  color: 'bg-violet-100 text-violet-700 border-violet-300' },
  { value: 'admin',    label: 'Admin',    icon: <Shield className="w-3.5 h-3.5" />, path: '/admin',              color: 'bg-orange-100 text-orange-700 border-orange-300' },
];

export function DemoBar() {
  const { currentRole, switchRole } = useApp();
  const navigate = useNavigate();

  const handleSwitch = (role: AppRole, path: string) => {
    switchRole(role);
    navigate(path);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900 border-t border-gray-700">
      <div className="max-w-5xl mx-auto px-4 py-2 flex items-center gap-3 flex-wrap">
        <span className="text-gray-400 text-xs font-medium shrink-0 flex items-center gap-1">
          <Eye className="w-3.5 h-3.5" />
          Demo — Ver como:
        </span>
        <div className="flex gap-2 flex-wrap">
          {roles.map(role => (
            <button
              key={role.value}
              onClick={() => handleSwitch(role.value, role.path)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs border transition-all font-medium
                ${currentRole === role.value
                  ? role.color + ' ring-2 ring-offset-1 ring-offset-gray-900 ring-white/30'
                  : 'bg-gray-800 text-gray-300 border-gray-600 hover:bg-gray-700'
                }`}
            >
              {role.icon}
              {role.label}
              {currentRole === role.value && <span className="ml-0.5">✓</span>}
            </button>
          ))}
        </div>
        <span className="text-gray-600 text-xs ml-auto hidden sm:block">Protótipo NextDream • Todos os dados são fictícios</span>
      </div>
    </div>
  );
}

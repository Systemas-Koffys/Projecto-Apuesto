import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  ShieldCheck, 
  User, 
  TrendingUp,
  Settings,
  LogOut,
  LayoutGrid
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { clsx } from 'clsx';

const Sidebar = () => {
  const { logout, user } = useAuth();

  const sections = [
    {
      label: 'Navegación',
      items: [
        { name: 'Análisis IA', path: '/dashboard', icon: TrendingUp },
        { name: 'Mi Cuenta', path: '/perfil', icon: User },
      ]
    },
    ...(user?.role === 'admin' ? [{
      label: 'Administración',
      items: [
        { name: 'Panel Root', path: '/admin', icon: ShieldCheck },
      ]
    }] : []),
    {
      label: 'Sistema',
      items: [
        { name: 'Ajustes', path: '/settings', icon: Settings },
      ]
    }
  ];

  return (
    <aside className="w-[240px] bg-brand-surface border-r border-brand-border flex flex-col h-screen sticky top-0 z-50">
      <div className="p-6 border-b border-brand-border flex items-center gap-3">
        <div className="w-8 h-8 bg-gradient-neon rounded-lg flex items-center justify-center font-display text-brand-bg text-lg">
          K
        </div>
        <span className="font-display text-2xl tracking-widest bg-gradient-to-r from-brand-accent to-white bg-clip-text text-transparent">
          KOFFY'S
        </span>
      </div>

      <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
        {sections.map((section, idx) => (
          <div key={idx} className="space-y-2">
            <h3 className="koffy-mono text-[9px] text-brand-gray px-3">{section.label}</h3>
            {section.items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => clsx(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all relative group",
                  isActive 
                    ? "bg-brand-accent/5 text-brand-accent border border-brand-accent/20" 
                    : "text-brand-text2 hover:bg-brand-card hover:text-brand-text"
                )}
              >
                <item.icon size={16} />
                <span>{item.name}</span>
                {({ isActive }) => isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-3/5 bg-brand-accent rounded-r-full" />
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-brand-border">
        <div className="bg-brand-card2 border border-brand-border p-3 rounded-lg flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-neon flex items-center justify-center text-brand-bg font-bold text-xs">
            {user?.email?.[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold truncate">{user?.email?.split('@')[0]}</p>
            <p className="koffy-mono text-[8px] text-brand-accent">{user?.role}</p>
          </div>
          <button 
            onClick={logout}
            className="text-brand-gray hover:text-brand-red transition-colors"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

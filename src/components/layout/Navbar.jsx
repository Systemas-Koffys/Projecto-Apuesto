import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, Bell, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { darkMode, toggleDarkMode } = useTheme();
  const { user } = useAuth();

  return (
    <nav className="h-[60px] bg-brand-surface border-b border-brand-border flex items-center justify-between px-6 sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <button className="p-2 text-brand-text2 hover:text-brand-text hover:bg-brand-card rounded-lg transition-all md:hidden">
          <Menu size={18} />
        </button>
        <h2 className="koffy-title text-xl text-brand-text">Panel de Control</h2>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden sm:flex items-center gap-2">
          <span className="koffy-mono text-[10px] text-brand-text2 border border-brand-border2 px-2 py-1 rounded">
            {user?.role === 'admin' ? 'ROOT ACCESS' : 'PREMIUM USER'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={toggleDarkMode}
            className="text-brand-text2 hover:text-brand-accent transition-colors"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          
          <button className="text-brand-text2 hover:text-brand-accent transition-colors relative">
            <Bell size={18} />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-brand-red rounded-full"></span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, Bell, Menu, X, TrendingUp } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = ({ onMenuClick }) => {
  const { darkMode, toggleDarkMode } = useTheme();
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [history, setHistory] = useState([]);
  const panelRef = useRef(null);

  // Cargar historial de análisis desde localStorage
  useEffect(() => {
    const loadHistory = () => {
      try {
        const saved = JSON.parse(localStorage.getItem('koffy_analysis_history') || '[]');
        setHistory(saved.slice(0, 5));
      } catch {
        setHistory([]);
      }
    };
    loadHistory();
    // Refrescar cuando cambia la ventana (por si un análisis nuevo fue guardado)
    window.addEventListener('storage', loadHistory);
    window.addEventListener('koffy_analysis_saved', loadHistory);
    return () => {
      window.removeEventListener('storage', loadHistory);
      window.removeEventListener('koffy_analysis_saved', loadHistory);
    };
  }, [showNotifications]);

  // Cerrar panel al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="h-[60px] bg-brand-surface border-b border-brand-border flex items-center justify-between px-4 md:px-6 sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="p-2 text-brand-text2 hover:text-brand-text hover:bg-brand-card rounded-lg transition-all md:hidden"
        >
          <Menu size={18} />
        </button>
        <h2 className="koffy-title text-lg md:text-xl text-brand-text">Panel de Control</h2>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden sm:flex items-center gap-2">
          <span className="koffy-mono text-[10px] text-brand-text2 border border-brand-border2 px-2 py-1 rounded">
            {user?.role === 'admin' ? 'ROOT ACCESS' : 'PREMIUM USER'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Toggle Tema */}
          <button 
            onClick={toggleDarkMode}
            className="text-brand-text2 hover:text-brand-accent transition-colors"
            title={darkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          
          {/* Campanita con panel de historial */}
          <div className="relative" ref={panelRef}>
            <button 
              onClick={() => setShowNotifications(v => !v)}
              className="text-brand-text2 hover:text-brand-accent transition-colors relative"
            >
              <Bell size={18} />
              {history.length > 0 && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-brand-accent rounded-full animate-pulse"></span>
              )}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.18 }}
                  className="absolute right-0 top-10 w-72 bg-brand-surface border border-brand-border2 rounded-xl shadow-2xl overflow-hidden z-50"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-brand-border">
                    <span className="koffy-mono text-[9px] text-brand-accent">ÚLTIMOS ANÁLISIS</span>
                    <button onClick={() => setShowNotifications(false)} className="text-brand-gray hover:text-brand-text">
                      <X size={14} />
                    </button>
                  </div>

                  {/* Lista */}
                  <div className="max-h-[300px] overflow-y-auto">
                    {history.length === 0 ? (
                      <div className="px-4 py-6 text-center">
                        <TrendingUp size={24} className="text-brand-gray mx-auto mb-2 opacity-40" />
                        <p className="koffy-mono text-[9px] text-brand-gray">Sin análisis recientes</p>
                        <p className="text-[10px] text-brand-gray mt-1 opacity-60">Analiza un partido para verlo aquí</p>
                      </div>
                    ) : (
                      history.map((item, i) => (
                        <div key={i} className="px-4 py-3 border-b border-brand-border/50 hover:bg-brand-card transition-colors">
                          <div className="flex items-center gap-2 mb-1">
                            <TrendingUp size={12} className="text-brand-accent flex-shrink-0" />
                            <span className="text-xs font-bold truncate text-brand-text">
                              {item.home} vs {item.away}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="koffy-mono text-[8px] text-brand-gold">
                              Confianza: {item.confidence}%
                            </span>
                            <span className="koffy-mono text-[8px] text-brand-gray">
                              {item.date}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Footer */}
                  <div className="px-4 py-2 bg-brand-card/50 text-center">
                    <span className="koffy-mono text-[8px] text-brand-gray">
                      {history.length} de 5 análisis guardados
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

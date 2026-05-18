import React, { useState, useEffect } from 'react';
import { fetchLeagues, fetchTeams, generateAnalysis } from '../services/mockData';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase.config';
import { doc, updateDoc, increment, getDoc } from 'firebase/firestore';
import { 
  Target, TrendingUp, Activity, ChevronDown, Zap, Search, 
  BarChart3, History, Shield, LayoutGrid, Check, Users, Flag,
  Clock, AlertTriangle, Goal, Flame, RefreshCw
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [allLeagues, setAllLeagues] = useState([]);
  const [leagueSearch, setLeagueSearch] = useState('');
  const [showLeagueDrop, setShowLeagueDrop] = useState(false);
  const [teams, setTeams] = useState([]);
  const [teamSearch, setTeamSearch] = useState({ home: '', away: '' });
  const [showHomeDrop, setShowHomeDrop] = useState(false);
  const [showAwayDrop, setShowAwayDrop] = useState(false);

  const [selectedLeague, setSelectedLeague] = useState(null);
  const [homeTeam, setHomeTeam] = useState(null);
  const [awayTeam, setAwayTeam] = useState(null);
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [activeTab, setActiveTab] = useState('resumen'); // Pestañas estilo Scores24

  useEffect(() => { loadLeagues(); }, []);
  const loadLeagues = async () => {
    const leagues = await fetchLeagues();
    setAllLeagues(leagues);
    if (leagues.length > 0) {
      setSelectedLeague(leagues[0]);
      setTeams(await fetchTeams(leagues[0].id));
    }
  };

  const handleLeagueSelect = async (league) => {
    setSelectedLeague(league); setLeagueSearch(league.name); setShowLeagueDrop(false);
    setHomeTeam(null); setAwayTeam(null); setTeams([]);
    setTeams(await fetchTeams(league.id));
  };

  const handleAnalyze = async () => {
    if (!homeTeam || !awayTeam) return toast.error('Selecciona ambos equipos');
    setIsAnalyzing(true); setAnalysis(null);
    try {
      const result = await generateAnalysis(homeTeam, awayTeam);
      setAnalysis(result);
      toast.success('Terminal Scores24 Actualizada');

      // Guardar en historial local para la campanita de notificaciones
      try {
        const prev = JSON.parse(localStorage.getItem('koffy_analysis_history') || '[]');
        const newEntry = {
          home: homeTeam.name,
          away: awayTeam.name,
          confidence: result.confidenceScore || result.confidence || 85,
          date: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
        };
        const updated = [newEntry, ...prev].slice(0, 5);
        localStorage.setItem('koffy_analysis_history', JSON.stringify(updated));
        window.dispatchEvent(new Event('koffy_analysis_saved'));
      } catch {}


      // Incrementar contador de consultas reales del usuario de forma atómica en la nube (Día vs Mes)
      if (user?.uid && db) {
        try {
          const userRef = doc(db, 'users', user.uid);
          const todayDateStr = new Date().toLocaleDateString('es-ES');
          
          // Lectura previa para determinar si es un nuevo día para este usuario
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const userData = userSnap.data();
            const isNewDay = userData.lastQueryDate !== todayDateStr;
            
            await updateDoc(userRef, {
              queries: increment(1),
              queriesToday: isNewDay ? 1 : increment(1),
              lastQueryDate: todayDateStr
            });
          }
        } catch (fsErr) {
          console.warn("No se pudo actualizar el contador de consultas en la nube:", fsErr.message);
        }
      }
    } catch (error) { 
      toast.error('Error IA'); 
    } finally { 
      setIsAnalyzing(false); 
    }
  };

  const handleClear = () => {
    setAnalysis(null);
    setHomeTeam(null);
    setAwayTeam(null);
    setTeamSearch({ home: '', away: '' });
    setActiveTab('resumen');
  };

  const getFilteredTeams = (q, other) => teams.filter(t => t.name.toLowerCase().includes(q.toLowerCase()) && (!other || t.id !== other.id));

  const ProgressBar = ({ label, leftValue, rightValue, leftLabel, rightLabel, colorLeft = "bg-brand-green", colorRight = "bg-brand-accent" }) => (
    <div className="space-y-2 mb-6">
      <div className="flex justify-between koffy-mono text-[10px] text-brand-gray uppercase tracking-widest">
        <span>{leftLabel}</span>
        <span className="text-white font-bold">{label}</span>
        <span>{rightLabel}</span>
      </div>
      <div className="h-3 w-full bg-brand-bg rounded-full overflow-hidden flex">
        <motion.div initial={{ width: 0 }} animate={{ width: `${leftValue}%` }} className={`h-full ${colorLeft}`}></motion.div>
        <motion.div initial={{ width: 0 }} animate={{ width: `${rightValue}%` }} className={`h-full ${colorRight}`}></motion.div>
      </div>
      <div className="flex justify-between font-mono text-xs font-bold text-white">
        <span>{leftValue}%</span>
        <span>{rightValue}%</span>
      </div>
    </div>
  );

  const ProgressBar3 = ({ label, val1, val2, val3, lbl1, lbl2, lbl3 }) => (
    <div className="space-y-2 mb-6">
      <div className="flex justify-center koffy-mono text-[10px] text-brand-gray uppercase tracking-widest mb-1">
        <span className="text-white font-bold">{label}</span>
      </div>
      <div className="flex justify-between koffy-mono text-[9px] text-brand-gray uppercase mb-1">
        <span>{lbl1}</span>
        <span>{lbl2}</span>
        <span>{lbl3}</span>
      </div>
      <div className="h-4 w-full bg-brand-bg rounded-full overflow-hidden flex">
        <motion.div initial={{ width: 0 }} animate={{ width: `${val1}%` }} className="h-full bg-brand-green"></motion.div>
        <motion.div initial={{ width: 0 }} animate={{ width: `${val2}%` }} className="h-full bg-brand-gray"></motion.div>
        <motion.div initial={{ width: 0 }} animate={{ width: `${val3}%` }} className="h-full bg-brand-accent"></motion.div>
      </div>
      <div className="flex justify-between font-mono text-xs font-bold text-white">
        <span className="text-brand-green">{val1}%</span>
        <span className="text-brand-gray">{val2}%</span>
        <span className="text-brand-accent">{val3}%</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* SIDEBAR CONFIGURACIÓN */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-brand-surface border border-brand-border2 rounded-[2rem] p-6 shadow-2xl">
            <h3 className="koffy-mono text-[10px] text-brand-accent uppercase tracking-widest mb-6 border-b border-brand-border pb-4 flex items-center gap-2">
              <Zap size={14} /> Filtro de Partido
            </h3>
            <div className="space-y-5">
              <div className="space-y-2 relative">
                <label className="koffy-mono text-[8px] text-brand-gray uppercase">Competición</label>
                <div className="koffy-input flex items-center justify-between cursor-pointer" onClick={() => setShowLeagueDrop(!showLeagueDrop)}>
                  <span className={`text-[10px] uppercase truncate ${selectedLeague ? 'text-white' : 'text-brand-gray'}`}>{selectedLeague ? selectedLeague.name : 'BUSCAR LIGA...'}</span>
                  <ChevronDown size={14} className="text-brand-gray" />
                </div>
                {showLeagueDrop && (
                  <div className="absolute left-0 right-0 top-full mt-2 bg-brand-card border border-brand-border rounded-xl overflow-hidden z-50">
                    <div className="p-2 border-b border-brand-border flex items-center gap-2">
                      <Search size={12} className="text-brand-gray" /><input autoFocus className="bg-transparent border-none outline-none text-[10px] text-white w-full koffy-mono" placeholder="Buscar..." value={leagueSearch} onChange={(e) => setLeagueSearch(e.target.value)} />
                    </div>
                    <div className="max-h-[200px] overflow-y-auto scrollbar-custom">
                      {allLeagues.filter(l => l.name.toLowerCase().includes(leagueSearch.toLowerCase())).map(l => (
                        <button key={l.id} onClick={() => handleLeagueSelect(l)} className="w-full p-3 text-left hover:bg-brand-accent/10 koffy-mono text-[9px] text-brand-gray hover:text-white border-b border-brand-border/20">{l.name}</button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="koffy-mono text-[8px] text-brand-gray uppercase">Local</label>
                <div className="relative">
                  <div className={`koffy-input flex items-center justify-between cursor-pointer ${!teams.length && 'opacity-30'}`} onClick={() => teams.length && setShowHomeDrop(!showHomeDrop)}>
                    <span className={`text-[10px] uppercase truncate ${homeTeam ? 'text-brand-green' : 'text-brand-gray'}`}>{homeTeam ? homeTeam.name : 'SELECCIONAR'}</span>
                  </div>
                  {showHomeDrop && (
                    <div className="absolute left-0 right-0 top-full mt-2 bg-brand-card border border-brand-border rounded-xl overflow-hidden z-40 max-h-[200px] overflow-y-auto scrollbar-custom">
                      {getFilteredTeams(teamSearch.home, awayTeam).map(t => <button key={t.id} onClick={() => { setHomeTeam(t); setShowHomeDrop(false); }} className="w-full p-3 text-left hover:bg-brand-green/10 koffy-mono text-[9px] text-brand-gray hover:text-white">{t.name}</button>)}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="koffy-mono text-[8px] text-brand-gray uppercase">Visitante</label>
                <div className="relative">
                  <div className={`koffy-input flex items-center justify-between cursor-pointer ${!teams.length && 'opacity-30'}`} onClick={() => teams.length && setShowAwayDrop(!showAwayDrop)}>
                    <span className={`text-[10px] uppercase truncate ${awayTeam ? 'text-brand-accent' : 'text-brand-gray'}`}>{awayTeam ? awayTeam.name : 'SELECCIONAR'}</span>
                  </div>
                  {showAwayDrop && (
                    <div className="absolute left-0 right-0 top-full mt-2 bg-brand-card border border-brand-border rounded-xl overflow-hidden z-40 max-h-[200px] overflow-y-auto scrollbar-custom">
                      {getFilteredTeams(teamSearch.away, homeTeam).map(t => <button key={t.id} onClick={() => { setAwayTeam(t); setShowAwayDrop(false); }} className="w-full p-3 text-left hover:bg-brand-accent/10 koffy-mono text-[9px] text-brand-gray hover:text-white">{t.name}</button>)}
                    </div>
                  )}
                </div>
              </div>

              <button onClick={handleAnalyze} disabled={isAnalyzing || !awayTeam} className={`w-full bg-brand-accent text-brand-bg font-bold py-3 rounded-xl flex justify-center items-center gap-2 mt-4 hover:opacity-80 transition-opacity ${isAnalyzing && 'opacity-50'}`}>
                {isAnalyzing ? <Activity className="animate-spin" size={16} /> : <BarChart3 size={16} />}
                <span className="text-[10px] uppercase tracking-widest">{isAnalyzing ? 'Procesando' : 'Analizar Partido'}</span>
              </button>
              
              {analysis && (
                <button onClick={handleClear} className="w-full bg-transparent border border-brand-red/30 text-brand-red font-bold py-3 rounded-xl flex justify-center items-center gap-2 mt-3 hover:bg-brand-red/10 transition-colors">
                  <RefreshCw size={16} />
                  <span className="text-[10px] uppercase tracking-widest">Nuevo Análisis</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ZONA PRINCIPAL DE DATOS (SCORES24 CLONE) */}
        <div className="lg:col-span-9 min-h-[700px]">
          {!analysis && !isAnalyzing && (
             <div className="h-full bg-brand-surface border border-brand-border2 rounded-[2rem] flex flex-col items-center justify-center p-12 text-brand-gray">
                <Target size={60} className="opacity-10 mb-4" />
                <p className="koffy-mono text-xs uppercase tracking-widest">Esperando configuración de partido...</p>
             </div>
          )}

          {isAnalyzing && (
             <div className="h-full bg-brand-surface border border-brand-border2 rounded-[2rem] flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 grid-bg opacity-30"></div>
                <div className="w-16 h-16 border-4 border-brand-accent/20 border-t-brand-accent rounded-full animate-spin mb-6"></div>
                <p className="koffy-mono text-xs text-white uppercase tracking-widest animate-pulse">Sincronizando Modelos Tácticos</p>
             </div>
          )}

          {analysis && (
            <div className="space-y-6">
              {/* Scorecard Header */}
              <div className="bg-brand-surface border border-brand-border2 rounded-[2rem] p-8 flex items-center justify-between shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-brand-accent"></div>
                <div className="flex-1 text-right pr-8">
                  <h2 className="font-display text-3xl text-white uppercase">{homeTeam?.name}</h2>
                </div>
                <div className="bg-brand-bg border border-brand-border px-8 py-4 rounded-2xl flex flex-col items-center">
                  <span className="font-display text-5xl text-brand-accent">{analysis.scorePrediction}</span>
                  <span className="koffy-mono text-[8px] text-brand-gray uppercase mt-1">Predicción IA</span>
                </div>
                <div className="flex-1 text-left pl-8">
                  <h2 className="font-display text-3xl text-white uppercase">{awayTeam?.name}</h2>
                </div>
              </div>

              {/* Pestañas de Navegación (Estilo Scores24) */}
              <div className="flex gap-2 border-b border-brand-border2 pb-4">
                {['resumen', 'pronóstico', 'tendencias', 'probabilidades'].map(tab => (
                  <button 
                    key={tab} 
                    onClick={() => setActiveTab(tab)}
                    className={`koffy-mono text-[10px] uppercase tracking-widest px-6 py-2 rounded-full transition-colors ${activeTab === tab ? 'bg-brand-accent text-brand-bg font-bold' : 'text-brand-gray hover:text-white'}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                {/* PESTAÑA: RESUMEN */}
                {activeTab === 'resumen' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    <div className="bg-brand-surface border border-brand-border2 rounded-[2rem] p-8">
                      <h3 className="koffy-mono text-xs text-white uppercase mb-4 flex items-center gap-2"><Shield size={16}/> Veredicto Experto</h3>
                      <p className="koffy-mono text-[11px] text-brand-gray leading-relaxed">{analysis.expertAnalysis}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-brand-surface border border-brand-border2 rounded-[2rem] p-8">
                        <h3 className="koffy-mono text-xs text-brand-accent uppercase mb-6 flex items-center gap-2"><Target size={16}/> Puntos Clave</h3>
                        <div className="space-y-3">
                          {analysis.keyPoints.map((pt, i) => (
                            <div key={i} className="flex gap-3 items-start p-3 rounded-xl bg-brand-bg/50 border border-brand-border/30">
                              <Check size={14} className="text-brand-green shrink-0 mt-0.5" />
                              <p className="koffy-mono text-[10px] text-white leading-relaxed">{pt}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-brand-surface border border-brand-border2 rounded-[2rem] p-8">
                        <h3 className="koffy-mono text-xs text-brand-gold uppercase mb-6 flex items-center gap-2"><History size={16}/> Clasificación & Enfrentamientos H2H</h3>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center bg-brand-bg/50 p-3 rounded-xl border border-brand-border/30">
                            <span className="koffy-mono text-[10px] text-brand-gray">{homeTeam?.name}</span>
                            <span className="koffy-mono text-[10px] text-brand-accent">{analysis.standings.home}</span>
                          </div>
                          <div className="flex justify-between items-center bg-brand-bg/50 p-3 rounded-xl border border-brand-border/30">
                            <span className="koffy-mono text-[10px] text-brand-gray">{awayTeam?.name}</span>
                            <span className="koffy-mono text-[10px] text-brand-accent">{analysis.standings.away}</span>
                          </div>
                          <div className="mt-4 pt-4 border-t border-brand-border/30">
                            <p className="koffy-mono text-[10px] text-brand-gray leading-relaxed whitespace-pre-line">{analysis.h2hSummary}</p>
                          </div>
                        </div>
                      </div>

                      {/* NUEVO MÓDULO GIGANTE DE FORMA RECIENTE ESTILO SCORES24 */}
                      <div className="md:col-span-2">
                        <h3 className="koffy-mono text-xs text-white uppercase mb-4 flex items-center gap-2"><Activity size={16}/> Los últimos resultados de {homeTeam?.name} y {awayTeam?.name}</h3>
                        <div className="grid md:grid-cols-2 gap-6">
                          
                          {/* PANEL TEAM LOCAL */}
                          <div className="bg-brand-surface border border-brand-border2 rounded-[2rem] p-8 relative overflow-hidden">
                            <div className="text-center mb-6">
                              {homeTeam?.logo ? <img src={homeTeam.logo} alt={homeTeam.name} className="w-12 h-12 mx-auto mb-3" /> : <div className="w-12 h-12 mx-auto mb-3 bg-brand-bg rounded-full border border-brand-border flex items-center justify-center"><Shield size={20} className="text-brand-gray"/></div>}
                              <h4 className="font-display text-2xl text-white uppercase">{homeTeam?.name}</h4>
                              <p className="koffy-mono text-[9px] text-brand-gray uppercase mb-4">Últimos resultados</p>
                              <div className="flex justify-center gap-6 koffy-mono text-[10px]">
                                <span className="text-brand-accent border-b-2 border-brand-accent pb-1 cursor-pointer">Todos</span>
                                <span className="text-brand-gray hover:text-white cursor-pointer transition-colors pb-1">Local</span>
                                <span className="text-brand-gray hover:text-white cursor-pointer transition-colors pb-1">Visitante</span>
                              </div>
                            </div>
                            
                            <div className="border border-brand-border rounded-2xl p-6 mb-6 bg-brand-bg/30">
                              <div className="flex justify-center items-center gap-2 mb-6">
                                <div className="w-8 h-[1px] bg-brand-border2"></div>
                                {analysis.recentForm.home.form.map((res, i) => (
                                  <span key={i} className={`w-6 h-6 flex items-center justify-center rounded-sm font-bold text-[10px] shadow-sm ${res==='V'?'bg-brand-green text-[#060a0f]':res==='E'?'bg-brand-gray text-white':'bg-brand-red text-white'}`}>{res}</span>
                                ))}
                                <div className="w-8 h-[1px] bg-brand-border2"></div>
                              </div>
                              <div className="grid grid-cols-3 gap-2 text-center">
                                <div>
                                  <p className="koffy-mono text-[9px] text-white mb-1">Victorias</p>
                                  <p className="font-mono text-[10px] text-brand-gray mb-2">{analysis.recentForm.home.stats.victorias}</p>
                                  <div className="h-1.5 w-full bg-brand-bg rounded-full overflow-hidden"><div className="h-full bg-brand-green w-[67%]"></div></div>
                                </div>
                                <div>
                                  <p className="koffy-mono text-[9px] text-white mb-1">Empates</p>
                                  <p className="font-mono text-[10px] text-brand-gray mb-2">{analysis.recentForm.home.stats.empates}</p>
                                  <div className="h-1.5 w-full bg-brand-bg rounded-full overflow-hidden"><div className="h-full bg-brand-gray w-[0%]"></div></div>
                                </div>
                                <div>
                                  <p className="koffy-mono text-[9px] text-white mb-1">Derrotas</p>
                                  <p className="font-mono text-[10px] text-brand-gray mb-2">{analysis.recentForm.home.stats.derrotas}</p>
                                  <div className="h-1.5 w-full bg-brand-bg rounded-full overflow-hidden"><div className="h-full bg-brand-red w-[33%]"></div></div>
                                </div>
                              </div>
                            </div>

                            <div className="border border-brand-border rounded-2xl p-6 bg-brand-bg/30">
                              <p className="text-center koffy-mono text-[9px] text-brand-gray mb-4">Estadísticas promedio (Últimos 6 partidos)</p>
                              <div className="grid grid-cols-2 gap-3">
                                {[
                                  { v: analysis.recentForm.home.stats.totalGoles, l: 'Total de goles' },
                                  { v: analysis.recentForm.home.stats.ambosMarcan, l: 'Ambos marcan' },
                                  { v: analysis.recentForm.home.stats.golesMarcados, l: 'Goles marcados' },
                                  { v: analysis.recentForm.home.stats.golesRecibidos, l: 'Goles recibidos' },
                                  { v: analysis.recentForm.home.stats.over25, l: 'Over 2.5' },
                                  { v: analysis.recentForm.home.stats.under25, l: 'Under 2.5' }
                                ].map((stat, i) => (
                                  <div key={i} className="bg-brand-surface border border-brand-border rounded-xl p-3 text-left">
                                    <p className="font-mono text-sm text-white font-bold mb-0.5">{stat.v}</p>
                                    <p className="koffy-mono text-[8px] text-brand-gray">{stat.l}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* PANEL TEAM VISITANTE */}
                          <div className="bg-brand-surface border border-brand-border2 rounded-[2rem] p-8 relative overflow-hidden">
                            <div className="text-center mb-6">
                              {awayTeam?.logo ? <img src={awayTeam.logo} alt={awayTeam.name} className="w-12 h-12 mx-auto mb-3" /> : <div className="w-12 h-12 mx-auto mb-3 bg-brand-bg rounded-full border border-brand-border flex items-center justify-center"><Shield size={20} className="text-brand-gray"/></div>}
                              <h4 className="font-display text-2xl text-white uppercase">{awayTeam?.name}</h4>
                              <p className="koffy-mono text-[9px] text-brand-gray uppercase mb-4">Últimos resultados</p>
                              <div className="flex justify-center gap-6 koffy-mono text-[10px]">
                                <span className="text-brand-accent border-b-2 border-brand-accent pb-1 cursor-pointer">Todos</span>
                                <span className="text-brand-gray hover:text-white cursor-pointer transition-colors pb-1">Local</span>
                                <span className="text-brand-gray hover:text-white cursor-pointer transition-colors pb-1">Visitante</span>
                              </div>
                            </div>
                            
                            <div className="border border-brand-border rounded-2xl p-6 mb-6 bg-brand-bg/30">
                              <div className="flex justify-center items-center gap-2 mb-6">
                                <div className="w-8 h-[1px] bg-brand-border2"></div>
                                {analysis.recentForm.away.form.map((res, i) => (
                                  <span key={i} className={`w-6 h-6 flex items-center justify-center rounded-sm font-bold text-[10px] shadow-sm ${res==='V'?'bg-brand-green text-[#060a0f]':res==='E'?'bg-brand-gray text-white':'bg-brand-red text-white'}`}>{res}</span>
                                ))}
                                <div className="w-8 h-[1px] bg-brand-border2"></div>
                              </div>
                              <div className="grid grid-cols-3 gap-2 text-center">
                                <div>
                                  <p className="koffy-mono text-[9px] text-white mb-1">Victorias</p>
                                  <p className="font-mono text-[10px] text-brand-gray mb-2">{analysis.recentForm.away.stats.victorias}</p>
                                  <div className="h-1.5 w-full bg-brand-bg rounded-full overflow-hidden"><div className="h-full bg-brand-green w-[50%]"></div></div>
                                </div>
                                <div>
                                  <p className="koffy-mono text-[9px] text-white mb-1">Empates</p>
                                  <p className="font-mono text-[10px] text-brand-gray mb-2">{analysis.recentForm.away.stats.empates}</p>
                                  <div className="h-1.5 w-full bg-brand-bg rounded-full overflow-hidden"><div className="h-full bg-brand-gray w-[17%]"></div></div>
                                </div>
                                <div>
                                  <p className="koffy-mono text-[9px] text-white mb-1">Derrotas</p>
                                  <p className="font-mono text-[10px] text-brand-gray mb-2">{analysis.recentForm.away.stats.derrotas}</p>
                                  <div className="h-1.5 w-full bg-brand-bg rounded-full overflow-hidden"><div className="h-full bg-brand-red w-[33%]"></div></div>
                                </div>
                              </div>
                            </div>

                            <div className="border border-brand-border rounded-2xl p-6 bg-brand-bg/30">
                              <p className="text-center koffy-mono text-[9px] text-brand-gray mb-4">Estadísticas promedio (Últimos 6 partidos)</p>
                              <div className="grid grid-cols-2 gap-3">
                                {[
                                  { v: analysis.recentForm.away.stats.totalGoles, l: 'Total de goles' },
                                  { v: analysis.recentForm.away.stats.ambosMarcan, l: 'Ambos marcan' },
                                  { v: analysis.recentForm.away.stats.golesMarcados, l: 'Goles marcados' },
                                  { v: analysis.recentForm.away.stats.golesRecibidos, l: 'Goles recibidos' },
                                  { v: analysis.recentForm.away.stats.over25, l: 'Over 2.5' },
                                  { v: analysis.recentForm.away.stats.under25, l: 'Under 2.5' }
                                ].map((stat, i) => (
                                  <div key={i} className="bg-brand-surface border border-brand-border rounded-xl p-3 text-left">
                                    <p className="font-mono text-sm text-white font-bold mb-0.5">{stat.v}</p>
                                    <p className="koffy-mono text-[8px] text-brand-gray">{stat.l}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                          
                        </div>
                      </div>

                      <div className="bg-brand-surface border border-brand-border2 rounded-[2rem] p-8 md:col-span-2">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <h3 className="koffy-mono text-xs text-brand-red uppercase mb-4 flex items-center gap-2"><AlertTriangle size={16}/> Bajas Clave (Local)</h3>
                            <div className="flex gap-6 koffy-mono text-[10px]">
                              <div className="flex-1"><span className="text-brand-gray mb-2 block">{homeTeam?.name}</span><ul className="text-white space-y-1">{analysis.missingPlayers.home.map((p,i) => <li key={i}>• {p}</li>)}</ul></div>
                            </div>
                          </div>
                          <div>
                            <h3 className="koffy-mono text-xs text-brand-red uppercase mb-4 flex items-center gap-2"><AlertTriangle size={16}/> Bajas Clave (Visitante)</h3>
                            <div className="flex gap-6 koffy-mono text-[10px]">
                              <div className="flex-1"><span className="text-brand-gray mb-2 block">{awayTeam?.name}</span><ul className="text-white space-y-1">{analysis.missingPlayers.away.map((p,i) => <li key={i}>• {p}</li>)}</ul></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* PESTAÑA: PRONÓSTICO */}
                {activeTab === 'pronóstico' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    <div className="bg-gradient-dark border border-brand-border2 rounded-[2rem] p-10 relative overflow-hidden shadow-2xl">
                      <div className="absolute -right-20 -top-20 w-64 h-64 bg-brand-accent/10 rounded-full blur-3xl"></div>
                      <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 justify-between">
                        <div className="flex-1">
                          <h3 className="koffy-mono text-xs text-brand-accent uppercase tracking-widest mb-4 flex items-center gap-2"><Zap size={16}/> Predicción Principal</h3>
                          <div className="text-2xl md:text-3xl font-display text-white uppercase leading-tight mb-4">{analysis.mainPrediction}</div>
                          <div className="flex gap-4">
                            <span className="bg-brand-accent text-brand-bg px-4 py-2 rounded-lg font-mono text-xs font-bold">Cuota: {analysis.predictionOdds}</span>
                            <div className="flex items-center gap-2 text-brand-gray koffy-mono text-[10px]">
                              <span>Confianza:</span>
                              <div className="w-24 h-2 bg-brand-bg rounded-full overflow-hidden">
                                <div className="h-full bg-brand-green" style={{ width: `${analysis.confidenceScore}%` }}></div>
                              </div>
                              <span className="text-white">{analysis.confidenceScore}%</span>
                            </div>
                          </div>
                        </div>
                        <div className="bg-brand-bg/80 border border-brand-border p-6 rounded-2xl flex flex-col items-center min-w-[160px] backdrop-blur-sm">
                          <span className="koffy-mono text-[9px] text-brand-gray uppercase mb-2">Marcador Exacto</span>
                          <span className="font-display text-5xl text-white">{analysis.scorePrediction}</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-brand-surface border border-brand-border2 rounded-[2rem] p-8">
                        <h3 className="koffy-mono text-[10px] text-brand-gray uppercase tracking-widest mb-6">Cuotas del Partido (1X2)</h3>
                        <div className="flex gap-4">
                          <div className="flex-1 bg-brand-bg border border-brand-border rounded-xl p-4 text-center">
                            <div className="koffy-mono text-[9px] text-brand-gray mb-1">LOCAL</div>
                            <div className="font-mono text-lg text-white font-bold">{analysis.odds.local.toFixed(2)}</div>
                          </div>
                          <div className="flex-1 bg-brand-bg border border-brand-border rounded-xl p-4 text-center">
                            <div className="koffy-mono text-[9px] text-brand-gray mb-1">EMPATE</div>
                            <div className="font-mono text-lg text-white font-bold">{analysis.odds.draw.toFixed(2)}</div>
                          </div>
                          <div className="flex-1 bg-brand-bg border border-brand-border rounded-xl p-4 text-center">
                            <div className="koffy-mono text-[9px] text-brand-gray mb-1">VISITANTE</div>
                            <div className="font-mono text-lg text-white font-bold">{analysis.odds.away.toFixed(2)}</div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-brand-surface border border-brand-border2 rounded-[2rem] p-8">
                        <h3 className="koffy-mono text-[10px] text-brand-gray uppercase tracking-widest mb-6">Mercados Específicos</h3>
                        <div className="space-y-3">
                          {[
                            { l: 'Hándicap', v: analysis.markets.handicap, i: <Flag size={14}/> },
                            { l: 'Córners', v: analysis.markets.corners, i: <LayoutGrid size={14}/> },
                            { l: 'Ambos Anotan', v: analysis.markets.bothTeamsToScore, i: <Users size={14}/> },
                            { l: 'Primer Gol', v: analysis.markets.firstGoal, i: <Goal size={14}/> }
                          ].map((m, i) => (
                            <div key={i} className="flex justify-between items-center border-b border-brand-border pb-3 last:border-0 last:pb-0">
                              <div className="flex items-center gap-2 text-brand-gray koffy-mono text-[10px] uppercase">{m.i} {m.l}</div>
                              <span className="koffy-mono text-[10px] text-white font-bold">{m.v}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* PESTAÑA: TENDENCIAS (SMART BETTING) */}
                {activeTab === 'tendencias' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-brand-surface border border-brand-border2 rounded-[2rem] p-8 h-[600px] flex flex-col">
                    <h3 className="koffy-mono text-xs text-white uppercase mb-6 flex items-center gap-3 shrink-0"><TrendingUp size={18} className="text-brand-accent"/> Tendencias Históricas</h3>
                    <div className="overflow-y-auto scrollbar-custom pr-2 space-y-4 flex-1">
                      {analysis.trends.map((trend, i) => {
                        let Icon = Flame;
                        let color = "text-brand-accent";
                        let border = "border-l-brand-accent";
                        if (trend.type === 'goal') { Icon = Goal; color = "text-brand-green"; border = "border-l-brand-green"; }
                        if (trend.type === 'card') { Icon = AlertTriangle; color = "text-brand-gold"; border = "border-l-brand-gold"; }
                        if (trend.type === 'corner') { Icon = Flag; color = "text-purple-400"; border = "border-l-purple-400"; }
                        if (trend.type === 'time') { Icon = Clock; color = "text-brand-accent"; border = "border-l-brand-accent"; }
                        if (trend.type === 'warning') { Icon = Shield; color = "text-brand-red"; border = "border-l-brand-red"; }
                        if (trend.type === 'history') { Icon = History; color = "text-brand-gray"; border = "border-l-brand-gray"; }

                        return (
                          <div key={i} className={`bg-brand-bg border-l-4 ${border} border border-brand-border rounded-xl p-5 flex items-center gap-4 transition-transform hover:-translate-y-0.5`}>
                            <div className={`p-2 rounded-lg bg-brand-surface border border-brand-border shrink-0 ${color}`}>
                              <Icon size={18} />
                            </div>
                            <p className="koffy-mono text-[11px] text-white leading-relaxed">{trend.text}</p>
                          </div>
                        )
                      })}
                    </div>
                  </motion.div>
                )}

                {/* PESTAÑA: PROBABILIDADES VISUALES */}
                {activeTab === 'probabilidades' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-brand-surface border border-brand-border2 rounded-[2rem] p-10">
                    <h3 className="koffy-mono text-xs text-white uppercase mb-10 flex items-center gap-3"><BarChart3 size={18} className="text-brand-green"/> Análisis de Probabilidades</h3>
                    <div className="max-w-3xl mx-auto space-y-12">
                      <ProgressBar3 
                        label="RESULTADO DEL PARTIDO (1X2)" 
                        val1={analysis.probabilities.homeWin} 
                        val2={analysis.probabilities.draw} 
                        val3={analysis.probabilities.awayWin} 
                        lbl1={`1 - ${homeTeam?.name}`} 
                        lbl2="X - EMPATE" 
                        lbl3={`2 - ${awayTeam?.name}`}
                      />
                      <ProgressBar 
                        label="MERCADO DE GOLES" 
                        leftLabel="MÁS DE 2.5 GOLES" 
                        rightLabel="MENOS DE 2.5 GOLES" 
                        leftValue={analysis.probabilities.over25} 
                        rightValue={analysis.probabilities.under25} 
                        colorLeft="bg-blue-500" 
                        colorRight="bg-gray-600" 
                      />
                      <ProgressBar 
                        label="AMBOS EQUIPOS MARCAN (BTTS)" 
                        leftLabel="SÍ MARCAN" 
                        rightLabel="NO MARCAN" 
                        leftValue={analysis.probabilities.bttsYes} 
                        rightValue={analysis.probabilities.bttsNo} 
                        colorLeft="bg-purple-500" 
                        colorRight="bg-gray-600" 
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

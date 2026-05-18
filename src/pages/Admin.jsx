import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Activity, 
  ShieldCheck, 
  Search,
  Zap,
  Globe
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase.config';
import { fetchApiSportsStatus } from '../services/mockData';

const Admin = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const apiStatus = await fetchApiSportsStatus();
        const querySnapshot = await getDocs(collection(db, 'users'));
        const rawUsersList = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          rawUsersList.push({
            id: doc.id,
            email: data.email || 'unknown@koffy.com',
            status: data.status || 'active',
            queries: data.queries || 0,
            queriesToday: data.queriesToday || 0,
            role: data.role || 'user',
            createdAt: data.createdAt || '17/05/2026'
          });
        });

        // Filtrar duplicados por correo, priorizando la cuenta con el UID real de Firebase (generalmente 28 caracteres)
        const uniqueUsersMap = {};
        rawUsersList.forEach(user => {
          const emailKey = user.email.toLowerCase();
          const existing = uniqueUsersMap[emailKey];
          
          if (!existing) {
            uniqueUsersMap[emailKey] = user;
          } else {
            // Si el nuevo documento tiene un UID real de longitud 28, lo priorizamos sobre registros mock antiguos
            if (user.id.length === 28 && existing.id.length !== 28) {
              uniqueUsersMap[emailKey] = user;
            }
          }
        });

        const usersList = Object.values(uniqueUsersMap);

        // Calcular estadísticas 100% reales basadas en la colección filtrada
        const totalUsers = usersList.length;
        const activeSubscriptions = usersList.filter(u => u.status === 'active').length;
        const monthlyQueries = usersList.reduce((acc, curr) => acc + (curr.queries || 0), 0);

        setStats({
          totalUsers,
          monthlyQueries,
          activeSubscriptions,
          apiStatus
        });
        setUsers(usersList);
      } catch (error) {
        console.error("Error al cargar datos reales de Firestore:", error);
        toast.error("Error al establecer enlace con la Base de Datos");
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const toggleUserStatus = async (userId) => {
    const userToUpdate = users.find(u => u.id === userId);
    if (!userToUpdate) return;

    const newStatus = userToUpdate.status === 'active' ? 'suspended' : 'active';
    const userRef = doc(db, 'users', userId);

    try {
      await updateDoc(userRef, { status: newStatus });
      setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus } : u));

      // Actualizar los Bento Stats en tiempo real
      setStats(prev => {
        const newActive = newStatus === 'active' ? prev.activeSubscriptions + 1 : prev.activeSubscriptions - 1;
        return {
          ...prev,
          activeSubscriptions: newActive
        };
      });

      toast.success(`Acceso ${newStatus === 'active' ? 'Restablecido' : 'Revocado'}`);
    } catch (err) {
      console.error("Error al suspender/activar usuario en Firestore:", err);
      toast.error("Error al guardar cambio en la Base de Datos");
    }
  };

  if (isLoading) return <div className="koffy-mono text-brand-accent text-center py-20">ESTABLECIENDO CONEXIÓN CON EL SERVIDOR...</div>;

  return (
    <div className="space-y-10">
      <header>
        <h3 className="koffy-mono text-brand-accent">Nivel de Acceso: Administrador</h3>
        <h1 className="koffy-title text-4xl mt-2">PANEL DE CONTROL CENTRAL</h1>
      </header>

      {/* Stats Bento */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
        {[
          { label: 'Usuarios Totales', value: stats.totalUsers, icon: Users, accent: 'text-brand-accent' },
          { label: 'Consultas Totales (Nube)', value: stats.monthlyQueries, icon: Zap, accent: 'text-brand-gold' },
          { label: 'Activos', value: stats.activeSubscriptions, icon: Activity, accent: 'text-brand-green' },
          { 
            label: 'Consumo API Diario (Real-Time)', 
            value: `${stats.apiStatus?.current || 0} / ${stats.apiStatus?.limit || 100}`, 
            icon: Globe, 
            accent: stats.apiStatus?.current >= stats.apiStatus?.limit ? 'text-brand-red animate-pulse' : 'text-brand-accent',
            subLabel: stats.apiStatus?.current >= stats.apiStatus?.limit ? 'Cuota Agotada (Contingencia Activa)' : `Plan: ${stats.apiStatus?.plan || 'Free'}`
          },
        ].map((item, i) => (
          <motion.div 
            key={i}
            whileHover={{ y: -5 }}
            className="koffy-card p-3 md:p-6 bg-gradient-to-br from-card to-bg flex flex-col justify-between"
          >
            <div>
              <div className={`p-1.5 md:p-2 rounded-lg bg-brand-bg border border-brand-border w-fit mb-3 md:mb-4 ${item.accent}`}>
                <item.icon size={16} className="md:w-5 md:h-5" />
              </div>
              <p className="koffy-mono text-[7px] md:text-[9px] text-brand-gray uppercase tracking-wider truncate">{item.label}</p>
              <p className="koffy-title text-base sm:text-xl md:text-3xl mt-1 tracking-wider truncate">{item.value}</p>
            </div>
            {item.subLabel && (
              <p className="koffy-mono text-[6px] md:text-[8px] text-brand-gray mt-2 truncate">{item.subLabel}</p>
            )}
          </motion.div>
        ))}
      </section>

      {/* User Table */}
      <section className="koffy-card overflow-hidden">
        <div className="p-6 border-b border-brand-border flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="text-brand-accent" size={20} />
            <h2 className="koffy-title text-xl">GESTIÓN DE ACCESOS</h2>
          </div>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-gray" size={14} />
            <input type="text" placeholder="Filtrar por terminal..." className="koffy-input pl-10 py-2 text-xs" />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-brand-bg text-brand-gray">
              <tr>
                <th className="px-6 py-4 koffy-mono text-[9px]">ID USUARIO</th>
                <th className="px-6 py-4 koffy-mono text-[9px]">FECHA INICIO</th>
                <th className="px-6 py-4 koffy-mono text-[9px]">CONSULTAS DÍA</th>
                <th className="px-6 py-4 koffy-mono text-[9px]">CONSULTAS MES</th>
                <th className="px-6 py-4 koffy-mono text-[9px]">ESTADO SISTEMA</th>
                <th className="px-6 py-4 koffy-mono text-[9px] text-right">CONEXIÓN</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-brand-accent/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-brand-border flex items-center justify-center koffy-mono text-brand-accent">
                        {u.email[0].toUpperCase()}
                      </div>
                      <span className="font-mono text-sm group-hover:text-brand-accent transition-colors">{u.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-brand-gray">{u.createdAt}</td>
                  <td className="px-6 py-4 font-mono text-sm text-brand-gold">{u.queriesToday || 0}</td>
                  <td className="px-6 py-4 font-mono text-sm">{u.queries}</td>
                  <td className="px-6 py-4">
                    <div 
                      onClick={() => toggleUserStatus(u.id)}
                      className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${u.status === 'active' ? 'bg-brand-green' : 'bg-brand-border2'}`}
                    >
                      <div className={`absolute top-1 w-3 h-3 bg-brand-bg rounded-full transition-all ${u.status === 'active' ? 'right-1' : 'left-1'}`}></div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`koffy-mono text-[8px] px-2 py-1 rounded border ${
                      u.status === 'active' ? 'border-brand-green/30 text-brand-green' : 'border-brand-red/30 text-brand-red'
                    }`}>
                      {u.status === 'active' ? 'ONLINE' : 'LOCKED'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default Admin;

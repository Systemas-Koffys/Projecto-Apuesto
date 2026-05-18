import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebase.config';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // LISTA DE CORREOS QUE SERÁN ADMINISTRADORES (ROOT)
  const ADMIN_EMAILS = [
    'koffy69309970@gmail.com'
  ];

  useEffect(() => {
    let unsubscribeSnapshot = null;

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        if (currentUser) {
          const isAdmin = ADMIN_EMAILS.includes(currentUser.email);
          let role = isAdmin ? 'admin' : 'user';
          let status = 'active';
          let queries = 0;
          
          // 1. Establecer datos locales de inmediato en memoria y desbloquear la pantalla al instante (0ms de pantalla negra)
          const initialUserData = {
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName || currentUser.email.split('@')[0],
            photoURL: currentUser.photoURL || '',
            role: role,
            status: status,
            queries: queries,
            subscription: 'active',
            createdAt: new Date().toLocaleDateString('es-ES')
          };
          
          setUser(initialUserData);
          setLoading(false); // <-- DESBLOQUEO INSTANTÁNEO DE PANTALLA
          
          // 2. Sincronización con Firestore en segundo plano con escuchador en tiempo real
          if (db) {
            const userRef = doc(db, 'users', currentUser.uid);
            
            // Primero aseguramos que la cuenta inicial existe en Firestore
            (async () => {
              try {
                const userSnap = await getDoc(userRef);
                if (!userSnap.exists()) {
                  await setDoc(userRef, initialUserData, { merge: true });
                }
              } catch (fsErr) {
                console.warn("Sincronización inicial Firestore en segundo plano omitida:", fsErr.message);
              }
            })();

            // Suscribirse a cambios del perfil de usuario en tiempo real en la nube
            unsubscribeSnapshot = onSnapshot(userRef, (snapshot) => {
              if (snapshot.exists()) {
                const data = snapshot.data();
                setUser(prev => {
                  if (!prev) return null;
                  return {
                    ...prev,
                    role: data.role || prev.role,
                    status: data.status || prev.status,
                    queries: data.queries || prev.queries,
                    createdAt: data.createdAt || prev.createdAt,
                    unlockedAt: data.unlockedAt || data.createdAt || prev.createdAt,
                  };
                });
              }
            }, (fsErr) => {
              console.warn("Escuchador en tiempo real de Firestore omitido:", fsErr.message);
            });
          }
        } else {
          setUser(null);
          setLoading(false);
          if (unsubscribeSnapshot) {
            unsubscribeSnapshot();
            unsubscribeSnapshot = null;
          }
        }
      } catch (err) {
        console.error("Error crítico en cambio de estado de Auth:", err);
        setLoading(false);
      }
    });

    return () => {
      unsubscribe();
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, []);

  const login = async (email, password) => {
    return await signInWithEmailAndPassword(auth, email, password);
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    return await signInWithPopup(auth, provider);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const updateUserProfile = async (displayName, photoURL) => {
    if (auth.currentUser) {
      await updateProfile(auth.currentUser, { displayName, photoURL });
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await setDoc(userRef, { displayName, photoURL }, { merge: true });
      setUser(prev => prev ? { ...prev, displayName, photoURL } : null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, loginWithGoogle, logout, updateUserProfile, isAuthenticated: !!user }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

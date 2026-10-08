import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, apiPost } from './api';

const AuthContext = createContext(null);
const TOKEN_KEY = 'talenthub.token';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(localStorage.getItem(TOKEN_KEY)));

  const signOut = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return undefined;
    }
    let active = true;
    api('/auth/me/', { token })
      .then((currentUser) => {
        if (active) setUser(currentUser);
      })
      .catch(() => {
        if (active) signOut();
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [token, signOut]);

  useEffect(() => {
    window.addEventListener('talenthub:unauthorized', signOut);
    return () => window.removeEventListener('talenthub:unauthorized', signOut);
  }, [signOut]);

  const acceptSession = useCallback((session) => {
    localStorage.setItem(TOKEN_KEY, session.token);
    setToken(session.token);
    setUser(session.usuario);
    setLoading(false);
  }, []);

  const signIn = useCallback(async (credentials) => {
    const session = await apiPost('/auth/login/', credentials);
    acceptSession(session);
    return session.usuario;
  }, [acceptSession]);

  const refreshUser = useCallback(async () => {
    if (!token) return null;
    const currentUser = await api('/auth/me/', { token });
    setUser(currentUser);
    return currentUser;
  }, [token]);

  const signUp = useCallback(async (role, details) => {
    const endpoint = role === 'empresa' ? '/auth/register/company/' : '/auth/register/student/';
    const session = await apiPost(endpoint, details);
    acceptSession(session);
    return session.usuario;
  }, [acceptSession]);

  const signOutRemote = useCallback(async () => {
    try {
      if (token) await apiPost('/auth/logout/', {}, token);
    } finally {
      signOut();
    }
  }, [signOut, token]);

  const value = useMemo(
    () => ({ token, user, loading, signIn, signUp, refreshUser, signOut: signOutRemote }),
    [token, user, loading, signIn, signUp, refreshUser, signOutRemote],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser usado dentro de AuthProvider.');
  return context;
}

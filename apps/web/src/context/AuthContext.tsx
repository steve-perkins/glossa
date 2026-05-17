import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { MeResponse } from '@glossa/shared';
import { apiFetch } from '../api/client';

interface AuthState {
  user: MeResponse | null;
  accessToken: string | null;
  isLoading: boolean;
  signIn: (googleIdToken: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
  user: null,
  accessToken: null,
  isLoading: true,
  signIn: async () => {},
  signOut: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<MeResponse | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Guards against StrictMode double-invocation of the startup effect
  const sessionRestoredRef = useRef(false);

  const scheduleRefresh = useCallback((delayMs: number) => {
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    refreshTimerRef.current = setTimeout(() => doRefresh(), delayMs);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const doRefresh = useCallback(async (): Promise<string | null> => {
    try {
      const { accessToken: token } = await apiFetch<{ accessToken: string }>('/auth/refresh', { method: 'POST' });
      setAccessToken(token);
      scheduleRefresh(14 * 60 * 1000);
      return token;
    } catch {
      setAccessToken(null);
      setUser(null);
      return null;
    }
  }, [scheduleRefresh]);

  const fetchMe = useCallback(async (token: string) => {
    try {
      const me = await apiFetch<MeResponse>('/me', { token });
      setUser(me);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    if (sessionRestoredRef.current) return;
    sessionRestoredRef.current = true;

    async function restoreSession() {
      const token = await doRefresh();
      if (token) await fetchMe(token);
      setIsLoading(false);
    }
    restoreSession();
    return () => {
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    };
  }, [doRefresh, fetchMe]);

  const signIn = useCallback(async (googleIdToken: string) => {
    const { accessToken: token } = await apiFetch<{ accessToken: string }>('/auth/google', {
      method: 'POST',
      body: { idToken: googleIdToken },
    });
    setAccessToken(token);
    scheduleRefresh(14 * 60 * 1000);
    await fetchMe(token);
  }, [scheduleRefresh, fetchMe]);

  const signOut = useCallback(async () => {
    try {
      await apiFetch('/auth/logout', { method: 'POST' });
    } catch {}
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    setAccessToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, accessToken, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

type Mode = 'light' | 'dark';

interface AppThemeCtx {
  mode: Mode;
  isDark: boolean;
  toggle: () => void;
}

const AppThemeContext = createContext<AppThemeCtx>({
  mode: 'light',
  isDark: false,
  toggle: () => {},
});

const STORAGE_KEY = '@mibalance_theme';

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<Mode>('light');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((val: string | null) => { if (val === 'dark') setMode('dark'); })
      .catch(() => {});
  }, []);

  const toggle = useCallback(() => {
    setMode(prev => {
      const next = prev === 'light' ? 'dark' : 'light';
      AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
      return next;
    });
  }, []);

  return (
    <AppThemeContext.Provider value={{ mode, isDark: mode === 'dark', toggle }}>
      {children}
    </AppThemeContext.Provider>
  );
}

export function useAppTheme() {
  return useContext(AppThemeContext);
}

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'light' | 'dark';

export interface ThemeColors {
  background: string;
  card: string;
  text: string;
  textSecondary: string;
  border: string;
  headerBackground: string;
  inputBackground: string;
  primary: string;
  danger: string;
  // Bubbly pastel card accents
  lavenderCard: string;
  lavenderText: string;
  orangeCard: string;
  orangeText: string;
}

export const lightColors: ThemeColors = {
  background: '#F8F9FB',
  card: '#ffffff',
  text: '#1e293b',
  textSecondary: '#64748b',
  border: '#f1f5f9',
  headerBackground: '#F8F9FB',
  inputBackground: '#ffffff',
  primary: '#3B82F6',
  danger: '#ef4444',
  lavenderCard: '#EAE3FF',
  lavenderText: '#5C3BFF',
  orangeCard: '#FFE8D6',
  orangeText: '#FF6B00',
};

export const darkColors: ThemeColors = {
  background: '#121212',
  card: '#1E1E1E',
  text: '#f8fafc',
  textSecondary: '#94a3b8',
  border: '#2a2a2a',
  headerBackground: '#181818',
  inputBackground: '#2a2a2a',
  primary: '#3B82F6',
  danger: '#ef4444',
  lavenderCard: '#2e1065',
  lavenderText: '#c084fc',
  orangeCard: '#7c2d12',
  orangeText: '#fdba74',
};

interface ThemeContextType {
  theme: ThemeMode;
  isDark: boolean;
  colors: ThemeColors;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'user_theme_preference';

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  // Always default to Light Mode on launch
  const [theme, setTheme] = useState<ThemeMode>('light');

  useEffect(() => {
    const loadStoredTheme = async () => {
      try {
        const storedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (storedTheme === 'dark') {
          setTheme('dark');
        } else {
          setTheme('light');
        }
      } catch (e) {
        setTheme('light');
      }
    };
    loadStoredTheme();
  }, []);

  const toggleTheme = async () => {
    const nextTheme: ThemeMode = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    } catch (e) {
      // Ignore write errors
    }
  };

  const isDark = theme === 'dark';
  const colors = isDark ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ theme, isDark, colors, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

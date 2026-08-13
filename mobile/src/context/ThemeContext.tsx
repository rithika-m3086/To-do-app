import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'light' | 'dark';

export interface ThemeColors {
  background: string;
  card: string;
  cardGlass: string;
  text: string;
  textSecondary: string;
  border: string;
  headerBackground: string;
  inputBackground: string;
  primary: string;
  danger: string;
  // Priority Fills and Badges
  highPriorityBg: string;
  highPriorityTag: string;
  mediumPriorityBg: string;
  mediumPriorityTag: string;
  lowPriorityBg: string;
  lowPriorityTag: string;
  // Bubbly pastel feature cards
  lavenderCard: string;
  lavenderText: string;
  orangeCard: string;
  orangeText: string;
}

export const lightColors: ThemeColors = {
  background: '#ffffff',
  card: '#ffffff',
  cardGlass: 'rgba(255, 255, 255, 0.95)',
  text: '#0F172A', // Deep slate navy
  textSecondary: '#475569',
  border: '#e2e8f0',
  headerBackground: 'rgba(255, 255, 255, 0.85)',
  inputBackground: '#ffffff',
  primary: '#0077B6', // Ocean Blue
  danger: '#EF4444',
  // Priority Mapping
  highPriorityBg: '#FFEAD9',
  highPriorityTag: '#FF6B35',
  mediumPriorityBg: '#FCE4EC',
  mediumPriorityTag: '#E6399B',
  lowPriorityBg: '#E0F2FE',
  lowPriorityTag: '#0077B6',
  // Feature Cards
  lavenderCard: '#EAE3FF',
  lavenderText: '#5C3BFF',
  orangeCard: '#FFEAD9',
  orangeText: '#FF6B35',
};

export const darkColors: ThemeColors = {
  background: '#000000', // Pure pitch black
  card: '#121212', // Dark card container
  cardGlass: '#18181B',
  text: '#F8FAFC',
  textSecondary: '#A1A1AA',
  border: '#27272A',
  headerBackground: '#09090B',
  inputBackground: '#18181B',
  primary: '#0077B6',
  danger: '#EF4444',
  highPriorityBg: '#451a03',
  highPriorityTag: '#FF6B35',
  mediumPriorityBg: '#500724',
  mediumPriorityTag: '#E6399B',
  lowPriorityBg: '#075985',
  lowPriorityTag: '#38BDF8',
  lavenderCard: '#1e1b4b',
  lavenderText: '#C084FC',
  orangeCard: '#451a03',
  orangeText: '#FDBA74',
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
  // Default to Light Mode on startup
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

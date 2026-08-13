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
  background: 'transparent',
  card: '#ffffff',
  cardGlass: 'rgba(255, 255, 255, 0.88)',
  text: '#0F172A', // Deep slate navy
  textSecondary: '#475569',
  border: 'rgba(255, 255, 255, 0.5)',
  headerBackground: 'rgba(255, 255, 255, 0.75)',
  inputBackground: 'rgba(255, 255, 255, 0.9)',
  primary: '#0284C7', // Cyan / Ocean Blue
  danger: '#EF4444',
  // Priority Mapping
  highPriorityBg: '#FFEAD9',
  highPriorityTag: '#FF6B35',
  mediumPriorityBg: '#FCE4EC',
  mediumPriorityTag: '#E6399B',
  lowPriorityBg: '#E0F2FE',
  lowPriorityTag: '#0284C7',
  // Feature Cards
  lavenderCard: 'rgba(234, 227, 255, 0.92)',
  lavenderText: '#5C3BFF',
  orangeCard: 'rgba(255, 232, 214, 0.92)',
  orangeText: '#FF6B00',
};

export const darkColors: ThemeColors = {
  background: '#121212',
  card: '#1E1E1E',
  cardGlass: 'rgba(30, 30, 30, 0.92)',
  text: '#F8FAFC',
  textSecondary: '#94A3B8',
  border: '#2A2A2A',
  headerBackground: '#181818',
  inputBackground: '#2A2A2A',
  primary: '#3B82F6',
  danger: '#EF4444',
  highPriorityBg: '#7C2D12',
  highPriorityTag: '#FF6B35',
  mediumPriorityBg: '#831843',
  mediumPriorityTag: '#E6399B',
  lowPriorityBg: '#075985',
  lowPriorityTag: '#38BDF8',
  lavenderCard: '#2E1065',
  lavenderText: '#C084FC',
  orangeCard: '#7C2D12',
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
  // Always default to Light Mode on startup
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

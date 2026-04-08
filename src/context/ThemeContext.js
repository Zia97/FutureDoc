import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Single accent used everywhere — no per-section colours.
const ACCENT_DARK = '#4a9eff';
const ACCENT_LIGHT = '#1e60d5';

const DARK_THEME = {
  bg: '#080810',
  bgSecondary: '#13131f',
  bgCard: '#16213e',
  bgInput: '#1a1a2e',
  accent: ACCENT_DARK,
  accentDim: '#0f2a5a',
  text: '#ffffff',
  textSecondary: '#ffffff',
  textMuted: '#ffffff',
  border: '#2a2a40',
  borderStrong: '#2d3748',
  headerBg: '#0d1628',
  correct: '#38a169',
  correctBg: '#1a3a2a',
  correctText: '#68d391',
  incorrect: '#e53e3e',
  incorrectBg: '#3a1a1a',
  incorrectText: '#fc8181',
  danger: '#ef4444',
  statusBar: 'light-content',
  sectionVR: ACCENT_DARK,
  sectionDM: ACCENT_DARK,
  sectionQR: ACCENT_DARK,
  sectionSJ: ACCENT_DARK,
  gradientTop: '#0a1830',
};

const LIGHT_THEME = {
  bg: '#f0f4ff',
  bgSecondary: '#e8edf8',
  bgCard: '#ffffff',
  bgInput: '#eef2fa',
  accent: ACCENT_LIGHT,
  accentDim: '#dbeafe',
  text: '#000000',
  textSecondary: '#000000',
  textMuted: '#000000',
  border: '#d1d9f0',
  borderStrong: '#c8d3e8',
  headerBg: '#1e3a8a',
  correct: '#16a34a',
  correctBg: '#dcfce7',
  correctText: '#15803d',
  incorrect: '#dc2626',
  incorrectBg: '#fee2e2',
  incorrectText: '#b91c1c',
  danger: '#dc2626',
  statusBar: 'dark-content',
  sectionVR: ACCENT_LIGHT,
  sectionDM: ACCENT_LIGHT,
  sectionQR: ACCENT_LIGHT,
  sectionSJ: ACCENT_LIGHT,
  gradientTop: '#dbeafe',
};

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem('theme_dark').then((val) => {
      if (val !== null) setIsDark(val === 'true');
    });
  }, []);

  function toggleDark() {
    setIsDark((v) => {
      const next = !v;
      AsyncStorage.setItem('theme_dark', String(next));
      return next;
    });
  }

  const theme = isDark ? DARK_THEME : LIGHT_THEME;
  // practiceTheme kept as alias of theme for backwards compatibility with existing consumers.
  const practiceTheme = theme;

  return (
    <ThemeContext.Provider value={{ theme, practiceTheme, isDark, toggleDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DARK_THEME = {
  bg: '#080810',
  bgSecondary: '#13131f',
  bgCard: '#16213e',
  bgInput: '#1a1a2e',
  accent: '#4a9eff',
  accentDim: '#0f2a5a',
  text: '#ffffff',
  textSecondary: '#a0aec0',
  textMuted: '#6b7280',
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
  sectionVR: '#7c3aed',
  sectionDM: '#0891b2',
  sectionQR: '#059669',
  sectionSJ: '#d97706',
  gradientTop: '#0a1830',
};

const LIGHT_THEME = {
  bg: '#f0f4ff',
  bgSecondary: '#e8edf8',
  bgCard: '#ffffff',
  bgInput: '#eef2fa',
  accent: '#1e60d5',
  accentDim: '#dbeafe',
  text: '#0f1729',
  textSecondary: '#4b5563',
  textMuted: '#9ca3af',
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
  sectionVR: '#7c3aed',
  sectionDM: '#0891b2',
  sectionQR: '#059669',
  sectionSJ: '#d97706',
  gradientTop: '#dbeafe',
};

// Replicates the real UCAT interface: white bg, blue header bar, bordered boxes
const UCAT_THEME = {
  bg: '#ffffff',
  bgSecondary: '#f5f5f5',
  bgCard: '#ffffff',
  bgInput: '#f0f0f0',
  accent: '#3d5a9e',
  accentDim: '#e8edf8',
  text: '#000000',
  textSecondary: '#333333',
  textMuted: '#666666',
  border: '#cccccc',
  borderStrong: '#888888',
  headerBg: '#3d5a9e',
  correct: '#16a34a',
  correctBg: '#f0fff4',
  correctText: '#15803d',
  incorrect: '#dc2626',
  incorrectBg: '#fff0f0',
  incorrectText: '#b91c1c',
  danger: '#dc2626',
  statusBar: 'dark-content',
  sectionVR: '#7c3aed',
  sectionDM: '#0891b2',
  sectionQR: '#059669',
  sectionSJ: '#d97706',
  gradientTop: '#ffffff',
};

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(true);
  const [useUCATScheme, setUseUCATScheme] = useState(false);

  useEffect(() => {
    AsyncStorage.multiGet(['theme_dark', 'theme_ucat']).then((pairs) => {
      const darkVal = pairs[0][1];
      const ucatVal = pairs[1][1];
      if (darkVal !== null) setIsDark(darkVal === 'true');
      if (ucatVal !== null) setUseUCATScheme(ucatVal === 'true');
    });
  }, []);

  function toggleDark() {
    setIsDark((v) => {
      const next = !v;
      AsyncStorage.setItem('theme_dark', String(next));
      return next;
    });
  }

  function toggleUCATScheme() {
    setUseUCATScheme((v) => {
      const next = !v;
      AsyncStorage.setItem('theme_ucat', String(next));
      return next;
    });
  }

  const theme = isDark ? DARK_THEME : LIGHT_THEME;
  // practiceTheme: UCAT scheme when toggle is on, otherwise follows global theme
  const practiceTheme = useUCATScheme ? UCAT_THEME : theme;

  return (
    <ThemeContext.Provider value={{ theme, practiceTheme, isDark, useUCATScheme, toggleDark, toggleUCATScheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

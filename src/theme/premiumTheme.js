const darkPremiumColors = {
  bgTop: '#08131f',
  bgMid: '#07192e',
  bgBottom: '#02050c',
  surface: '#081426',
  surfaceRaised: '#0d1a31',
  surfaceSoft: '#12213b',
  border: 'rgba(116, 154, 209, 0.24)',
  borderStrong: 'rgba(62, 139, 255, 0.58)',
  text: '#F4F8FF',
  textSecondary: '#B8C6DA',
  textMuted: '#7188A6',
  blue: '#3D8BFF',
  cyan: '#22D3EE',
  teal: '#28D8D4',
  red: '#FB4C7A',
  purple: '#8B5CF6',
  mint: '#5EF2C1',
  amber: '#FF9F43',
};

const lightPremiumColors = {
  bgTop: '#F8FBFF',
  bgMid: '#EEF5FF',
  bgBottom: '#E7EEF8',
  surface: '#FFFFFF',
  surfaceRaised: '#F7FAFF',
  surfaceSoft: '#EAF2FF',
  border: 'rgba(69, 94, 140, 0.22)',
  borderStrong: 'rgba(37, 99, 235, 0.42)',
  text: '#0F172A',
  textSecondary: '#334155',
  textMuted: '#64748B',
  blue: '#2563EB',
  cyan: '#0891B2',
  teal: '#0F9F9B',
  red: '#E11D48',
  purple: '#7C3AED',
  mint: '#059669',
  amber: '#D97706',
};

const darkPremiumGradients = {
  screen: ['#08131f', '#061426', '#02050c'],
  hero: ['rgba(18, 39, 74, 0.98)', 'rgba(9, 26, 55, 0.98)', 'rgba(4, 11, 25, 1)'],
  glass: ['rgba(18, 35, 64, 0.96)', 'rgba(8, 22, 43, 0.96)', 'rgba(4, 10, 23, 0.98)'],
};

const lightPremiumGradients = {
  screen: ['#F8FBFF', '#EEF5FF', '#E7EEF8'],
  hero: ['rgba(255, 255, 255, 0.98)', 'rgba(239, 246, 255, 0.98)', 'rgba(224, 235, 250, 1)'],
  glass: ['rgba(255, 255, 255, 0.98)', 'rgba(246, 250, 255, 0.98)', 'rgba(235, 243, 255, 0.98)'],
};

export const premiumColors = darkPremiumColors;
export const premiumLightColors = lightPremiumColors;
export const premiumGradients = darkPremiumGradients;
export const premiumLightGradients = lightPremiumGradients;

export function getPremiumTheme(isDark = true) {
  return {
    colors: isDark ? darkPremiumColors : lightPremiumColors,
    gradients: isDark ? darkPremiumGradients : lightPremiumGradients,
    isDark,
  };
}

export function hexToRgba(hex, alpha = 1) {
  const value = hex.replace('#', '');
  const normalized = value.length === 3
    ? value.split('').map((char) => char + char).join('')
    : value;

  const int = parseInt(normalized, 16);
  const r = (int >> 16) & 255;
  const g = (int >> 8) & 255;
  const b = int & 255;

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

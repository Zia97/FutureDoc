import { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

/**
 * Slim banner shown during a background content refresh.
 *
 * Props:
 *   visible   — boolean, controls show/hide
 *   progress  — { loaded: number, total: number } where total may be null
 *               while the page count is not yet known
 *   label     — optional override string (e.g. "Updating tests...")
 */
export default function SyncBanner({ visible, progress, label }) {
  const { theme: t } = useTheme();
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: visible ? 1 : 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [visible, opacity]);

  const text = label ?? buildText(progress);

  return (
    <Animated.View style={[styles.banner, { backgroundColor: t.accent, opacity }]} pointerEvents="none">
      <Text style={styles.bannerText}>{text}</Text>
    </Animated.View>
  );
}

function buildText(progress) {
  if (!progress) return 'Updating questions...';
  const { loaded, total } = progress;
  if (total != null && total > 0) return `Updating questions... ${loaded}/${total}`;
  return `Updating questions... (${loaded} page${loaded !== 1 ? 's' : ''})`;
}

const styles = StyleSheet.create({
  banner: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  bannerText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});

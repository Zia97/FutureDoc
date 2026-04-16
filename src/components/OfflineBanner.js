import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNetwork } from '../context/NetworkContext';
import { useTheme } from '../context/ThemeContext';

const RECONNECT_HOLD_MS = 1800;

export default function OfflineBanner() {
  const { isOnline } = useNetwork();
  const { theme: t } = useTheme();
  const insets = useSafeAreaInsets();

  // visible drives whether the banner is on screen at all.
  // mode is 'offline' (red) or 'online' (green flash before hide).
  const [visible, setVisible] = useState(false);
  const [mode, setMode] = useState('offline');
  const translateY = useRef(new Animated.Value(-100)).current;
  const wasOfflineRef = useRef(false);

  useEffect(() => {
    if (!isOnline) {
      wasOfflineRef.current = true;
      setMode('offline');
      setVisible(true);
      Animated.timing(translateY, { toValue: 0, duration: 220, useNativeDriver: true }).start();
      return;
    }

    if (!wasOfflineRef.current) return; // never went offline — nothing to show

    setMode('online');
    setVisible(true);
    Animated.timing(translateY, { toValue: 0, duration: 220, useNativeDriver: true }).start();
    const timer = setTimeout(() => {
      Animated.timing(translateY, { toValue: -100, duration: 220, useNativeDriver: true }).start(() => {
        setVisible(false);
        wasOfflineRef.current = false;
      });
    }, RECONNECT_HOLD_MS);
    return () => clearTimeout(timer);
  }, [isOnline, translateY]);

  if (!visible) return null;

  const isOffline = mode === 'offline';
  const bg = isOffline ? '#7f1d1d' : '#166534';
  const icon = isOffline ? 'wifi-off' : 'wifi-check';
  const message = isOffline
    ? 'No internet connection — some features are unavailable'
    : 'Back online';

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.wrap,
        { paddingTop: insets.top + 6, backgroundColor: bg, transform: [{ translateY }] },
      ]}
    >
      <View style={styles.row}>
        <MaterialCommunityIcons name={icon} size={16} color="#ffffff" />
        <Text style={styles.text} numberOfLines={1}>{message}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingBottom: 8,
    paddingHorizontal: 12,
    zIndex: 9999,
    elevation: 9999,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  text: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
});

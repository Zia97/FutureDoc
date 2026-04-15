import { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../lib/dbQueries';
import { reportError } from '../../lib/reportError';

import VRAnalyticsScreen from './VRAnalyticsScreen';
import DMAnalyticsScreen from './DMAnalyticsScreen';
import QRAnalyticsScreen from './QRAnalyticsScreen';
import SJAnalyticsScreen from './SJAnalyticsScreen';

// ─────────────────────────────────────────────────────────────────────────────
// Tab bar
// ─────────────────────────────────────────────────────────────────────────────

const SECTIONS = [
  { key: 'VR', label: 'VR', loader: 'loadVRAnalytics' },
  { key: 'DM', label: 'DM', loader: 'loadDMAnalytics' },
  { key: 'QR', label: 'QR', loader: 'loadQRAnalytics' },
  { key: 'SJ', label: 'SJ', loader: 'loadSJAnalytics' },
];

function TabBar({ active, onSelect, t }) {
  return (
    <View style={[styles.tabBar, { backgroundColor: t.bgCard, borderBottomColor: t.border }]}>
      {SECTIONS.map((s) => {
        const isActive = s.key === active;
        return (
          <TouchableOpacity
            key={s.key}
            style={[styles.tab, isActive && { borderBottomColor: t.accent }]}
            onPress={() => onSelect(s.key)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.tabLabel,
                { color: isActive ? t.accent : t.textSecondary },
                isActive && styles.tabLabelActive,
              ]}
            >
              {s.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Screen
// ─────────────────────────────────────────────────────────────────────────────

export default function PerformanceAnalyticsScreen({ route }) {
  const { theme: t } = useTheme();
  const { user } = useAuth();
  const tests = route.params?.tests ?? {};

  const [activeTab, setActiveTab] = useState('VR');

  // Cache: { VR: [...], DM: [...], ... } — only populated on first visit per tab
  const [cache, setCache] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const loadedRef = useRef(new Set());

  const loadSection = useCallback(
    async (section) => {
      if (loadedRef.current.has(section)) return;
      if (!user) return;

      const loader = SECTIONS.find((s) => s.key === section)?.loader;
      if (!loader) return;

      setLoading(true);
      setError(null);
      try {
        const data = await db[loader]();
        loadedRef.current.add(section);
        setCache((prev) => ({ ...prev, [section]: data }));
      } catch (err) {
        reportError('PerformanceAnalytics', err, { level: 'warning', extra: { note: 'load failed', section } });
        setError(err);
      } finally {
        setLoading(false);
      }
    },
    [user],
  );

  // Load the active tab's data on focus (initial) and when switching tabs
  useFocusEffect(
    useCallback(() => {
      loadSection(activeTab);
    }, [loadSection, activeTab]),
  );

  const handleTabSelect = (key) => {
    setActiveTab(key);
    loadSection(key);
  };

  if (!user) {
    return (
      <SafeAreaView style={[styles.centered, { backgroundColor: t.bgInput }]} edges={['bottom']}>
        <StatusBar barStyle={t.statusBar} />
        <Text style={[styles.emptyTitle, { color: t.text }]}>Sign in to see analytics</Text>
        <Text style={[styles.emptyText, { color: t.textSecondary }]}>
          Performance analytics are tied to your account so they survive reinstall and
          sync across devices.
        </Text>
      </SafeAreaView>
    );
  }

  // Build a mock route.params object for the child analytics screens
  const childRoute = {
    params: {
      tests: tests[activeTab] ?? [],
    },
  };

  const rows = cache[activeTab];
  const isLoading = loading && !rows;

  // Render the right analytics content for the active tab.
  // The child screens accept { route } and render as full components.
  function renderContent() {
    if (isLoading) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={t.accent} />
        </View>
      );
    }

    if (error && !rows) {
      return (
        <View style={styles.centered}>
          <Text style={[styles.emptyText, { color: t.textSecondary }]}>
            Couldn't load analytics. Try again later.
          </Text>
        </View>
      );
    }

    // Override the analytics screen's internal data loading — inject the
    // pre-fetched rows so they don't re-fetch from the DB themselves.
    const props = { route: childRoute, preloadedRows: rows ?? [] };

    switch (activeTab) {
      case 'VR': return <VRAnalyticsScreen {...props} />;
      case 'DM': return <DMAnalyticsScreen {...props} />;
      case 'QR': return <QRAnalyticsScreen {...props} />;
      case 'SJ': return <SJAnalyticsScreen {...props} />;
      default: return null;
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: t.bgInput }]}>
      <StatusBar barStyle={t.statusBar} />
      <TabBar active={activeTab} onSelect={handleTabSelect} t={t} />
      <View style={styles.content}>
        {renderContent()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },

  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabLabel: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  tabLabelActive: {
    fontWeight: '800',
  },

  emptyTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  emptyText: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
});

import { useState, useCallback, useRef } from 'react';
import {
  Animated,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';

import { db } from '../../lib/dbQueries';
import { reportError } from '../../lib/reportError';
import {
  AppHeader,
  PremiumScreen,
  RichIconBox,
  hexToRgba,
  useFadeSlide,
} from '../../components/premium/PremiumPracticeUI';
import PremiumIcon from '../../components/premium/PremiumIcon';
import {
  AnalyticsCard,
  AnalyticsEmptyState,
  getAnalyticsSectionMeta,
  usePremiumAnalyticsTheme,
} from '../../components/premium/PremiumAnalyticsUI';

import VRAnalyticsScreen from './VRAnalyticsScreen';
import DMAnalyticsScreen from './DMAnalyticsScreen';
import QRAnalyticsScreen from './QRAnalyticsScreen';
import SJAnalyticsScreen from './SJAnalyticsScreen';
import PracticeAnalyticsView from './PracticeAnalyticsView';

const SECTIONS = [
  { key: 'VR', loader: 'loadVRAnalytics' },
  { key: 'DM', loader: 'loadDMAnalytics' },
  { key: 'QR', loader: 'loadQRAnalytics' },
  { key: 'SJ', loader: 'loadSJAnalytics' },
];

function HeroMetric({ t, label, value, accent }) {
  return (
    <View
      style={[
        styles.heroMetric,
        {
          borderColor: hexToRgba(accent ?? t.accent, 0.28),
          backgroundColor: t.isDark ? 'rgba(5, 13, 29, 0.5)' : 'rgba(255, 255, 255, 0.6)',
        },
      ]}
    >
      <Text style={[styles.heroMetricValue, { color: accent ?? t.text }]} numberOfLines={1}>
        {value}
      </Text>
      <Text style={[styles.heroMetricLabel, { color: t.textSecondary }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

function TabBar({ active, onSelect, t }) {
  return (
    <View style={styles.tabRail}>
      {SECTIONS.map((section) => {
        const meta = getAnalyticsSectionMeta(section.key, t.colors);
        const isActive = section.key === active;

        return (
          <TouchableOpacity
            key={section.key}
            style={[
              styles.tab,
              {
                borderColor: isActive ? hexToRgba(meta.accent, 0.5) : t.border,
                backgroundColor: t.isDark ? 'rgba(6, 17, 34, 0.62)' : 'rgba(255, 255, 255, 0.58)',
              },
            ]}
            onPress={() => onSelect(section.key)}
            activeOpacity={0.82}
            accessibilityRole="button"
            accessibilityLabel={`Show ${meta.title} analytics`}
          >
            {isActive ? (
              <LinearGradient
                pointerEvents="none"
                colors={[hexToRgba(meta.accent, t.isDark ? 0.28 : 0.14), hexToRgba(meta.accent, 0)]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
            ) : null}
            <View style={[styles.tabIcon, { backgroundColor: hexToRgba(meta.accent, isActive ? 0.18 : 0.09) }]}>
              <PremiumIcon name={meta.icon} size={18} color={meta.accent} secondaryColor={t.text} strokeWidth={2.1} />
            </View>
            <Text
              style={[
                styles.tabLabel,
                { color: isActive ? t.text : t.textSecondary },
                isActive && styles.tabLabelActive,
              ]}
              numberOfLines={1}
            >
              {meta.shortLabel}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function PerformanceAnalyticsScreen({ route, navigation }) {
  const tests = route.params?.tests ?? {};

  const [mode, setMode] = useState('timed'); // 'timed' | 'practice'
  const [activeTab, setActiveTab] = useState('VR');
  const [cache, setCache] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const loadedRef = useRef(new Set());

  const cacheKey = (m, section) => `${m}:${section}`;

  const t = usePremiumAnalyticsTheme(activeTab);
  const heroAnim = useFadeSlide(0, 14);
  const tabsAnim = useFadeSlide(90, 12);
  const activeMeta = t.meta;
  const activeData = cache[cacheKey(mode, activeTab)];
  const activeRows = mode === 'timed' ? activeData : (activeData?.latestAttempts ?? null);
  const loadedSections = Object.keys(cache).filter((key) => key.startsWith(`${mode}:`)).length;

  const loadSection = useCallback(
    async (m, section) => {
      const key = cacheKey(m, section);
      if (loadedRef.current.has(key)) return;

      setLoading(true);
      setError(null);
      try {
        let data;
        if (m === 'timed') {
          const loader = SECTIONS.find((s) => s.key === section)?.loader;
          if (!loader) return;
          data = await db[loader]();
        } else {
          const sectionId = { VR: 'vr', DM: 'dm', QR: 'qr', SJ: 'sj' }[section];
          data = await db.loadPracticeAnalytics(sectionId);
        }
        loadedRef.current.add(key);
        setCache((prev) => ({ ...prev, [key]: data }));
      } catch (err) {
        reportError('PerformanceAnalytics', err, { level: 'warning', extra: { note: 'load failed', mode: m, section } });
        setError(err);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useFocusEffect(
    useCallback(() => {
      loadSection(mode, activeTab);
    }, [loadSection, mode, activeTab]),
  );

  const handleTabSelect = (key) => {
    setActiveTab(key);
    loadSection(mode, key);
  };

  const handleModeSelect = (next) => {
    if (next === mode) return;
    setMode(next);
    loadSection(next, activeTab);
  };

  const childRoute = {
    params: {
      tests: tests[activeTab] ?? [],
    },
  };

  const isLoading = loading && !activeData;

  function renderContent() {
    if (isLoading) {
      return (
        <AnalyticsEmptyState
          t={t}
          loading
          title={`Loading ${activeMeta.shortLabel}`}
          message={mode === 'timed' ? 'Fetching your latest timed-test data.' : 'Fetching your practice attempts.'}
        />
      );
    }

    if (error && !activeData) {
      return (
        <AnalyticsEmptyState
          t={t}
          icon="wifi-off"
          title="Couldn't load analytics"
          message="Try again in a moment, or switch to another section."
        />
      );
    }

    if (mode === 'practice') {
      return (
        <PracticeAnalyticsView
          sectionKey={activeTab}
          preloadedData={activeData ?? { rawAttempts: [], latestAttempts: [], cohortByKey: new Map(), totalQuestions: 0 }}
        />
      );
    }

    const props = { route: childRoute, preloadedRows: activeData ?? [] };

    switch (activeTab) {
      case 'VR': return <VRAnalyticsScreen {...props} />;
      case 'DM': return <DMAnalyticsScreen {...props} />;
      case 'QR': return <QRAnalyticsScreen {...props} />;
      case 'SJ': return <SJAnalyticsScreen {...props} />;
      default: return null;
    }
  }

  return (
    <PremiumScreen>
      <StatusBar barStyle={t.statusBar} backgroundColor={t.colors.bgTop} />
      <AppHeader navigation={navigation} title="Performance" />

      <View style={styles.topContent}>
        <Animated.View style={[styles.tabWrap, tabsAnim]}>
          <View style={styles.modeToggle}>
            {['practice', 'timed'].map((m) => {
              const isActive = m === mode;
              return (
                <TouchableOpacity
                  key={m}
                  onPress={() => handleModeSelect(m)}
                  activeOpacity={0.85}
                  style={[
                    styles.modeButton,
                    {
                      backgroundColor: isActive ? hexToRgba(activeMeta.accent, t.isDark ? 0.22 : 0.14) : 'transparent',
                      borderColor: isActive ? hexToRgba(activeMeta.accent, 0.5) : t.border,
                    },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={`Show ${m} analytics`}
                >
                  <Text style={[styles.modeButtonText, { color: isActive ? t.text : t.textSecondary, fontWeight: isActive ? '900' : '700' }]}>
                    {m === 'practice' ? 'Practice' : 'Timed'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <Text style={[styles.sectionTitle, { color: t.text }]}>{activeMeta.title}</Text>
          <Text style={[styles.sectionSubtitle, { color: t.textSecondary }]}>
            {mode === 'practice'
              ? 'Your accuracy and coverage on non-timed practice questions.'
              : activeMeta.description}
          </Text>
          <TabBar active={activeTab} onSelect={handleTabSelect} t={t} />
        </Animated.View>
      </View>

      <View style={styles.content}>
        {renderContent()}
      </View>
    </PremiumScreen>
  );
}

const styles = StyleSheet.create({
  topContent: {
    paddingHorizontal: 20,
  },
  heroCard: {
    padding: 18,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  heroCopy: {
    flex: 1,
    minWidth: 0,
  },
  eyebrow: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '900',
    letterSpacing: 0,
  },
  heroTitle: {
    fontSize: 27,
    lineHeight: 32,
    fontWeight: '900',
    marginTop: 2,
  },
  heroSubtitle: {
    fontSize: 13,
    lineHeight: 19,
    marginTop: 4,
  },
  heroMetrics: {
    flexDirection: 'row',
    gap: 9,
    marginTop: 16,
  },
  heroMetric: {
    flex: 1,
    minHeight: 58,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 9,
    justifyContent: 'center',
  },
  heroMetricValue: {
    fontSize: 17,
    lineHeight: 21,
    fontWeight: '900',
  },
  heroMetricLabel: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: '800',
    marginTop: 2,
    textTransform: 'uppercase',
  },
  tabWrap: {
    paddingTop: 18,
    paddingBottom: 12,
  },
  modeToggle: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeButtonText: {
    fontSize: 13,
    letterSpacing: 0.4,
  },
  sectionTitle: {
    fontSize: 18,
    lineHeight: 23,
    fontWeight: '900',
  },
  sectionSubtitle: {
    fontSize: 13,
    lineHeight: 19,
    marginTop: 3,
    marginBottom: 12,
  },
  tabRail: {
    flexDirection: 'row',
    gap: 8,
  },
  tab: {
    flex: 1,
    minHeight: 54,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    gap: 3,
  },
  tabIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 12,
    lineHeight: 15,
    fontWeight: '800',
  },
  tabLabelActive: {
    fontWeight: '900',
  },
  content: {
    flex: 1,
  },
});

import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import { useTheme } from '../../context/ThemeContext';
import {
  PremiumIcon,
  PremiumScreen,
  PremiumScrollView,
  hexToRgba,
  premiumColors,
  useFadeSlide,
} from '../../components/premium/PremiumPracticeUI';
import { getPremiumTheme } from '../../theme/premiumTheme';
import { setExamDate, NOT_BOOKED } from '../../services/onboardingFlags';
import AppLogo from '../../components/AppLogo';

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

// Format a JS Date as YYYY-MM-DD using local components — avoids the
// timezone shift toISOString() introduces near midnight.
function formatLocalISO(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate();
}

// Mon-first 6×7 grid for the given month. Leading/trailing days are null
// so the renderer can render blanks instead of bleeding into adjacent
// months.
function buildMonthGrid(year, month) {
  const first = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const jsDow = first.getDay(); // 0=Sun
  const leading = (jsDow + 6) % 7; // shift to Mon=0

  const cells = [];
  for (let i = 0; i < leading; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export default function ExamDateScreen({ onComplete }) {
  const { isDark } = useTheme();
  const { colors, gradients } = getPremiumTheme(isDark);
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  // When opened from inside the app (no onComplete prop) we behave as a
  // regular stack screen — show a back button and pop on save instead of
  // running the onboarding gate's completion handler.
  const inApp = !onComplete;
  const canPop = inApp && navigation?.canGoBack?.();

  const today = useMemo(() => startOfDay(new Date()), []);
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selected, setSelected] = useState(null); // Date or null
  const [notBooked, setNotBooked] = useState(false);
  const [saving, setSaving] = useState(false);

  const heroAnim = useFadeSlide(0);
  const calendarAnim = useFadeSlide(120);
  const optAnim = useFadeSlide(220);

  const grid = useMemo(() => buildMonthGrid(viewYear, viewMonth), [viewYear, viewMonth]);

  // Allow navigating back to current month even if the user paged forward
  // a few times, but never before today.
  const canGoBack = viewYear > today.getFullYear()
    || (viewYear === today.getFullYear() && viewMonth > today.getMonth());

  const goPrev = () => {
    if (!canGoBack) return;
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const goNext = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleSelectDay = (date) => {
    if (!date) return;
    if (date < today) return;
    setNotBooked(false);
    setSelected(date);
  };

  const handleToggleNotBooked = () => {
    setNotBooked((prev) => {
      const next = !prev;
      if (next) setSelected(null);
      return next;
    });
  };

  const handleContinue = async () => {
    if (!selected && !notBooked) {
      Alert.alert('Almost there', 'Pick a date or tap "Not booked yet" to continue.');
      return;
    }
    setSaving(true);
    try {
      await setExamDate(notBooked ? NOT_BOOKED : formatLocalISO(selected));
      if (onComplete) {
        onComplete();
      } else {
        navigation.goBack();
      }
    } catch (e) {
      Alert.alert('Could not save', e.message ?? 'Please try again.');
      setSaving(false);
    }
  };

  const monthLabel = `${MONTHS[viewMonth]} ${viewYear}`;
  const continueDisabled = saving || (!selected && !notBooked);

  return (
    <PremiumScreen>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.bgTop} />

      <View style={[styles.brandHeader, { paddingTop: Math.max(insets.top, 12) + 6 }]}>
        {canPop ? (
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={[
              styles.backButton,
              {
                borderColor: hexToRgba(colors.blue, 0.32),
                backgroundColor: isDark ? 'rgba(8, 18, 36, 0.78)' : 'rgba(255, 255, 255, 0.92)',
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Back"
          >
            <PremiumIcon name="chevron-left" size={20} color={colors.text} strokeWidth={2.4} />
          </TouchableOpacity>
        ) : (
          <AppLogo
            size={48}
            radius={16}
            shadowColor={colors.blue}
            borderColor={hexToRgba(colors.blue, 0.42)}
          />
        )}
        <View style={styles.brandText}>
          <Text style={[styles.brandTitle, { color: colors.text }]}>Your exam date</Text>
          <Text style={[styles.brandTagline, { color: colors.cyan }]}>COUNTDOWN</Text>
        </View>
      </View>

      <PremiumScrollView contentContainerStyle={styles.scroll}>
        <Animated.View style={[styles.hero, heroAnim]}>
          <Text style={[styles.heading, { color: colors.text }]}>When's your UCAT exam?</Text>
        </Animated.View>

        <Animated.View style={calendarAnim}>
          <LinearGradient
            colors={gradients.glass}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.calendarCard, { borderColor: colors.border }]}
          >
            <View style={styles.calendarHeader}>
              <TouchableOpacity
                onPress={goPrev}
                disabled={!canGoBack}
                style={[
                  styles.navButton,
                  {
                    borderColor: hexToRgba(colors.blue, 0.32),
                    backgroundColor: isDark ? 'rgba(8, 18, 36, 0.78)' : 'rgba(255, 255, 255, 0.92)',
                    opacity: canGoBack ? 1 : 0.35,
                  },
                ]}
                accessibilityRole="button"
                accessibilityLabel="Previous month"
              >
                <PremiumIcon name="chevron-left" size={18} color={colors.text} strokeWidth={2.4} />
              </TouchableOpacity>

              <Text style={[styles.monthLabel, { color: colors.text }]}>{monthLabel}</Text>

              <TouchableOpacity
                onPress={goNext}
                style={[
                  styles.navButton,
                  {
                    borderColor: hexToRgba(colors.blue, 0.32),
                    backgroundColor: isDark ? 'rgba(8, 18, 36, 0.78)' : 'rgba(255, 255, 255, 0.92)',
                  },
                ]}
                accessibilityRole="button"
                accessibilityLabel="Next month"
              >
                <PremiumIcon name="chevron-right" size={18} color={colors.text} strokeWidth={2.4} />
              </TouchableOpacity>
            </View>

            <View style={styles.weekRow}>
              {WEEKDAYS.map((d, i) => (
                <View key={`${d}-${i}`} style={styles.weekCell}>
                  <Text style={[styles.weekText, { color: colors.textMuted }]}>{d}</Text>
                </View>
              ))}
            </View>

            <View style={styles.daysGrid}>
              {grid.map((date, idx) => {
                if (!date) return <View key={`b-${idx}`} style={styles.dayCell} />;
                const isPast = date < today;
                const isToday = isSameDay(date, today);
                const isSelected = !!selected && isSameDay(date, selected);

                const baseStyle = [styles.dayCell];
                let bg = 'transparent';
                let borderColor = 'transparent';
                let textColor = colors.text;

                if (isSelected) {
                  bg = colors.blue;
                  textColor = '#fff';
                } else if (isToday) {
                  borderColor = hexToRgba(colors.cyan, 0.7);
                  textColor = colors.cyan;
                } else if (isPast) {
                  textColor = hexToRgba(colors.textMuted, 0.45);
                }

                return (
                  <TouchableOpacity
                    key={`d-${idx}`}
                    style={baseStyle}
                    activeOpacity={isPast ? 1 : 0.7}
                    onPress={() => handleSelectDay(date)}
                    disabled={isPast}
                    accessibilityRole="button"
                    accessibilityLabel={`Select ${formatLocalISO(date)}`}
                  >
                    <View
                      style={[
                        styles.dayInner,
                        {
                          backgroundColor: bg,
                          borderColor,
                          borderWidth: borderColor === 'transparent' ? 0 : 1.5,
                        },
                      ]}
                    >
                      <Text style={[styles.dayText, { color: textColor }]}>{date.getDate()}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </LinearGradient>
        </Animated.View>

        <Animated.View style={[styles.notBookedRow, optAnim]}>
          <TouchableOpacity
            onPress={handleToggleNotBooked}
            activeOpacity={0.85}
            style={[
              styles.notBookedButton,
              {
                borderColor: notBooked ? colors.cyan : hexToRgba(colors.blue, 0.28),
                backgroundColor: notBooked
                  ? hexToRgba(colors.cyan, 0.16)
                  : (isDark ? 'rgba(8, 18, 36, 0.5)' : 'rgba(255, 255, 255, 0.6)'),
              },
            ]}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: notBooked }}
          >
            <View
              style={[
                styles.checkbox,
                {
                  borderColor: notBooked ? colors.cyan : hexToRgba(colors.blue, 0.4),
                  backgroundColor: notBooked ? colors.cyan : 'transparent',
                },
              ]}
            >
              {notBooked ? <PremiumIcon name="check" size={14} color="#fff" strokeWidth={3} /> : null}
            </View>
            <View style={styles.notBookedCopy}>
              <Text style={[styles.notBookedTitle, { color: colors.text }]}>Not booked yet</Text>
              <Text style={[styles.notBookedSub, { color: colors.textSecondary }]}>
                You can set the date later from your profile.
              </Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </PremiumScrollView>

      <View
        style={[
          styles.footer,
          {
            paddingBottom: Math.max(insets.bottom, 16),
            borderTopColor: hexToRgba(colors.blue, 0.18),
            backgroundColor: isDark ? 'rgba(4, 11, 25, 0.92)' : 'rgba(248, 251, 255, 0.92)',
          },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={handleContinue}
          disabled={continueDisabled}
          style={[styles.primaryButtonShadow, continueDisabled && { opacity: 0.55 }]}
        >
          <LinearGradient
            colors={[colors.blue, colors.cyan]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.primaryButton}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryButtonText}>Continue</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </PremiumScreen>
  );
}

const styles = StyleSheet.create({
  brandHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandText: { flex: 1 },
  brandTitle: {
    color: premiumColors.text,
    fontSize: 18,
    fontWeight: '900',
  },
  brandTagline: {
    color: premiumColors.cyan,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.6,
    marginTop: 2,
  },
  scroll: { paddingBottom: 20 },
  hero: { paddingTop: 4, paddingBottom: 18 },
  heading: {
    color: premiumColors.text,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '900',
  },
  subtitle: {
    color: premiumColors.textSecondary,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
    maxWidth: 360,
  },
  calendarCard: {
    borderRadius: 22,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 18,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  navButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: premiumColors.text,
  },
  weekRow: {
    flexDirection: 'row',
    paddingVertical: 6,
  },
  weekCell: {
    flex: 1,
    alignItems: 'center',
  },
  weekText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    color: premiumColors.textMuted,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    padding: 3,
  },
  dayInner: {
    flex: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: {
    fontSize: 14,
    fontWeight: '700',
  },
  notBookedRow: {
    marginTop: 16,
  },
  notBookedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notBookedCopy: { flex: 1 },
  notBookedTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: premiumColors.text,
  },
  notBookedSub: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: 3,
    color: premiumColors.textSecondary,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 14,
    borderTopWidth: 1,
  },
  primaryButtonShadow: {
    borderRadius: 16,
    shadowColor: premiumColors.blue,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: Platform.OS === 'ios' ? 0.32 : 0,
    shadowRadius: 18,
  },
  primaryButton: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
});

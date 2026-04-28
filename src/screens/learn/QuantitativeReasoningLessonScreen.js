import React, { useCallback, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import {
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { useTheme } from '../../context/ThemeContext';
import {
  AppHeader,
  PremiumIcon,
  PremiumScreen,
  PremiumScrollView,
  RichIconBox,
  hexToRgba,
} from '../../components/premium/PremiumPracticeUI';
import { getPremiumTheme } from '../../theme/premiumTheme';
import {
  ALL_LESSONS,
  STORAGE_KEY,
  TOTAL_LESSONS,
  VALID_LESSON_IDS,
} from './QuantitativeReasoningLearnScreen';

function getAccent(colors, accentKey) {
  return colors[accentKey] ?? colors.blue;
}

function getStoredCompletedIds() {
  return AsyncStorage.getItem(STORAGE_KEY)
    .then((raw) => {
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.filter((id) => VALID_LESSON_IDS.has(id)) : [];
    })
    .catch(() => []);
}

function PrimaryButton({ label, icon = 'chevron-right', onPress, color, disabled = false, variant = 'filled', style }) {
  const isOutline = variant === 'outline';

  return (
    <TouchableOpacity
      activeOpacity={0.84}
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.actionButton,
        isOutline
          ? { backgroundColor: 'transparent', borderColor: hexToRgba(color, 0.42), borderWidth: 1 }
          : { backgroundColor: color, borderColor: color, borderWidth: 1 },
        disabled && styles.disabledButton,
        style,
      ]}
      accessibilityRole="button"
    >
      <PremiumIcon name={icon} size={18} color={isOutline ? color : '#FFFFFF'} strokeWidth={2.3} />
      <Text style={[styles.actionButtonText, { color: isOutline ? color : '#FFFFFF' }]} numberOfLines={1}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function ProgressBar({ progress, color, colors, isDark }) {
  return (
    <View
      style={[
        styles.progressTrack,
        {
          backgroundColor: isDark ? 'rgba(5, 12, 26, 0.64)' : 'rgba(219, 234, 254, 0.82)',
          borderColor: colors.border,
        },
      ]}
    >
      <View style={[styles.progressFill, { width: `${Math.max(0, Math.min(progress, 1)) * 100}%`, backgroundColor: color }]} />
    </View>
  );
}

function BulletRow({ children, color, colors }) {
  return (
    <View style={styles.bulletRow}>
      <View style={[styles.bulletDot, { backgroundColor: color }]} />
      <Text style={[styles.stepBullet, { color: colors.textSecondary }]}>{children}</Text>
    </View>
  );
}

function LessonHeader({ lesson, completed, completedCount, colors, isDark, accent }) {
  return (
    <View
      style={[
        styles.heroCard,
        {
          backgroundColor: isDark ? 'rgba(8, 20, 38, 0.78)' : 'rgba(255, 255, 255, 0.86)',
          borderColor: hexToRgba(accent, 0.48),
          shadowColor: accent,
        },
      ]}
    >
      <View style={styles.heroTop}>
        <RichIconBox icon={lesson.icon} accent={accent} size={58} iconSize={29} />
        <View style={styles.heroCopy}>
          <Text style={[styles.eyebrow, { color: accent }]}>{lesson.moduleTitle} - Lesson {lesson.number}</Text>
          <Text style={[styles.heroTitle, { color: colors.text }]}>{lesson.title}</Text>
          <Text style={[styles.heroMeta, { color: colors.textMuted }]}>{lesson.duration} - {lesson.type}</Text>
        </View>
        {completed ? (
          <View style={[styles.completeBadge, { borderColor: hexToRgba(colors.mint, 0.42), backgroundColor: hexToRgba(colors.mint, 0.12) }]}>
            <PremiumIcon name="check" size={17} color={colors.mint} strokeWidth={2.8} />
          </View>
        ) : null}
      </View>

      <Text style={[styles.heroBody, { color: colors.textSecondary }]}>{lesson.subtitle}</Text>

      <View style={styles.progressHeader}>
        <Text style={[styles.progressText, { color: colors.text }]}>
          Path progress: {completedCount} / {TOTAL_LESSONS}
        </Text>
        <Text style={[styles.progressText, { color: accent }]}>Lesson {lesson.number}</Text>
      </View>
      <ProgressBar progress={completedCount / TOTAL_LESSONS} color={accent} colors={colors} isDark={isDark} />
    </View>
  );
}

export default function QuantitativeReasoningLessonScreen({ navigation, route }) {
  const { isDark } = useTheme();
  const { colors } = getPremiumTheme(isDark);
  const routeLessonId = route.params?.lessonId;
  const lesson = useMemo(
    () => ALL_LESSONS.find((item) => item.id === routeLessonId) ?? ALL_LESSONS[0],
    [routeLessonId],
  );
  const nextLesson = useMemo(
    () => ALL_LESSONS.find((item) => item.number === lesson.number + 1) ?? null,
    [lesson.number],
  );
  const accent = getAccent(colors, lesson.moduleAccentKey);
  const [completedIds, setCompletedIds] = useState([]);
  const completed = completedIds.includes(lesson.id);

  useFocusEffect(useCallback(() => {
    let mounted = true;
    getStoredCompletedIds().then((ids) => {
      if (mounted) setCompletedIds(ids);
    });
    return () => {
      mounted = false;
    };
  }, []));

  const markLessonComplete = useCallback(() => {
    setCompletedIds((current) => {
      if (current.includes(lesson.id)) return current;
      const next = [...current, lesson.id];
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, [lesson.id]);

  const openPractice = useCallback(() => {
    navigation.navigate('QRQuestionList');
  }, [navigation]);

  const openTimedPractice = useCallback(() => {
    navigation.navigate('TimedTestList', { section: 'QR', title: 'Quantitative Reasoning' });
  }, [navigation]);

  const openLessonPractice = useCallback(() => {
    if (lesson.practiceRoute === 'timed') {
      openTimedPractice();
      return;
    }
    openPractice();
  }, [lesson.practiceRoute, openPractice, openTimedPractice]);

  const goToPath = useCallback(() => {
    if (navigation.canGoBack?.()) {
      navigation.goBack();
      return;
    }
    navigation.navigate('LearnQuantitativeReasoning');
  }, [navigation]);

  const goToNextLesson = useCallback(() => {
    if (nextLesson) {
      navigation.replace('LearnQRLesson', { lessonId: nextLesson.id });
      return;
    }
    openPractice();
  }, [navigation, nextLesson, openPractice]);

  return (
    <PremiumScreen>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.bgTop} />
      <AppHeader navigation={navigation} title="QR Lesson" />

      <PremiumScrollView>
        <LessonHeader
          lesson={lesson}
          completed={completed}
          completedCount={completedIds.length}
          colors={colors}
          isDark={isDark}
          accent={accent}
        />

        <View
          style={[
            styles.stepPanel,
            {
              backgroundColor: isDark ? 'rgba(8, 20, 38, 0.76)' : 'rgba(255, 255, 255, 0.86)',
              borderColor: colors.border,
            },
          ]}
        >
          {lesson.steps.map((step, index) => (
            <View
              key={step.title}
              style={[
                styles.stepCard,
                index > 0 && styles.stepCardSpacing,
                {
                  backgroundColor: isDark ? 'rgba(5, 12, 26, 0.46)' : 'rgba(241, 247, 255, 0.86)',
                  borderColor: colors.border,
                },
              ]}
            >
              <Text style={[styles.stepEyebrow, { color: accent }]}>Part {index + 1}</Text>
              <Text style={[styles.stepTitle, { color: colors.text }]}>{step.title}</Text>
              {step.body ? <Text style={[styles.stepBody, { color: colors.textSecondary }]}>{step.body}</Text> : null}
              {step.bullets?.map((item) => (
                <BulletRow key={item} color={accent} colors={colors}>{item}</BulletRow>
              ))}
            </View>
          ))}
        </View>

        <View style={styles.actionStack}>
          <PrimaryButton
            label={completed ? 'Lesson Completed' : 'Mark Lesson Complete'}
            icon="check"
            color={completed ? colors.mint : colors.blue}
            disabled={completed}
            onPress={markLessonComplete}
          />
          <PrimaryButton
            label={nextLesson ? 'Continue to Next Lesson' : 'Start QR Practice'}
            icon={nextLesson ? 'chevron-right' : 'pencil'}
            color={colors.cyan}
            variant="outline"
            onPress={goToNextLesson}
          />
          {lesson.practiceLabel ? (
            <PrimaryButton
              label={lesson.practiceLabel}
              icon={lesson.practiceRoute === 'timed' ? 'timer' : 'pencil'}
              color={accent}
              variant="outline"
              onPress={openLessonPractice}
            />
          ) : null}
          <PrimaryButton
            label="Back to QR Path"
            icon="chevron-left"
            color={colors.textMuted}
            variant="outline"
            onPress={goToPath}
          />
        </View>
      </PremiumScrollView>
    </PremiumScreen>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    marginTop: 4,
    marginBottom: 18,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.16,
    shadowRadius: 26,
    elevation: 0,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
  },
  heroTitle: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '900',
    marginTop: 4,
  },
  heroMeta: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    marginTop: 5,
  },
  heroBody: {
    fontSize: 15,
    lineHeight: 22,
    marginTop: 16,
  },
  completeBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 18,
    marginBottom: 9,
  },
  progressText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '900',
  },
  progressTrack: {
    height: 10,
    borderRadius: 999,
    borderWidth: 1,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },
  stepPanel: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 17,
    marginBottom: 14,
  },
  stepCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 15,
  },
  stepCardSpacing: {
    marginTop: 12,
  },
  stepEyebrow: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '900',
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  stepTitle: {
    fontSize: 18,
    lineHeight: 23,
    fontWeight: '900',
    marginBottom: 8,
  },
  stepBody: {
    fontSize: 14,
    lineHeight: 21,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginTop: 8,
  },
  bulletDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginTop: 7,
  },
  stepBullet: {
    flex: 1,
    minWidth: 0,
    fontSize: 14,
    lineHeight: 21,
  },
  actionStack: {
    gap: 10,
    marginBottom: 8,
  },
  actionButton: {
    minHeight: 48,
    borderRadius: 16,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  disabledButton: {
    opacity: 0.62,
  },
  actionButtonText: {
    flexShrink: 1,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '900',
    textAlign: 'center',
  },
});

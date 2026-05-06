import React, { useCallback, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import {
  Modal,
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
} from './DecisionMakingLearnScreen';
import ReportLessonButton from '../../components/ReportLessonButton';
import { useAITutorAvailability } from '../../hooks/ai/useAITutorAvailability';
import { useLessonTelemetry } from '../../hooks/useLessonTelemetry';
import {
  loadMiniAnswersForLesson,
  saveMiniAnswer,
} from '../../data/learn/learnMiniAnswersStorage';

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

function CalloutCard({ badge, badgeColor, title, body, bullets, colors, isDark }) {
  return (
    <View
      style={[
        styles.calloutCard,
        {
          backgroundColor: hexToRgba(badgeColor, isDark ? 0.12 : 0.08),
          borderColor: hexToRgba(badgeColor, 0.42),
        },
      ]}
    >
      <View style={[styles.calloutBadge, { backgroundColor: badgeColor }]}>
        <Text style={styles.calloutBadgeText}>{badge}</Text>
      </View>
      {title ? <Text style={[styles.calloutTitle, { color: colors.text }]}>{title}</Text> : null}
      {body ? <Text style={[styles.calloutBody, { color: colors.textSecondary }]}>{body}</Text> : null}
      {bullets?.map((item) => (
        <BulletRow key={item} color={badgeColor} colors={colors}>{item}</BulletRow>
      ))}
    </View>
  );
}

function CollapsibleTip({ title, body, bullets, accent, colors, isDark }) {
  const [open, setOpen] = useState(false);

  return (
    <View
      style={[
        styles.tipCard,
        {
          backgroundColor: isDark ? 'rgba(5, 12, 26, 0.46)' : 'rgba(241, 247, 255, 0.86)',
          borderColor: colors.border,
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.84}
        onPress={() => setOpen((prev) => !prev)}
        style={styles.tipHeader}
        accessibilityRole="button"
      >
        <PremiumIcon name="info" size={16} color={accent} strokeWidth={2.4} />
        <Text style={[styles.tipTitle, { color: colors.text }]} numberOfLines={2}>{title}</Text>
        <PremiumIcon name={open ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textMuted} strokeWidth={2.4} />
      </TouchableOpacity>
      {open ? (
        <View style={styles.tipBody}>
          {body ? <Text style={[styles.tipBodyText, { color: colors.textSecondary }]}>{body}</Text> : null}
          {bullets?.map((item) => (
            <BulletRow key={item} color={accent} colors={colors}>{item}</BulletRow>
          ))}
        </View>
      ) : null}
    </View>
  );
}

function shuffleOrderForPrompt(prompt, n) {
  let h = 2166136261;
  const key = String(prompt ?? '');
  for (let i = 0; i < key.length; i++) {
    h = Math.imul(h ^ key.charCodeAt(i), 16777619);
  }
  const order = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    h = (Math.imul(h, 1664525) + 1013904223) | 0;
    const j = Math.abs(h) % (i + 1);
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

function MiniExampleCard({ prompt, options, correctIndex, explanation, accent, colors, isDark, onAnswered, initialSelected }) {
  const [selected, setSelected] = useState(initialSelected ?? null);
  const [revealed, setRevealed] = useState(initialSelected != null);
  const isCorrect = selected === correctIndex;
  const displayOrder = useMemo(
    () => shuffleOrderForPrompt(prompt, options.length),
    [prompt, options.length],
  );

  const handleSelect = (index) => {
    if (selected !== null) return;
    setSelected(index);
    setRevealed(true);
    onAnswered?.(index);
  };

  return (
    <View
      style={[
        styles.miniCard,
        {
          backgroundColor: isDark ? 'rgba(5, 12, 26, 0.5)' : 'rgba(248, 252, 255, 0.92)',
          borderColor: hexToRgba(accent, 0.42),
        },
      ]}
    >
      <View style={[styles.miniBadge, { backgroundColor: accent }]}>
        <Text style={styles.miniBadgeText}>QUESTION</Text>
      </View>
      <Text style={[styles.miniPrompt, { color: colors.text }]}>{prompt}</Text>

      <View style={styles.miniOptions}>
        {displayOrder.map((index) => {
          const option = options[index];
          const isSelected = selected === index;
          const isAnswer = index === correctIndex;
          const showCorrect = revealed && isAnswer;
          const showWrong = revealed && isSelected && !isAnswer;

          let optionBg = isDark ? 'rgba(8, 20, 38, 0.7)' : 'rgba(255, 255, 255, 0.86)';
          let optionBorder = colors.border;
          let optionText = colors.text;

          if (showCorrect) {
            optionBg = hexToRgba(colors.mint, 0.18);
            optionBorder = colors.mint;
            optionText = colors.text;
          } else if (showWrong) {
            optionBg = hexToRgba(colors.coral ?? '#ef4444', 0.16);
            optionBorder = colors.coral ?? '#ef4444';
          }

          return (
            <TouchableOpacity
              key={option}
              activeOpacity={0.84}
              onPress={() => handleSelect(index)}
              disabled={selected !== null}
              style={[styles.miniOption, { backgroundColor: optionBg, borderColor: optionBorder }]}
              accessibilityRole="button"
            >
              <Text style={[styles.miniOptionText, { color: optionText }]}>{option}</Text>
              {showCorrect ? (
                <PremiumIcon name="check" size={18} color={colors.mint} strokeWidth={2.6} />
              ) : null}
              {showWrong ? (
                <PremiumIcon name="x" size={18} color={colors.coral ?? '#ef4444'} strokeWidth={2.6} />
              ) : null}
            </TouchableOpacity>
          );
        })}
      </View>

      {revealed ? (
        <View
          style={[
            styles.miniExplain,
            {
              backgroundColor: hexToRgba(isCorrect ? colors.mint : (colors.coral ?? '#ef4444'), 0.1),
              borderColor: hexToRgba(isCorrect ? colors.mint : (colors.coral ?? '#ef4444'), 0.4),
            },
          ]}
        >
          <Text style={[styles.miniExplainLabel, { color: isCorrect ? colors.mint : (colors.coral ?? '#ef4444') }]}>
            {isCorrect ? 'Correct' : 'Not quite'}
          </Text>
          <Text style={[styles.miniExplainText, { color: colors.textSecondary }]}>{explanation}</Text>
        </View>
      ) : (
        <Text style={[styles.miniHint, { color: colors.textMuted }]}>Select an answer</Text>
      )}
    </View>
  );
}

function DemoLaunchCard({ title, body, buttonLabel, note, accent, colors, isDark, onLaunch, launched, disabled }) {
  const buttonBg = disabled ? hexToRgba(colors.textMuted, isDark ? 0.3 : 0.22) : accent;
  const buttonBorder = disabled ? hexToRgba(colors.textMuted, isDark ? 0.4 : 0.32) : accent;

  return (
    <View
      style={[
        styles.demoCard,
        {
          backgroundColor: hexToRgba(accent, isDark ? 0.12 : 0.08),
          borderColor: hexToRgba(accent, 0.5),
        },
      ]}
    >
      <View style={[styles.demoBadge, { backgroundColor: accent }]}>
        <Text style={styles.demoBadgeText}>TRY IT</Text>
      </View>
      {title ? <Text style={[styles.demoTitle, { color: colors.text }]}>{title}</Text> : null}
      {body ? <Text style={[styles.demoBody, { color: colors.textSecondary }]}>{body}</Text> : null}
      <TouchableOpacity
        activeOpacity={disabled ? 1 : 0.86}
        onPress={disabled ? undefined : onLaunch}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityState={{ disabled: !!disabled }}
        style={[
          styles.demoButton,
          {
            backgroundColor: buttonBg,
            borderColor: buttonBorder,
            shadowColor: accent,
          },
          disabled && { shadowOpacity: 0 },
        ]}
      >
        <PremiumIcon name={disabled ? 'lock' : 'play'} size={18} color="#FFFFFF" strokeWidth={2.4} />
        <Text style={styles.demoButtonText}>
          {disabled ? 'Demo paused — try again later' : (buttonLabel ?? 'Try a sample question')}
        </Text>
      </TouchableOpacity>
      {disabled ? (
        <Text style={[styles.demoNote, { color: colors.textMuted }]}>
          We've temporarily paused the free AI tutor demo. You can keep going through the rest of this lesson.
        </Text>
      ) : note ? (
        <Text style={[styles.demoNote, { color: colors.textMuted }]}>{note}</Text>
      ) : null}
      {launched && !disabled ? (
        <View style={styles.demoLaunchedRow}>
          <PremiumIcon name="check" size={14} color={colors.mint} strokeWidth={2.8} />
          <Text style={[styles.demoLaunchedText, { color: colors.mint }]}>Demo opened — you can now finish this lesson</Text>
        </View>
      ) : null}
    </View>
  );
}

function WorkedExampleLaunchCard({ title, body, buttonLabel, accent, colors, isDark, onLaunch, completed }) {
  return (
    <View
      style={[
        styles.demoCard,
        {
          backgroundColor: hexToRgba(accent, isDark ? 0.12 : 0.08),
          borderColor: hexToRgba(accent, 0.5),
        },
      ]}
    >
      <View style={[styles.demoBadge, { backgroundColor: accent }]}>
        <Text style={styles.demoBadgeText}>WORKED EXAMPLE</Text>
      </View>
      {title ? <Text style={[styles.demoTitle, { color: colors.text }]}>{title}</Text> : null}
      {body ? <Text style={[styles.demoBody, { color: colors.textSecondary }]}>{body}</Text> : null}
      <TouchableOpacity
        activeOpacity={0.86}
        onPress={onLaunch}
        accessibilityRole="button"
        style={[
          styles.demoButton,
          {
            backgroundColor: accent,
            borderColor: accent,
            shadowColor: accent,
          },
        ]}
      >
        <PremiumIcon name={completed ? 'refresh' : 'play'} size={18} color="#FFFFFF" strokeWidth={2.4} />
        <Text style={styles.demoButtonText}>
          {completed ? 'Re-open worked example' : (buttonLabel ?? 'Open worked example')}
        </Text>
      </TouchableOpacity>
      {completed ? (
        <View style={styles.demoLaunchedRow}>
          <PremiumIcon name="check" size={14} color={colors.mint} strokeWidth={2.8} />
          <Text style={[styles.demoLaunchedText, { color: colors.mint }]}>
            Worked example complete — you can continue
          </Text>
        </View>
      ) : (
        <Text style={[styles.demoNote, { color: colors.textMuted }]}>
          Read the question, answer it, then study the breakdown — that's where the method is taught.
        </Text>
      )}
    </View>
  );
}

function ChecklistCard({ title, items, colors, isDark }) {
  return (
    <View
      style={[
        styles.checklistCard,
        {
          backgroundColor: hexToRgba(colors.mint, isDark ? 0.1 : 0.06),
          borderColor: hexToRgba(colors.mint, 0.4),
        },
      ]}
    >
      <View style={styles.checklistHeader}>
        <PremiumIcon name="check" size={18} color={colors.mint} strokeWidth={2.8} />
        <Text style={[styles.checklistTitle, { color: colors.text }]}>{title}</Text>
      </View>
      {items.map((item) => (
        <View key={item} style={styles.checklistRow}>
          <PremiumIcon name="check" size={14} color={colors.mint} strokeWidth={2.8} />
          <Text style={[styles.checklistText, { color: colors.textSecondary }]}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

function StepCard({ step, index, accent, colors, isDark }) {
  return (
    <View
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
  );
}

function renderBlock(step, index, accent, colors, isDark, onQuestionAnswered, demoCtx, workedExampleCtx, savedMiniAnswers) {
  const kind = step.kind ?? 'step';

  if (kind === 'rule') {
    return (
      <View key={`rule-${index}`} style={index > 0 ? styles.blockSpacing : null}>
        <CalloutCard
          badge="RULE"
          badgeColor={colors.blue}
          title={step.title}
          body={step.body}
          bullets={step.bullets}
          colors={colors}
          isDark={isDark}
        />
      </View>
    );
  }

  if (kind === 'trap') {
    return (
      <View key={`trap-${index}`} style={index > 0 ? styles.blockSpacing : null}>
        <CalloutCard
          badge="TRAP"
          badgeColor={colors.amber ?? '#f59e0b'}
          title={step.title}
          body={step.body}
          bullets={step.bullets}
          colors={colors}
          isDark={isDark}
        />
      </View>
    );
  }

  if (kind === 'tip') {
    return (
      <View key={`tip-${index}`} style={index > 0 ? styles.blockSpacing : null}>
        <CollapsibleTip
          title={step.title}
          body={step.body}
          bullets={step.bullets}
          accent={accent}
          colors={colors}
          isDark={isDark}
        />
      </View>
    );
  }

  if (kind === 'mini') {
    return (
      <View key={`mini-${index}`} style={index > 0 ? styles.blockSpacing : null}>
        <MiniExampleCard
          prompt={step.prompt}
          options={step.options}
          correctIndex={step.correctIndex}
          explanation={step.explanation}
          accent={accent}
          colors={colors}
          isDark={isDark}
          initialSelected={savedMiniAnswers?.[index]?.selectedIndex}
          onAnswered={(selectedIndex) => onQuestionAnswered?.(index, selectedIndex, step.correctIndex)}
        />
      </View>
    );
  }

  if (kind === 'checklist') {
    return (
      <View key={`checklist-${index}`} style={index > 0 ? styles.blockSpacing : null}>
        <ChecklistCard
          title={step.title}
          items={step.items ?? []}
          colors={colors}
          isDark={isDark}
        />
      </View>
    );
  }

  if (kind === 'demoLaunch') {
    return (
      <View key={`demo-${index}`} style={index > 0 ? styles.blockSpacing : null}>
        <DemoLaunchCard
          title={step.title}
          body={step.body}
          buttonLabel={step.buttonLabel}
          note={step.note}
          accent={accent}
          colors={colors}
          isDark={isDark}
          launched={demoCtx?.launched}
          disabled={demoCtx?.disabled}
          onLaunch={() => demoCtx?.onLaunch?.(index)}
        />
      </View>
    );
  }

  if (kind === 'workedExampleLaunch') {
    return (
      <View key={`worked-${index}`} style={index > 0 ? styles.blockSpacing : null}>
        <WorkedExampleLaunchCard
          title={step.title}
          body={step.body}
          buttonLabel={step.buttonLabel}
          accent={accent}
          colors={colors}
          isDark={isDark}
          completed={!!workedExampleCtx?.completed}
          onLaunch={() => workedExampleCtx?.onLaunch?.()}
        />
      </View>
    );
  }

  return (
    <StepCard
      key={`step-${index}-${step.title}`}
      step={step}
      index={index}
      accent={accent}
      colors={colors}
      isDark={isDark}
    />
  );
}

function LessonHeader({ lesson, completed, completedCount, colors, isDark, accent, section }) {
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
        <View style={styles.heroActions}>
          <ReportLessonButton
            section={section}
            lessonId={lesson.id}
            lessonTitle={lesson.title}
          />
          {completed ? (
            <View style={[styles.completeBadge, { borderColor: hexToRgba(colors.mint, 0.42), backgroundColor: hexToRgba(colors.mint, 0.12) }]}>
              <PremiumIcon name="check" size={17} color={colors.mint} strokeWidth={2.8} />
            </View>
          ) : null}
        </View>
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

function AllLessonsCompleteModal({ visible, colors, isDark, accent, onPractice, onTimed, onDismiss }) {
  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onDismiss}>
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.modalCard,
            {
              backgroundColor: isDark ? 'rgba(8, 20, 38, 0.97)' : 'rgba(255, 255, 255, 0.98)',
              borderColor: hexToRgba(accent, 0.48),
            },
          ]}
        >
          <View style={[styles.modalIconRing, { borderColor: hexToRgba(colors.mint, 0.5), backgroundColor: hexToRgba(colors.mint, 0.12) }]}>
            <PremiumIcon name="award" size={34} color={colors.mint} strokeWidth={2.2} />
          </View>

          <Text style={[styles.modalTitle, { color: colors.text }]}>All Lessons Complete!</Text>
          <Text style={[styles.modalBody, { color: colors.textSecondary }]}>
            You've finished every DM lesson. Now put your skills to the test with practice questions or a timed exam.
          </Text>

          <TouchableOpacity
            activeOpacity={0.84}
            onPress={onPractice}
            style={[styles.modalBtn, { backgroundColor: accent }]}
          >
            <PremiumIcon name="pencil" size={18} color="#FFFFFF" strokeWidth={2.3} />
            <Text style={styles.modalBtnText}>Practice Questions</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.84}
            onPress={onTimed}
            style={[styles.modalBtn, styles.modalBtnSecondary, { borderColor: hexToRgba(accent, 0.48) }]}
          >
            <PremiumIcon name="timer" size={18} color={accent} strokeWidth={2.3} />
            <Text style={[styles.modalBtnText, { color: accent }]}>Timed Test</Text>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.7} onPress={onDismiss} style={styles.modalDismiss}>
            <Text style={[styles.modalDismissText, { color: colors.textMuted }]}>Maybe later</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

export default function DecisionMakingLessonScreen({ navigation, route }) {
  const { isDark } = useTheme();
  const { colors } = getPremiumTheme(isDark);
  const { demoEnabled: tutorDemoEnabled } = useAITutorAvailability();
  const routeLessonId = route.params?.lessonId;
  const lesson = useMemo(
    () => ALL_LESSONS.find((item) => item.id === routeLessonId) ?? ALL_LESSONS[0],
    [routeLessonId],
  );
  const nextLesson = useMemo(
    () => ALL_LESSONS.find((item) => item.number === lesson.number + 1) ?? null,
    [lesson.number],
  );
  const prevLesson = useMemo(
    () => ALL_LESSONS.find((item) => item.number === lesson.number - 1) ?? null,
    [lesson.number],
  );
  const accent = getAccent(colors, lesson.moduleAccentKey);
  const [completedIds, setCompletedIds] = useState([]);
  const completed = completedIds.includes(lesson.id);
  const { markComplete: markLessonTelemetryComplete } = useLessonTelemetry({
    section: 'dm',
    lessonId: lesson.id,
  });
  const [showAllDoneModal, setShowAllDoneModal] = useState(false);

  const interactiveIndices = useMemo(
    () => lesson.steps.reduce((acc, step, i) => {
      const kind = step.kind ?? 'step';
      if (kind === 'mini' || kind === 'demoLaunch' || kind === 'workedExampleLaunch') acc.push(i);
      return acc;
    }, []),
    [lesson.steps],
  );
  const demoLaunchIndex = useMemo(
    () => lesson.steps.findIndex((step) => (step.kind ?? 'step') === 'demoLaunch'),
    [lesson.steps],
  );
  const workedExampleLaunchIndex = useMemo(
    () => lesson.steps.findIndex((step) => (step.kind ?? 'step') === 'workedExampleLaunch'),
    [lesson.steps],
  );
  const hasQuestions = interactiveIndices.length > 0;
  const [answeredIndices, setAnsweredIndices] = useState(new Set());
  const [savedMiniAnswers, setSavedMiniAnswers] = useState({});
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  // Worked-example steps are "answered" when the user actually completes the
  // example (lesson id is written to AsyncStorage from DMQuestionScreen on
  // answer commit). The lesson screen picks that up via useFocusEffect.
  const allQuestionsAnswered = !hasQuestions
    ? hasScrolledToBottom
    : interactiveIndices.every((i) => {
        const kind = lesson.steps[i].kind ?? 'step';
        if (kind === 'workedExampleLaunch') return completed;
        return answeredIndices.has(i);
      });

  useFocusEffect(useCallback(() => {
    let mounted = true;
    getStoredCompletedIds().then((ids) => {
      if (mounted) setCompletedIds(ids);
    });
    loadMiniAnswersForLesson(lesson.id).then((map) => {
      if (!mounted) return;
      setSavedMiniAnswers(map);
      const restoredIndices = Object.keys(map).map((k) => Number(k)).filter((n) => Number.isInteger(n));
      if (restoredIndices.length) {
        setAnsweredIndices((prev) => {
          const next = new Set(prev);
          restoredIndices.forEach((i) => next.add(i));
          return next;
        });
      }
    });
    return () => {
      mounted = false;
    };
  }, [lesson.id]));

  const handleQuestionAnswered = useCallback((index, selectedIndex, correctIndex) => {
    setAnsweredIndices((prev) => {
      if (prev.has(index)) return prev;
      const next = new Set(prev);
      next.add(index);
      return next;
    });
    if (selectedIndex == null) return;
    const isCorrect = selectedIndex === correctIndex;
    setSavedMiniAnswers((prev) => {
      if (prev[index]) return prev;
      return { ...prev, [index]: { selectedIndex, isCorrect } };
    });
    saveMiniAnswer(lesson.id, index, { selectedIndex, isCorrect });
  }, [lesson.id]);

  const launchTutorDemo = useCallback(() => {
    if (demoLaunchIndex >= 0) {
      handleQuestionAnswered(demoLaunchIndex);
    }
    navigation.navigate('DMQuestion', { mode: 'tutorDemo' });
  }, [demoLaunchIndex, handleQuestionAnswered, navigation]);

  const launchWorkedExample = useCallback(() => {
    navigation.navigate('DMQuestion', { mode: 'workedExample', exampleId: lesson.id });
  }, [navigation, lesson.id]);

  const workedExampleCtx = useMemo(
    () => ({
      visible: workedExampleLaunchIndex >= 0,
      completed,
      onLaunch: launchWorkedExample,
    }),
    [workedExampleLaunchIndex, completed, launchWorkedExample],
  );

  // When the demo kill switch is off, auto-satisfy the demoLaunch step so
  // users aren't trapped on a disabled button. The card itself shows a
  // "demo paused" state and the rest of the lesson flow is unchanged.
  useEffect(() => {
    if (!tutorDemoEnabled && demoLaunchIndex >= 0) {
      handleQuestionAnswered(demoLaunchIndex);
    }
  }, [tutorDemoEnabled, demoLaunchIndex, handleQuestionAnswered]);

  const demoCtx = useMemo(
    () => ({
      launched: demoLaunchIndex >= 0 && answeredIndices.has(demoLaunchIndex),
      disabled: !tutorDemoEnabled,
      onLaunch: launchTutorDemo,
    }),
    [demoLaunchIndex, answeredIndices, launchTutorDemo, tutorDemoEnabled],
  );

  const handleScroll = useCallback(({ nativeEvent }) => {
    if (!hasQuestions && !hasScrolledToBottom) {
      const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
      if (contentOffset.y + layoutMeasurement.height >= contentSize.height - 40) {
        setHasScrolledToBottom(true);
      }
    }
  }, [hasQuestions, hasScrolledToBottom]);

  const markLessonComplete = useCallback(() => {
    setCompletedIds((current) => {
      if (current.includes(lesson.id)) return current;
      const next = [...current, lesson.id];
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
      markLessonTelemetryComplete();
      return next;
    });
  }, [lesson.id, markLessonTelemetryComplete]);

  useEffect(() => {
    if (!completed && allQuestionsAnswered) {
      markLessonComplete();
    }
  }, [allQuestionsAnswered, completed, markLessonComplete]);

  useEffect(() => {
    if (completed && !nextLesson) {
      setShowAllDoneModal(true);
    }
  }, [completed, nextLesson]);

  const openPractice = useCallback(() => {
    navigation.navigate('DMQuestionList');
  }, [navigation]);

  const openTimedPractice = useCallback(() => {
    navigation.navigate('TimedTestList', { section: 'DM', title: 'Decision Making' });
  }, [navigation]);

  const goToNextLesson = useCallback(() => {
    if (nextLesson) {
      navigation.replace('LearnDMLesson', { lessonId: nextLesson.id });
      return;
    }
    openPractice();
  }, [navigation, nextLesson, openPractice]);

  return (
    <PremiumScreen>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.bgTop} />
      <AppHeader navigation={navigation} title="DM Lesson" />

      <AllLessonsCompleteModal
        visible={showAllDoneModal}
        colors={colors}
        isDark={isDark}
        accent={accent}
        onPractice={() => { setShowAllDoneModal(false); openPractice(); }}
        onTimed={() => { setShowAllDoneModal(false); openTimedPractice(); }}
        onDismiss={() => setShowAllDoneModal(false)}
      />

      <PremiumScrollView
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <LessonHeader
          lesson={lesson}
          completed={completed}
          completedCount={completedIds.length}
          colors={colors}
          isDark={isDark}
          accent={accent}
          section="dm"
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
          {lesson.steps.map((step, index) => renderBlock(step, index, accent, colors, isDark, handleQuestionAnswered, demoCtx, workedExampleCtx, savedMiniAnswers))}
        </View>

        <View style={styles.actionStack}>
          <PrimaryButton
            label={nextLesson ? 'Continue to Next Lesson' : 'Start DM Practice'}
            icon={completed ? (nextLesson ? 'chevron-right' : 'pencil') : 'lock'}
            color={completed ? colors.cyan : colors.textMuted}
            variant="outline"
            disabled={!completed}
            onPress={goToNextLesson}
          />
          {!completed ? (
            <Text style={[styles.lockedHint, { color: colors.textMuted }]}>
              {hasQuestions
                ? 'Answer all questions above to continue'
                : 'Scroll to the bottom to continue'}
            </Text>
          ) : null}
          {prevLesson ? (
            <PrimaryButton
              label={`Previous: ${prevLesson.title}`}
              icon="chevron-left"
              color={colors.textMuted}
              variant="outline"
              onPress={() => navigation.replace('LearnDMLesson', { lessonId: prevLesson.id })}
            />
          ) : null}
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
  heroActions: {
    alignItems: 'center',
    gap: 8,
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
  blockSpacing: {
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
  calloutCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 15,
  },
  calloutBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginBottom: 10,
  },
  calloutBadgeText: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.6,
  },
  calloutTitle: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '900',
    marginBottom: 6,
  },
  calloutBody: {
    fontSize: 14,
    lineHeight: 21,
  },
  tipCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  tipTitle: {
    flex: 1,
    minWidth: 0,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '800',
  },
  tipBody: {
    paddingHorizontal: 14,
    paddingBottom: 14,
  },
  tipBodyText: {
    fontSize: 14,
    lineHeight: 21,
  },
  miniCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 15,
  },
  miniBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginBottom: 10,
  },
  miniBadgeText: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.6,
  },
  miniPrompt: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '700',
    marginBottom: 12,
  },
  miniOptions: {
    gap: 8,
  },
  miniOption: {
    minHeight: 46,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  miniOptionText: {
    flex: 1,
    minWidth: 0,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '700',
  },
  miniHint: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    marginTop: 10,
    fontStyle: 'italic',
  },
  miniExplain: {
    marginTop: 12,
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
  },
  miniExplainLabel: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '900',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  miniExplainText: {
    fontSize: 13,
    lineHeight: 19,
  },
  checklistCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 15,
  },
  checklistHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  checklistTitle: {
    flex: 1,
    minWidth: 0,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '900',
  },
  checklistRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 6,
  },
  checklistText: {
    flex: 1,
    minWidth: 0,
    fontSize: 14,
    lineHeight: 20,
  },
  actionStack: {
    gap: 10,
    marginBottom: 8,
  },
  lockedHint: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.62)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    width: '100%',
    borderRadius: 28,
    borderWidth: 1,
    padding: 28,
    alignItems: 'center',
  },
  modalIconRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  modalTitle: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 10,
  },
  modalBody: {
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    marginBottom: 24,
  },
  modalBtn: {
    width: '100%',
    minHeight: 50,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 10,
  },
  modalBtnSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  modalBtnText: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  modalDismiss: {
    marginTop: 4,
    paddingVertical: 8,
  },
  modalDismissText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
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
  demoCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
  },
  demoBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginBottom: 10,
  },
  demoBadgeText: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.6,
  },
  demoTitle: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '900',
    marginBottom: 6,
  },
  demoBody: {
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 14,
  },
  demoButton: {
    minHeight: 50,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 14,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
  },
  demoButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '900',
    textAlign: 'center',
    flexShrink: 1,
  },
  demoNote: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 10,
  },
  demoLaunchedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 12,
  },
  demoLaunchedText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '900',
  },
});

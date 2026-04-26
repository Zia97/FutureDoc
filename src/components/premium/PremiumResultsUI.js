import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { hexToRgba } from '../../theme/premiumTheme';
import PremiumIcon from './PremiumIcon';

const RESULT_META = {
  correct: { label: 'Correct' },
  incorrect: { label: 'Incorrect' },
  unanswered: { label: 'Unanswered' },
};

function getResultColor(result, colors, isDark) {
  if (result === 'correct') return isDark ? '#34D399' : '#059669';
  if (result === 'incorrect') return colors.red;
  return colors.textMuted;
}

export function ResultsHeader({ title, accent, colors }) {
  return (
    <View style={resultsStyles.header}>
      <View style={resultsStyles.headerInner}>
        <Text style={[resultsStyles.headerEyebrow, { color: accent }]}>RESULTS</Text>
        <Text style={[resultsStyles.headerTitle, { color: colors.text }]} numberOfLines={1}>
          {title}
        </Text>
      </View>
    </View>
  );
}

export function ScoreOverviewCard({
  pct,
  correctCount,
  incorrectCount,
  unansweredCount,
  total,
  accent,
  colors,
  isDark,
  showUnanswered = true,
}) {
  const correctColor = isDark ? '#34D399' : '#059669';
  return (
    <View style={[resultsStyles.scoreCardWrap, { shadowColor: accent }]}>
      <LinearGradient
        colors={
          isDark
            ? ['rgba(18, 35, 64, 0.96)', 'rgba(8, 22, 43, 0.96)', 'rgba(4, 10, 23, 0.98)']
            : ['rgba(255, 255, 255, 0.98)', 'rgba(246, 250, 255, 0.98)', 'rgba(235, 243, 255, 0.98)']
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[resultsStyles.scoreCard, { borderColor: hexToRgba(accent, isDark ? 0.42 : 0.28) }]}
      >
        <Text style={[resultsStyles.scorePercent, { color: colors.text }]}>{pct}%</Text>
        <Text style={[resultsStyles.scoreSubLabel, { color: colors.textSecondary }]}>
          {correctCount} of {total} correct
        </Text>

        <View style={resultsStyles.scoreStats}>
          <ScoreStat label="Correct" value={correctCount} color={correctColor} colors={colors} />
          <ScoreDivider colors={colors} />
          <ScoreStat label="Incorrect" value={incorrectCount} color={colors.red} colors={colors} />
          {showUnanswered ? (
            <>
              <ScoreDivider colors={colors} />
              <ScoreStat label="Unanswered" value={unansweredCount} color={colors.textMuted} colors={colors} />
            </>
          ) : null}
        </View>
      </LinearGradient>
    </View>
  );
}

function ScoreStat({ label, value, color, colors }) {
  return (
    <View style={resultsStyles.scoreStat}>
      <Text style={[resultsStyles.scoreStatNum, { color }]}>{value}</Text>
      <Text style={[resultsStyles.scoreStatLabel, { color: colors.textSecondary }]}>{label}</Text>
    </View>
  );
}

function ScoreDivider({ colors }) {
  return <View style={[resultsStyles.scoreStatDivider, { backgroundColor: colors.border }]} />;
}

export function UcatScoreCard({
  scaledScore,
  uncertainty = '±40',
  disclaimer = '* Estimate only — typical uncertainty applies. See About UCAT for details.',
  accent,
  colors,
  isDark,
}) {
  return (
    <View style={resultsStyles.sectionWrap}>
      <Text style={[resultsStyles.sectionHeader, { color: colors.textMuted }]}>UCAT SCORE ESTIMATE</Text>
      <View style={[resultsStyles.ucatCardWrap, { shadowColor: accent }]}>
        <LinearGradient
          colors={
            isDark
              ? ['rgba(18, 35, 64, 0.96)', 'rgba(8, 22, 43, 0.96)']
              : ['rgba(255, 255, 255, 0.98)', 'rgba(246, 250, 255, 0.98)']
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[resultsStyles.ucatCard, { borderColor: hexToRgba(accent, isDark ? 0.36 : 0.28) }]}
        >
          <View
            style={[
              resultsStyles.scaledBadge,
              {
                backgroundColor: hexToRgba(accent, isDark ? 0.18 : 0.1),
                borderColor: hexToRgba(accent, 0.4),
              },
            ]}
          >
            <Text style={[resultsStyles.scaledBadgeText, { color: accent }]}>
              {scaledScore} <Text style={[resultsStyles.scaledBadgeRange, { color: hexToRgba(accent, 0.78) }]}>{uncertainty}</Text>
            </Text>
          </View>
          <Text style={[resultsStyles.ucatDesc, { color: colors.textSecondary }]}>
            Scaled score estimate (300–900)
          </Text>
          <Text style={[resultsStyles.ucatDisclaimer, { color: colors.textMuted }]}>
            {disclaimer}
          </Text>
        </LinearGradient>
      </View>
    </View>
  );
}

export function QuestionBreakdownRow({
  number,
  title,
  subtitle,
  result,
  flagged,
  onPress,
  accent,
  colors,
  isDark,
}) {
  const meta = RESULT_META[result] ?? RESULT_META.unanswered;
  const resultColor = getResultColor(result, colors, isDark);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.78}
      style={[resultsStyles.qRow, { shadowColor: accent }]}
    >
      <LinearGradient
        colors={
          isDark
            ? ['rgba(15, 28, 51, 0.78)', 'rgba(7, 17, 35, 0.78)']
            : ['rgba(255, 255, 255, 0.95)', 'rgba(244, 248, 255, 0.95)']
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[resultsStyles.qRowGradient, { borderColor: colors.border }]}
      >
        <View
          style={[
            resultsStyles.qNumberBadge,
            {
              backgroundColor: hexToRgba(accent, isDark ? 0.16 : 0.08),
              borderColor: hexToRgba(accent, 0.34),
            },
          ]}
        >
          <Text style={[resultsStyles.qNumberText, { color: accent }]}>Q{number}</Text>
        </View>

        <View style={resultsStyles.qBody}>
          <Text style={[resultsStyles.qTitle, { color: colors.text }]} numberOfLines={2}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={[resultsStyles.qSubtitle, { color: colors.textMuted }]} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>

        <View style={resultsStyles.qRight}>
          {flagged ? (
            <PremiumIcon name="flag" size={15} color={colors.amber} strokeWidth={2.4} />
          ) : null}
          <View
            style={[
              resultsStyles.resultBadge,
              {
                backgroundColor: hexToRgba(resultColor, isDark ? 0.18 : 0.12),
                borderColor: hexToRgba(resultColor, 0.42),
              },
            ]}
          >
            <View style={[resultsStyles.resultDot, { backgroundColor: resultColor }]} />
            <Text style={[resultsStyles.resultLabel, { color: resultColor }]}>{meta.label}</Text>
          </View>
          <PremiumIcon name="chevron-right" size={18} color={colors.textMuted} strokeWidth={2.2} />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

export function DoneBottomBar({ onDone, accent, colors, isDark }) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        resultsStyles.bottomBar,
        {
          backgroundColor: isDark ? 'rgba(7, 19, 39, 0.94)' : 'rgba(255, 255, 255, 0.96)',
          borderTopColor: colors.border,
          paddingBottom: insets.bottom + 12,
        },
      ]}
    >
      <TouchableOpacity onPress={onDone} activeOpacity={0.86} style={resultsStyles.doneWrap}>
        <LinearGradient
          colors={[accent, hexToRgba(accent, 0.78)]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={resultsStyles.doneButton}
        >
          <Text style={resultsStyles.doneButtonText}>Done</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

export function ReviewHeader({ onBack, label, sublabel, accent, colors, isDark }) {
  return (
    <View style={resultsStyles.reviewHeader}>
      <TouchableOpacity
        onPress={onBack}
        activeOpacity={0.78}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        style={[
          resultsStyles.reviewBackBtn,
          {
            backgroundColor: isDark ? 'rgba(17, 31, 55, 0.82)' : 'rgba(255, 255, 255, 0.78)',
            borderColor: hexToRgba(accent, 0.32),
          },
        ]}
      >
        <PremiumIcon name="arrow-left" size={18} color={accent} strokeWidth={2.4} />
      </TouchableOpacity>
      <View style={resultsStyles.reviewHeaderText}>
        <Text style={[resultsStyles.reviewHeaderEyebrow, { color: accent }]} numberOfLines={1}>
          {label}
        </Text>
        {sublabel ? (
          <Text
            style={[resultsStyles.reviewHeaderTitle, { color: colors.text }]}
            numberOfLines={1}
          >
            {sublabel}
          </Text>
        ) : null}
      </View>
      <View style={{ width: 40 }} />
    </View>
  );
}

export function ReviewStemCard({ label, accent, colors, isDark, children }) {
  return (
    <LinearGradient
      colors={
        isDark
          ? ['rgba(18, 35, 64, 0.94)', 'rgba(8, 22, 43, 0.94)']
          : ['rgba(255, 255, 255, 0.96)', 'rgba(246, 250, 255, 0.96)']
      }
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[resultsStyles.stemCard, { borderColor: colors.border }]}
    >
      <View style={[resultsStyles.stemAccent, { backgroundColor: accent }]} />
      <Text style={[resultsStyles.stemLabel, { color: accent }]}>{label}</Text>
      {children}
    </LinearGradient>
  );
}

export function ReviewQuestionCard({ colors, isDark, children }) {
  return (
    <LinearGradient
      colors={
        isDark
          ? ['rgba(15, 28, 51, 0.94)', 'rgba(7, 17, 35, 0.94)']
          : ['rgba(255, 255, 255, 0.98)', 'rgba(246, 250, 255, 0.98)']
      }
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[resultsStyles.questionCard, { borderColor: colors.border }]}
    >
      {children}
    </LinearGradient>
  );
}

export function ReviewNavBar({ onPrev, onNext, accent, colors, isDark }) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        resultsStyles.reviewNavBar,
        {
          backgroundColor: isDark ? 'rgba(7, 19, 39, 0.94)' : 'rgba(255, 255, 255, 0.96)',
          borderTopColor: colors.border,
          paddingBottom: insets.bottom + 8,
        },
      ]}
    >
      <ReviewNavBtn label="Prev" icon="chevron-left" onPress={onPrev} accent={accent} colors={colors} isDark={isDark} />
      <ReviewNavBtn label="Next" icon="chevron-right" onPress={onNext} accent={accent} colors={colors} isDark={isDark} trailingIcon />
    </View>
  );
}

function ReviewNavBtn({ label, icon, onPress, accent, colors, isDark, trailingIcon }) {
  const disabled = !onPress;
  const tint = disabled ? colors.textMuted : accent;
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.78}
      style={[
        resultsStyles.reviewNavBtn,
        {
          backgroundColor: hexToRgba(tint, isDark ? 0.12 : 0.08),
          borderColor: hexToRgba(tint, disabled ? 0.18 : 0.42),
          opacity: disabled ? 0.45 : 1,
        },
      ]}
    >
      {!trailingIcon ? <PremiumIcon name={icon} size={16} color={tint} strokeWidth={2.4} /> : null}
      <Text style={[resultsStyles.reviewNavBtnText, { color: tint }]}>{label}</Text>
      {trailingIcon ? <PremiumIcon name={icon} size={16} color={tint} strokeWidth={2.4} /> : null}
    </TouchableOpacity>
  );
}

export const resultsStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  header: {
    paddingHorizontal: 18,
    paddingTop: 6,
    paddingBottom: 14,
  },
  headerInner: {
    minWidth: 0,
  },
  headerEyebrow: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.6,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 22,
    lineHeight: 27,
    fontWeight: '900',
  },

  scoreCardWrap: {
    borderRadius: 22,
    marginTop: 4,
    marginBottom: 18,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: Platform.OS === 'ios' ? 0.22 : 0,
    shadowRadius: 22,
  },
  scoreCard: {
    borderRadius: 22,
    borderWidth: 1,
    paddingVertical: 26,
    paddingHorizontal: 22,
    alignItems: 'center',
    overflow: 'hidden',
  },
  scorePercent: {
    fontSize: 60,
    fontWeight: '900',
    lineHeight: 66,
    fontVariant: ['tabular-nums'],
  },
  scoreSubLabel: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 4,
    marginBottom: 22,
  },
  scoreStats: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  scoreStat: {
    flex: 1,
    alignItems: 'center',
  },
  scoreStatNum: {
    fontSize: 24,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  scoreStatLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.4,
    marginTop: 4,
    textTransform: 'uppercase',
  },
  scoreStatDivider: {
    width: 1,
    height: 36,
  },

  sectionWrap: {
    marginBottom: 18,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.4,
    marginBottom: 8,
    paddingHorizontal: 4,
  },

  ucatCardWrap: {
    borderRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: Platform.OS === 'ios' ? 0.18 : 0,
    shadowRadius: 16,
  },
  ucatCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 18,
    overflow: 'hidden',
  },
  scaledBadge: {
    alignSelf: 'flex-start',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 10,
  },
  scaledBadgeText: {
    fontSize: 30,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  scaledBadgeRange: {
    fontSize: 14,
    fontWeight: '800',
  },
  ucatDesc: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  ucatDisclaimer: {
    fontSize: 11,
    fontStyle: 'italic',
    lineHeight: 15,
  },

  breakdownList: {
    gap: 8,
  },
  qRow: {
    borderRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: Platform.OS === 'ios' ? 0.12 : 0,
    shadowRadius: 10,
  },
  qRowGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    gap: 12,
    overflow: 'hidden',
  },
  qNumberBadge: {
    minWidth: 44,
    height: 38,
    paddingHorizontal: 8,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qNumberText: {
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.4,
    fontVariant: ['tabular-nums'],
  },
  qBody: {
    flex: 1,
    minWidth: 0,
  },
  qTitle: {
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 19,
  },
  qSubtitle: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  qRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  resultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  resultDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  resultLabel: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },

  bottomBar: {
    paddingHorizontal: 18,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  doneWrap: {
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: Platform.OS === 'ios' ? 0.22 : 0,
    shadowRadius: 12,
  },
  doneButton: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.5,
  },

  // ── Review mode ──
  reviewHeader: {
    paddingHorizontal: 18,
    paddingTop: 4,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  reviewBackBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewHeaderText: {
    flex: 1,
    minWidth: 0,
  },
  reviewHeaderEyebrow: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.6,
    marginBottom: 2,
  },
  reviewHeaderTitle: {
    fontSize: 16,
    fontWeight: '900',
    lineHeight: 20,
  },
  reviewContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 12,
  },
  stemCard: {
    borderRadius: 16,
    padding: 16,
    paddingLeft: 18,
    borderWidth: 1,
    overflow: 'hidden',
  },
  stemAccent: {
    position: 'absolute',
    left: 0,
    top: 16,
    bottom: 16,
    width: 4,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  stemLabel: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.4,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  stemText: {
    fontSize: 14,
    lineHeight: 22,
  },
  questionCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  questionText: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 23,
    marginBottom: 14,
  },
  optionsContainer: {
    gap: 10,
  },
  reviewNavBar: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  reviewNavBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 12,
  },
  reviewNavBtnText: {
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
});

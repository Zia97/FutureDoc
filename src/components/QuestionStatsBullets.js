import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useTextSize } from '../context/TextSizeContext';
import { getPremiumTheme } from '../theme/premiumTheme';

function formatSeconds(ms) {
  if (ms == null || Number.isNaN(ms) || ms < 0) return '—';
  const s = ms / 1000;
  if (s < 10) return `${s.toFixed(1)}s`;
  return `${Math.round(s)}s`;
}

/**
 * Renders the 3-bullet stat block under an answer explanation:
 *   • Time taken: …
 *   • Average time: …
 *   • Students answered correctly: …%
 *
 * @param {object} props
 * @param {number|null} props.userTimeMs   The user's own time on this question (this attempt).
 * @param {{ avgTimeMs: number, correctPct: number, totalFirstAttempts: number } | null} props.stats
 */
export default function QuestionStatsBullets({ userTimeMs, stats }) {
  const { isDark } = useTheme();
  const { colors } = getPremiumTheme(isDark);
  const { multiplier } = useTextSize();
  const textScaled = {
    fontSize: Math.round(styles.line.fontSize * multiplier),
    lineHeight: Math.round(styles.line.lineHeight * multiplier),
  };

  const avgDisplay = stats ? formatSeconds(stats.avgTimeMs) : '—';
  const pctDisplay = stats ? `${stats.correctPct}%` : '—';

  return (
    <View style={[styles.wrap, { borderTopColor: colors.border }]}>
      <Text style={[styles.line, textScaled, { color: colors.textSecondary }]}>
        {`• Time taken: ${formatSeconds(userTimeMs)}`}
      </Text>
      <Text style={[styles.line, textScaled, { color: colors.textSecondary }]}>
        {`• Average time: ${avgDisplay}`}
      </Text>
      <Text style={[styles.line, textScaled, { color: colors.textSecondary }]}>
        {`• Students answered correctly: ${pctDisplay}`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 2,
  },
  line: {
    fontSize: 13,
    lineHeight: 19,
  },
});

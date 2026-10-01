import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../../context/ThemeContext';
import { getPremiumTheme, hexToRgba } from '../../theme/premiumTheme';
import PremiumIcon from '../premium/PremiumIcon';
import ReportLessonButton from '../ReportLessonButton';

export default function LessonSlidePager({
  lesson,
  navigation,
  accent,
  section,
  renderBlock,
  onQuestionAnswered,
  demoCtx,
  workedExampleCtx,
  savedMiniAnswers,
  onLastSlideReached,
  lockedIndices,
}) {
  const { isDark } = useTheme();
  const { colors } = getPremiumTheme(isDark);
  const insets = useSafeAreaInsets();
  const initialWidth = Dimensions.get('window').width;
  const [width, setWidth] = useState(initialWidth);
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);
  const total = lesson.steps.length;
  const lastNotifiedRef = useRef(false);

  useEffect(() => {
    setCurrentIndex(0);
    lastNotifiedRef.current = false;
    flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
    if (total <= 1) {
      lastNotifiedRef.current = true;
      onLastSlideReached?.();
    }
  }, [lesson.id, total, onLastSlideReached]);

  const handleMomentumScrollEnd = useCallback((e) => {
    if (!width) return;
    const idx = Math.round(e.nativeEvent.contentOffset.x / width);
    if (idx === currentIndex) return;
    if (idx > currentIndex && lockedIndices && lockedIndices.has(currentIndex)) {
      flatListRef.current?.scrollToOffset({ offset: currentIndex * width, animated: true });
      return;
    }
    setCurrentIndex(idx);
    if (idx >= total - 1 && !lastNotifiedRef.current) {
      lastNotifiedRef.current = true;
      onLastSlideReached?.();
    }
  }, [width, currentIndex, total, onLastSlideReached, lockedIndices]);

  const handleBack = () => {
    if (navigation?.canGoBack?.()) {
      navigation.goBack();
      return;
    }
    navigation?.navigate?.('Home');
  };

  const goToSlide = useCallback((target) => {
    if (!width) return;
    const clamped = Math.max(0, Math.min(total - 1, target));
    if (clamped === currentIndex) return;
    if (clamped > currentIndex && lockedIndices && lockedIndices.has(currentIndex)) return;
    flatListRef.current?.scrollToOffset({ offset: clamped * width, animated: true });
    setCurrentIndex(clamped);
    if (clamped >= total - 1 && !lastNotifiedRef.current) {
      lastNotifiedRef.current = true;
      onLastSlideReached?.();
    }
  }, [width, currentIndex, total, lockedIndices, onLastSlideReached]);

  const canGoLeft = currentIndex > 0;
  const canGoRight = currentIndex < total - 1 && !(lockedIndices && lockedIndices.has(currentIndex));

  const getItemLayout = useMemo(
    () => (_, index) => ({ length: width, offset: width * index, index }),
    [width],
  );

  return (
    <View
      style={styles.container}
      onLayout={(e) => {
        const w = e.nativeEvent.layout.width;
        if (w && w !== width) setWidth(w);
      }}
    >
      <View style={[styles.topBar, { paddingTop: Math.max(insets.top, 12) + 6 }]}>
        <TouchableOpacity
          activeOpacity={0.82}
          onPress={handleBack}
          style={[
            styles.iconButton,
            {
              backgroundColor: isDark ? 'rgba(17, 31, 55, 0.82)' : 'rgba(255, 255, 255, 0.78)',
              borderColor: isDark ? 'rgba(122, 158, 214, 0.2)' : 'rgba(69, 94, 140, 0.22)',
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Exit lesson"
        >
          <PremiumIcon name="arrow-left" size={20} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.topBarCopy}>
          <Text style={[styles.lessonTitle, { color: colors.text }]} numberOfLines={1}>
            {lesson.title}
          </Text>
          <View style={styles.partRow}>
            <TouchableOpacity
              activeOpacity={canGoLeft ? 0.6 : 1}
              onPress={canGoLeft ? () => goToSlide(currentIndex - 1) : undefined}
              disabled={!canGoLeft}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 6 }}
              accessibilityRole="button"
              accessibilityLabel="Previous part"
              accessibilityState={{ disabled: !canGoLeft }}
            >
              <PremiumIcon
                name="chevron-left"
                size={14}
                color={canGoLeft ? accent : hexToRgba(colors.textMuted, 0.4)}
                strokeWidth={2.6}
              />
            </TouchableOpacity>
            <Text style={[styles.partLabel, { color: accent }]}>
              Part {Math.min(currentIndex + 1, total)} of {total}
            </Text>
            <TouchableOpacity
              activeOpacity={canGoRight ? 0.6 : 1}
              onPress={canGoRight ? () => goToSlide(currentIndex + 1) : undefined}
              disabled={!canGoRight}
              hitSlop={{ top: 10, bottom: 10, left: 6, right: 10 }}
              accessibilityRole="button"
              accessibilityLabel="Next part"
              accessibilityState={{ disabled: !canGoRight }}
            >
              <PremiumIcon
                name="chevron-right"
                size={14}
                color={canGoRight ? accent : hexToRgba(colors.textMuted, 0.4)}
                strokeWidth={2.6}
              />
            </TouchableOpacity>
          </View>
        </View>

        <ReportLessonButton
          section={section}
          lessonId={lesson.id}
          lessonTitle={lesson.title}
          partNumber={Math.min(currentIndex + 1, total)}
          totalParts={total}
        />
      </View>

      <View
        style={[
          styles.progressTrack,
          {
            backgroundColor: isDark ? 'rgba(5, 12, 26, 0.64)' : 'rgba(219, 234, 254, 0.82)',
            borderColor: colors.border,
          },
        ]}
      >
        <View
          style={[
            styles.progressFill,
            {
              width: `${total > 0 ? ((currentIndex + 1) / total) * 100 : 0}%`,
              backgroundColor: accent,
            },
          ]}
        />
      </View>

      <FlatList
        ref={flatListRef}
        data={lesson.steps}
        keyExtractor={(_, i) => `${lesson.id}-slide-${i}`}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        scrollEventThrottle={16}
        initialNumToRender={1}
        windowSize={3}
        getItemLayout={getItemLayout}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item, index }) => (
          <View style={[styles.slide, { width }]}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled
              contentContainerStyle={styles.slideScrollContent}
            >
              {renderBlock(
                item,
                index,
                accent,
                colors,
                isDark,
                onQuestionAnswered,
                demoCtx,
                workedExampleCtx,
                savedMiniAnswers,
              )}
            </ScrollView>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarCopy: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
  },
  lessonTitle: {
    fontSize: 15,
    lineHeight: 19,
    fontWeight: '900',
    textAlign: 'center',
  },
  partRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 3,
  },
  partLabel: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  progressTrack: {
    height: 4,
    marginHorizontal: 20,
    borderRadius: 999,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },
  slide: {
    paddingHorizontal: 20,
  },
  slideScrollContent: {
    flexGrow: 1,
    paddingTop: 8,
    paddingBottom: 24,
  },
});

export { LessonSlidePager };

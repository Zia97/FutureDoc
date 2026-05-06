import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';

import { useSubscription } from '../../context/SubscriptionContext';
import { useTheme } from '../../context/ThemeContext';
import { usePaywallNavigation } from '../../hooks/ui/usePaywallNavigation';
import { getPremiumTheme, hexToRgba, premiumColors } from '../../theme/premiumTheme';
import SyncBanner from '../SyncBanner';
import PremiumIcon from './PremiumIcon';
import { AppHeader, PremiumScreen } from './PremiumPracticeUI';

const STATUS_META = {
  not_started: {
    label: 'Not Started',
    color: premiumColors.blue,
    ringColor: '#8FA4CA',
  },
  in_progress: {
    label: 'In Progress',
    color: premiumColors.amber,
    ringColor: premiumColors.amber,
  },
  completed: {
    label: 'Completed',
    color: '#62E76B',
    ringColor: '#62E76B',
  },
};

function normalizeStatus(status) {
  return status || 'not_started';
}

function StatusMark({ status, size = 34 }) {
  const normalized = normalizeStatus(status);
  const meta = STATUS_META[normalized] ?? STATUS_META.not_started;
  const center = size / 2;
  const radius = size * 0.34;
  const circumference = 2 * Math.PI * radius;
  const progressLength = circumference * 0.62;

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Circle
        cx={center}
        cy={center}
        r={radius}
        stroke={normalized === 'not_started' ? meta.ringColor : hexToRgba(meta.ringColor, 0.22)}
        strokeWidth={size * 0.1}
        fill="none"
        opacity={normalized === 'not_started' ? 0.8 : 1}
      />
      {normalized === 'in_progress' ? (
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={meta.ringColor}
          strokeWidth={size * 0.1}
          strokeLinecap="round"
          strokeDasharray={`${progressLength} ${circumference - progressLength}`}
          rotation="-90"
          origin={`${center}, ${center}`}
          fill="none"
        />
      ) : null}
      {normalized === 'completed' ? (
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={meta.ringColor}
          strokeWidth={size * 0.1}
          fill="none"
        />
      ) : null}
      {normalized === 'completed' ? (
        <Path
          d={`M${size * 0.32} ${size * 0.52} L${size * 0.45} ${size * 0.65} L${size * 0.7} ${size * 0.37}`}
          stroke={meta.ringColor}
          strokeWidth={size * 0.11}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      ) : null}
    </Svg>
  );
}

function StatsCard({ status, count, colors, onReset, resetDisabled, resetting }) {
  const meta = STATUS_META[status];

  return (
    <View
      style={[
        styles.statCard,
        {
          borderColor: hexToRgba(meta.color, 0.45),
          backgroundColor: hexToRgba(meta.color, 0.07),
        },
      ]}
    >
      <View style={styles.statTopRow}>
        <StatusMark status={status} size={23} />
        <Text style={[styles.statCount, { color: meta.color }]} numberOfLines={1}>
          {count}
        </Text>
      </View>
      <Text style={[styles.statLabel, { color: colors.textSecondary }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.82}>
        {meta.label}
      </Text>
      {onReset ? (
        <TouchableOpacity
          onPress={onReset}
          disabled={resetDisabled || resetting}
          activeOpacity={0.78}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel="Reset section progress"
          style={[
            styles.resetIconButton,
            {
              backgroundColor: hexToRgba(colors.red, resetDisabled ? 0.07 : 0.16),
              borderColor: hexToRgba(colors.red, resetDisabled ? 0.25 : 0.55),
              opacity: resetDisabled ? 0.55 : 1,
            },
          ]}
        >
          {resetting ? (
            <ActivityIndicator size="small" color={colors.red} />
          ) : (
            <PremiumIcon name="refresh" size={13} color={colors.red} strokeWidth={2.6} />
          )}
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

function ListHeader({
  pluralLabel,
  stats,
  searchText,
  setSearchText,
  searchPlaceholder,
  filterControls,
  openFilterKey,
  setOpenFilterKey,
  onControlsLayout,
  colors,
  isDark,
  onReset,
  deleting,
}) {
  const hasExtraFilters = filterControls.length > 1;
  const resetDisabled = stats.completed === 0 && stats.inProgress === 0;

  return (
    <View style={styles.headerWrap}>
      <View style={styles.statsRow}>
        <StatsCard status="not_started" count={stats.notStarted} colors={colors} />
        <StatsCard status="in_progress" count={stats.inProgress} colors={colors} />
        <StatsCard
          status="completed"
          count={stats.completed}
          colors={colors}
          onReset={onReset}
          resetDisabled={resetDisabled}
          resetting={deleting}
        />
      </View>

      <View style={hasExtraFilters ? styles.controlsStack : styles.controlsRow} onLayout={onControlsLayout}>
        <View
          style={[
            styles.searchBox,
            {
              borderColor: isDark ? hexToRgba('#9BB8E6', 0.38) : hexToRgba('#455E8C', 0.22),
              backgroundColor: isDark ? 'rgba(2, 8, 18, 0.52)' : 'rgba(255, 255, 255, 0.82)',
            },
            hasExtraFilters && styles.searchBoxWide,
          ]}
        >
          <PremiumIcon name="search" size={24} color={colors.textSecondary} strokeWidth={2.1} />
          <TextInput
            value={searchText}
            onChangeText={setSearchText}
            onFocus={() => setOpenFilterKey(null)}
            placeholder={searchPlaceholder}
            placeholderTextColor={hexToRgba(colors.textSecondary, 0.72)}
            style={[styles.searchInput, { color: colors.text }]}
            returnKeyType="search"
            autoCorrect={false}
          />
        </View>

        <View style={hasExtraFilters ? styles.filterButtonsRow : styles.filterWrap}>
          {filterControls.map((control) => (
            <TouchableOpacity
              key={control.key}
              onPress={() => setOpenFilterKey((openKey) => (openKey === control.key ? null : control.key))}
              activeOpacity={0.84}
              style={[
                styles.filterButton,
                {
                  borderColor: hexToRgba(colors.blue, 0.62),
                  backgroundColor: isDark ? 'rgba(7, 19, 39, 0.86)' : 'rgba(255, 255, 255, 0.86)',
                },
                hasExtraFilters && styles.filterButtonCompact,
                control.active && styles.filterButtonActive,
                control.active && { backgroundColor: hexToRgba(colors.blue, isDark ? 0.12 : 0.1) },
              ]}
              accessibilityRole="button"
            >
              <PremiumIcon name="filter" size={hasExtraFilters ? 20 : 23} color={colors.text} strokeWidth={2.2} />
              <Text style={[styles.filterText, { color: colors.text }]} numberOfLines={1}>
                {control.label}
              </Text>
              <PremiumIcon
                name="chevron-down"
                size={hasExtraFilters ? 17 : 19}
                color={openFilterKey === control.key ? colors.cyan : colors.blue}
                strokeWidth={2.5}
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}

function FilterDropdown({ top, control, setFilterValue, setOpenFilterKey, colors, isDark }) {
  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={() => setOpenFilterKey(null)}
      style={styles.dropdownOverlay}
    >
      <View
        style={[
          styles.dropdownMenu,
          {
            top,
            borderColor: hexToRgba(colors.blue, isDark ? 0.56 : 0.32),
            backgroundColor: isDark ? 'rgba(5, 15, 32, 0.98)' : 'rgba(255, 255, 255, 0.98)',
            shadowColor: colors.blue,
          },
        ]}
        pointerEvents="box-none"
      >
        {control.options.map((option) => {
          const selected = option.value === control.activeValue;
          const meta = STATUS_META[option.value];
          return (
            <TouchableOpacity
              key={option.value}
              onPress={() => {
                setFilterValue(control.key, option.value);
                setOpenFilterKey(null);
              }}
              activeOpacity={0.78}
              style={[
                styles.dropdownItem,
                { borderBottomColor: hexToRgba(colors.blue, isDark ? 0.12 : 0.1) },
                selected && styles.dropdownItemSelected,
                selected && { backgroundColor: hexToRgba(colors.blue, isDark ? 0.13 : 0.09) },
              ]}
            >
              {option.value === 'all' ? (
                <PremiumIcon name="filter" size={17} color={colors.blue} strokeWidth={2} />
              ) : meta ? (
                <StatusMark status={option.value} size={18} />
              ) : (
                <View style={[styles.dropdownDot, { backgroundColor: colors.cyan }]} />
              )}
              <Text
                style={[
                  styles.dropdownText,
                  { color: colors.textSecondary },
                  selected && { color: meta?.color ?? colors.blue },
                ]}
                numberOfLines={1}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </TouchableOpacity>
  );
}

export default function PremiumQuestionListScreen({
  title,
  items,
  pluralLabel,
  searchPlaceholder,
  getTitle,
  getStatus,
  getIndex,
  getIsFree,
  getItemKey,
  getSearchText,
  getExtraNavParams,
  getBadgeLabel,
  extraFilters = [],
  routeName,
  navigation,
  loading,
  error,
  syncing,
  syncProgress,
  deleting,
  onReset,
  onResetItem,
  resetItemLabel = 'this question',
}) {
  const insets = useSafeAreaInsets();
  const { isPro } = useSubscription();
  const openPaywall = usePaywallNavigation();
  const { isDark } = useTheme();
  const { colors } = getPremiumTheme(isDark);
  const [searchText, setSearchText] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [extraFilterValues, setExtraFilterValues] = useState({});
  const [openFilterKey, setOpenFilterKey] = useState(null);
  const [filterMenuTop, setFilterMenuTop] = useState(236);
  const [headerHeight, setHeaderHeight] = useState(0);
  const headerTitle = title ?? pluralLabel;

  const screenHeader = (
    <View onLayout={(event) => setHeaderHeight(event.nativeEvent.layout.height)}>
      <AppHeader navigation={navigation} title={headerTitle} />
    </View>
  );

  const indexedItems = useMemo(() => (
    (items ?? []).map((item, originalIndex) => {
      const titleText = getTitle(item, originalIndex) ?? '';
      const extraSearchText = getSearchText?.(item, originalIndex) ?? '';
      return {
        item,
        originalIndex,
        title: String(titleText),
        searchText: `${titleText} ${extraSearchText}`.toLowerCase(),
        status: normalizeStatus(getStatus?.(item, originalIndex)),
        isFree: getIsFree ? !!getIsFree(item, originalIndex) : true,
      };
    })
  ), [getIsFree, getSearchText, getStatus, getTitle, items]);

  const stats = useMemo(() => indexedItems.reduce((acc, entry) => {
    if (entry.status === 'completed') acc.completed += 1;
    else if (entry.status === 'in_progress') acc.inProgress += 1;
    else acc.notStarted += 1;
    return acc;
  }, { notStarted: 0, inProgress: 0, completed: 0 }), [indexedItems]);

  const visibleItems = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    const filtered = indexedItems.filter((entry) => {
      if (activeFilter !== 'all' && entry.status !== activeFilter) return false;
      for (const filter of extraFilters) {
        const activeValue = extraFilterValues[filter.key] ?? 'all';
        if (activeValue !== 'all' && filter.getValue?.(entry.item, entry.originalIndex) !== activeValue) {
          return false;
        }
      }
      if (query && !entry.searchText.includes(query)) return false;
      return true;
    });
    return filtered.sort((a, b) => {
      if (a.isFree !== b.isFree) return a.isFree ? -1 : 1;
      return a.originalIndex - b.originalIndex;
    });
  }, [activeFilter, extraFilterValues, extraFilters, indexedItems, searchText]);

  const filterOptions = useMemo(() => ([
    { label: `All ${pluralLabel}`, value: 'all' },
    { label: 'Not Started', value: 'not_started' },
    { label: 'In Progress', value: 'in_progress' },
    { label: 'Completed', value: 'completed' },
  ]), [pluralLabel]);

  const filterControls = useMemo(() => {
    const statusLabel = filterOptions.find((option) => option.value === activeFilter)?.label ?? filterOptions[0]?.label;
    return [
      {
        key: 'status',
        label: statusLabel,
        options: filterOptions,
        activeValue: activeFilter,
        active: activeFilter !== 'all',
      },
      ...extraFilters.map((filter) => {
        const activeValue = extraFilterValues[filter.key] ?? 'all';
        const activeLabel = filter.options.find((option) => option.value === activeValue)?.label ?? filter.label;
        return {
          key: filter.key,
          label: activeLabel,
          options: filter.options,
          activeValue,
          active: activeValue !== 'all',
        };
      }),
    ];
  }, [activeFilter, extraFilterValues, extraFilters, filterOptions]);

  const openControl = filterControls.find((control) => control.key === openFilterKey);

  const setFilterValue = (key, value) => {
    if (key === 'status') {
      setActiveFilter(value);
      return;
    }
    setExtraFilterValues((current) => ({ ...current, [key]: value }));
  };

  const extraNavParams = getExtraNavParams?.(visibleItems.map((entry) => entry.item), visibleItems) ?? {};

  const renderItem = ({ item: entry, index }) => {
    const item = entry.item;
    const isFree = getIsFree ? getIsFree(item, entry.originalIndex) : true;
    const isLocked = !isFree && !isPro;
    const meta = STATUS_META[entry.status] ?? STATUS_META.not_started;
    const rowColor = isLocked ? colors.amber : meta.color;
    const navIndex = getIndex ? getIndex(item, entry.originalIndex) : entry.originalIndex;
    const badgeLabel = getBadgeLabel?.(item, entry.originalIndex);
    const rowGradient = isDark
      ? [hexToRgba(rowColor, 0.16), 'rgba(7, 20, 39, 0.94)', 'rgba(4, 10, 24, 0.98)']
      : [hexToRgba(rowColor, 0.08), 'rgba(255, 255, 255, 0.98)', 'rgba(247, 250, 255, 0.98)'];

    return (
      <TouchableOpacity
        activeOpacity={0.82}
        style={[styles.rowTouch, isLocked && styles.lockedRow]}
        onPress={() => {
          if (isLocked) {
            openPaywall();
            return;
          }
          navigation.navigate(routeName, { index: navIndex, ...extraNavParams });
        }}
        accessibilityRole="button"
      >
        <LinearGradient
          colors={rowGradient}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={[
            styles.rowCard,
            {
              borderColor: hexToRgba(rowColor, entry.status === 'not_started' ? 0.44 : 0.7),
              shadowColor: rowColor,
            },
          ]}
        >
          <View style={[styles.rowAccent, { backgroundColor: rowColor }]} />
          <Text style={[styles.rowNumber, { color: rowColor }]} numberOfLines={1}>
            {isLocked ? 'PRO' : index + 1}
          </Text>
          <View style={[styles.rowDivider, { backgroundColor: hexToRgba(rowColor, 0.22) }]} />
          <View style={styles.rowCopy}>
            <Text style={[styles.rowTitle, { color: colors.text }]} numberOfLines={2}>
              {entry.title}
            </Text>
            {badgeLabel ? (
              <View style={[styles.typeBadge, { borderColor: hexToRgba(colors.cyan, 0.38), backgroundColor: hexToRgba(colors.cyan, 0.1) }]}>
                <Text style={[styles.typeBadgeText, { color: colors.cyan }]} numberOfLines={1}>
                  {badgeLabel}
                </Text>
              </View>
            ) : null}
          </View>
          <View style={styles.rowStatusCluster}>
            {isLocked ? (
              <PremiumIcon name="lock" size={30} color={colors.amber} strokeWidth={1.9} />
            ) : (
              <StatusMark status={entry.status} size={34} />
            )}
            {!isLocked && onResetItem && entry.status !== 'not_started' ? (
              <TouchableOpacity
                onPress={(event) => {
                  event.stopPropagation?.();
                  Alert.alert(
                    'Reset Progress',
                    `Reset your progress for ${resetItemLabel}? This cannot be undone.`,
                    [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Reset',
                        style: 'destructive',
                        onPress: () => onResetItem(item, entry.originalIndex),
                      },
                    ],
                  );
                }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                accessibilityRole="button"
                accessibilityLabel="Reset progress for this item"
              >
                <PremiumIcon name="more-vertical" size={22} color={colors.textMuted} />
              </TouchableOpacity>
            ) : (
              <PremiumIcon name="more-vertical" size={22} color={colors.textMuted} />
            )}
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <PremiumScreen>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.bgTop} />
        {screenHeader}
        <SyncBanner visible={syncing} progress={syncProgress} />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.blue} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading {pluralLabel}...</Text>
        </View>
      </PremiumScreen>
    );
  }

  if (error) {
    return (
      <PremiumScreen>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.bgTop} />
        {screenHeader}
        <SyncBanner visible={syncing} progress={syncProgress} />
        <View style={styles.centered}>
          <Text style={[styles.errorTitle, { color: colors.text }]}>Something went wrong</Text>
          <Text style={[styles.errorText, { color: colors.textSecondary }]}>{JSON.stringify(error)}</Text>
        </View>
      </PremiumScreen>
    );
  }

  return (
    <PremiumScreen>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.bgTop} />
      {screenHeader}
      <SyncBanner visible={syncing} progress={syncProgress} />
      <FlatList
        data={visibleItems}
        keyExtractor={(entry, index) => String(getItemKey?.(entry.item, entry.originalIndex) ?? entry.item?.id ?? entry.item?.setId ?? index)}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContent,
          {
            paddingBottom: Math.max(insets.bottom, 8) + 16,
          },
        ]}
        ListHeaderComponent={(
          <ListHeader
            pluralLabel={pluralLabel}
            stats={stats}
            searchText={searchText}
            setSearchText={setSearchText}
            searchPlaceholder={searchPlaceholder}
            filterControls={filterControls}
            openFilterKey={openFilterKey}
            setOpenFilterKey={setOpenFilterKey}
            onControlsLayout={(event) => setFilterMenuTop(headerHeight + event.nativeEvent.layout.y + (filterControls.length > 1 ? 112 : 62))}
            colors={colors}
            isDark={isDark}
            onReset={onReset}
            deleting={deleting}
          />
        )}
        renderItem={renderItem}
        ListEmptyComponent={(
          <View style={styles.emptyState}>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No {pluralLabel} found</Text>
            <Text style={[styles.emptyBody, { color: colors.textSecondary }]}>Try changing the search or filter.</Text>
          </View>
        )}
      />
      {openControl ? (
        <FilterDropdown
          top={filterMenuTop}
          control={openControl}
          setFilterValue={setFilterValue}
          setOpenFilterKey={setOpenFilterKey}
          colors={colors}
          isDark={isDark}
        />
      ) : null}
    </PremiumScreen>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  loadingText: {
    color: premiumColors.textSecondary,
    fontSize: 15,
    marginTop: 14,
    fontWeight: '600',
  },
  errorTitle: {
    color: premiumColors.text,
    fontSize: 19,
    fontWeight: '800',
    marginBottom: 8,
  },
  errorText: {
    color: premiumColors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
  listContent: {
    paddingHorizontal: 18,
  },
  headerWrap: {
    paddingTop: 0,
    paddingBottom: 10,
    zIndex: 20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    minHeight: 76,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 11,
    justifyContent: 'center',
  },
  statTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 5,
  },
  statCount: {
    fontSize: 21,
    lineHeight: 25,
    fontWeight: '900',
  },
  statLabel: {
    color: premiumColors.textSecondary,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '600',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    zIndex: 30,
  },
  controlsStack: {
    gap: 10,
    zIndex: 30,
  },
  searchBox: {
    flex: 1,
    minWidth: 0,
    height: 56,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: hexToRgba('#9BB8E6', 0.38),
    backgroundColor: 'rgba(2, 8, 18, 0.52)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 11,
  },
  searchBoxWide: {
    width: '100%',
    flex: 0,
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    color: premiumColors.text,
    fontSize: 16,
    fontWeight: '600',
    paddingVertical: 0,
  },
  filterWrap: {
    position: 'relative',
    zIndex: 40,
  },
  filterButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    zIndex: 40,
  },
  filterButton: {
    width: 168,
    height: 56,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: hexToRgba(premiumColors.blue, 0.72),
    backgroundColor: 'rgba(7, 19, 39, 0.86)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
    gap: 9,
  },
  filterButtonCompact: {
    flex: 1,
    width: 'auto',
    height: 48,
    paddingHorizontal: 12,
  },
  filterButtonActive: {
    backgroundColor: hexToRgba(premiumColors.blue, 0.12),
  },
  filterText: {
    flex: 1,
    minWidth: 0,
    color: premiumColors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  dropdownOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 200,
    elevation: 200,
  },
  dropdownMenu: {
    position: 'absolute',
    right: 18,
    width: 208,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: hexToRgba(premiumColors.blue, 0.56),
    backgroundColor: 'rgba(5, 15, 32, 0.98)',
    overflow: 'hidden',
    shadowColor: premiumColors.blue,
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: Platform.OS === 'ios' ? 0.3 : 0,
    shadowRadius: 24,
    elevation: 24,
  },
  dropdownItem: {
    minHeight: 45,
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(116, 154, 209, 0.12)',
  },
  dropdownItemSelected: {
    backgroundColor: hexToRgba(premiumColors.blue, 0.13),
  },
  dropdownDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: premiumColors.cyan,
    marginHorizontal: 4,
  },
  dropdownText: {
    flex: 1,
    minWidth: 0,
    color: premiumColors.textSecondary,
    fontSize: 14,
    fontWeight: '700',
  },
  rowTouch: {
    marginBottom: 13,
    borderRadius: 18,
  },
  lockedRow: {
    opacity: 0.72,
  },
  rowCard: {
    minHeight: 88,
    borderRadius: 18,
    borderWidth: 1,
    paddingVertical: 13,
    paddingLeft: 14,
    paddingRight: 12,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: Platform.OS === 'ios' ? 0.14 : 0,
    shadowRadius: 18,
    elevation: 0,
  },
  rowAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
  },
  rowNumber: {
    width: 40,
    textAlign: 'center',
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '900',
  },
  rowDivider: {
    width: 1,
    height: 56,
    marginLeft: 9,
    marginRight: 13,
  },
  rowTitle: {
    color: premiumColors.text,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '800',
  },
  rowCopy: {
    flex: 1,
    minWidth: 0,
    marginRight: 10,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    marginTop: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: hexToRgba(premiumColors.cyan, 0.38),
    backgroundColor: hexToRgba(premiumColors.cyan, 0.1),
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  typeBadgeText: {
    color: premiumColors.cyan,
    fontSize: 10,
    lineHeight: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  rowStatusCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  emptyState: {
    minHeight: 150,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  emptyTitle: {
    color: premiumColors.text,
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 6,
  },
  emptyBody: {
    color: premiumColors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
  },
  resetIconButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

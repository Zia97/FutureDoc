import React from 'react';
import {
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';

export default function SectionQuestionList({ items, getTitle, getStatus, getIndex, routeName, navigation, listFooter }) {
  const { theme: t } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: t.bgInput }]} edges={['bottom', 'left', 'right']}>
      <StatusBar barStyle={t.statusBar} backgroundColor={t.bgInput} />
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListFooterComponent={listFooter ?? null}
        renderItem={({ item, index }) => {
          const status = getStatus ? getStatus(item) : null;
          const navIndex = getIndex ? getIndex(item, index) : index;
          return (
            <TouchableOpacity
              style={[styles.row, { borderBottomColor: t.border }]}
              onPress={() => navigation.navigate(routeName, { index: navIndex })}
              activeOpacity={0.75}
            >
              <Text style={[styles.number, { color: t.accent }]}>{index + 1}.</Text>
              <Text style={[styles.title, { color: t.text }]} numberOfLines={2}>{getTitle(item, index)}</Text>
              {getStatus && (
                <Text style={[styles.statusCircle, { color: t.accent }]}>
                  {status === 'completed' ? '●' : status === 'in_progress' ? '◑' : '○'}
                </Text>
              )}
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    borderBottomWidth: 1,
    gap: 12,
  },
  number: {
    fontSize: 16,
    fontWeight: '700',
    width: 28,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  statusCircle: {
    fontSize: 28,
  },
});

import React from 'react';
import {
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// getTitle:  (item, index) => string
// getStatus: (item) => 'completed' | 'in_progress' | null  (optional)
// getIndex:  (item, index) => number  — override nav index, e.g. when list is filtered (optional)
// routeName: navigation route to push, receives { index }
export default function SectionQuestionList({ items, getTitle, getStatus, getIndex, routeName, navigation }) {
  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item, index }) => {
          const status = getStatus ? getStatus(item) : null;
          const navIndex = getIndex ? getIndex(item, index) : index;
          return (
            <TouchableOpacity
              style={styles.row}
              onPress={() => navigation.navigate(routeName, { index: navIndex })}
              activeOpacity={0.75}
            >
              <Text style={styles.number}>{index + 1}.</Text>
              <Text style={styles.title} numberOfLines={2}>{getTitle(item, index)}</Text>
              {getStatus && (
                <Text style={styles.statusCircle}>
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
    backgroundColor: '#1a1a2e',
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
    borderBottomColor: '#16213e',
    gap: 12,
  },
  number: {
    color: '#7c3aed',
    fontSize: 16,
    fontWeight: '700',
    width: 28,
  },
  title: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  statusCircle: {
    color: '#7c3aed',
    fontSize: 28,
  },
});

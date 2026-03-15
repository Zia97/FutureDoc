import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// getTitle: (item, index) => string
// routeName: navigation route to push, receives { index }
export default function SectionQuestionList({ items, getTitle, routeName, navigation }) {
  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
      <FlatList
        data={items}
        keyExtractor={(_, index) => index.toString()}
        contentContainerStyle={styles.listContent}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            style={styles.row}
            onPress={() => navigation.navigate(routeName, { index })}
            activeOpacity={0.75}
          >
            <Text style={styles.number}>{index + 1}.</Text>
            <Text style={styles.title} numberOfLines={2}>{getTitle(item, index)}</Text>
          </TouchableOpacity>
        )}
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
});

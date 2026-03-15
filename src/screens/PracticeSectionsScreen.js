import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';

const SECTIONS = [
  {
    id: 'VR',
    title: 'Verbal Reasoning',
    description: 'Reading comprehension & analysis',
    color: '#7c3aed',
  },
  {
    id: 'DM',
    title: 'Decision Making',
    description: 'Logic puzzles & diagrams',
    color: '#0891b2',
  },
  {
    id: 'QR',
    title: 'Quantitative Reasoning',
    description: 'Numerical problem solving',
    color: '#059669',
  },
  {
    id: 'SJ',
    title: 'Situational Judgement',
    description: 'Clinical scenario judgement',
    color: '#d97706',
  },
];

export default function PracticeSectionsScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />

      <Text style={styles.heading}>Select Section</Text>
      <Text style={styles.subheading}>Choose a section to practise</Text>

      <View style={styles.grid}>
        {SECTIONS.map((section) => (
          <TouchableOpacity
            key={section.id}
            style={[styles.card, { borderLeftColor: section.color }]}
            activeOpacity={0.8}
            onPress={() => {
              if (section.id === 'VR') navigation.navigate('VRQuestionList');
            }}
          >
            <View style={[styles.badge, { backgroundColor: section.color }]}>
              <Text style={styles.badgeText}>{section.id}</Text>
            </View>
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>{section.title}</Text>
              <Text style={styles.cardDescription}>{section.description}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  heading: {
    fontSize: 32,
    fontWeight: '800',
    color: '#ffffff',
  },
  subheading: {
    fontSize: 14,
    color: '#a0aec0',
    marginTop: 6,
    marginBottom: 36,
  },
  grid: {
    gap: 16,
  },
  card: {
    backgroundColor: '#16213e',
    borderRadius: 14,
    borderLeftWidth: 4,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  badge: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  badgeText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 13,
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
  },
  cardDescription: {
    color: '#a0aec0',
    fontSize: 13,
    marginTop: 3,
  },
});

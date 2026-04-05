import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

const SECTIONS = [
  {
    id: 'VR',
    title: 'Verbal Reasoning',
    description: '44 questions — 22 minutes',
    color: '#7c3aed',
    icon: 'book-open-page-variant',
  },
  {
    id: 'DM',
    title: 'Decision Making',
    description: '35 questions — 37 minutes',
    color: '#0891b2',
    icon: 'head-cog-outline',
  },
  {
    id: 'QR',
    title: 'Quantitative Reasoning',
    description: '36 questions — 26 minutes',
    color: '#059669',
    icon: 'calculator-variant',
  },
  {
    id: 'SJ',
    title: 'Situational Judgement',
    description: '69 questions — 26 minutes',
    color: '#d97706',
    icon: 'stethoscope',
  },
];

export default function TimedPracticeSectionsScreen({ navigation }) {
  const { theme: t } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: t.bgInput }]}>
      <StatusBar barStyle={t.statusBar} backgroundColor={t.bgInput} />

      <Text style={[styles.heading, { color: t.text }]}>Timed Practice</Text>
      <Text style={[styles.subheading, { color: t.textSecondary }]}>Select a section to view timed tests</Text>

      <View style={styles.grid}>
        {SECTIONS.map((section) => (
          <TouchableOpacity
            key={section.id}
            style={[styles.card, { backgroundColor: t.bgCard, borderLeftColor: section.color, borderColor: t.border }]}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('TimedTestList', { section: section.id, title: section.title })}
          >
            <View style={[styles.badge, { backgroundColor: section.color }]}>
              <MaterialCommunityIcons name={section.icon} size={26} color="#ffffff" />
            </View>
            <View style={styles.cardText}>
              <Text style={[styles.cardTitle, { color: t.text }]}>{section.title}</Text>
              <Text style={[styles.cardDescription, { color: t.textSecondary }]}>{section.description}</Text>
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
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  heading: {
    fontSize: 32,
    fontWeight: '800',
  },
  subheading: {
    fontSize: 14,
    marginTop: 6,
    marginBottom: 36,
  },
  grid: {
    gap: 16,
  },
  card: {
    borderRadius: 14,
    borderLeftWidth: 4,
    borderWidth: 1,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
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
  cardText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  cardDescription: {
    fontSize: 13,
    marginTop: 3,
  },
});

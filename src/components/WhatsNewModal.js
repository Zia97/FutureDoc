import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';

const WHATS_NEW_KEY = 'whats_new_seen_v1';

const UPDATES = [
  {
    icon: '🎁',
    text: 'Try UCAT Genius Premium for free with a 3-day trial. No commitment or payment details required. Just give it a go!',
  },
  {
    icon: '🐛',
    text: 'Bug fixes and stability improvements',
  },
  {
    icon: '📚',
    text: 'Content updates and question fixes',
  },
];

export default function WhatsNewModal() {
  const { theme: t } = useTheme();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(WHATS_NEW_KEY).then((val) => {
      if (!val) setVisible(true);
    });
  }, []);

  function dismiss() {
    AsyncStorage.setItem(WHATS_NEW_KEY, 'true');
    setVisible(false);
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={dismiss}
    >
      <View style={styles.backdrop}>
        <View style={[styles.card, { backgroundColor: t.bgCard, borderColor: t.border }]}>
          <Text style={[styles.title, { color: t.text }]}>What's New 🚀</Text>
          <Text style={[styles.subtitle, { color: t.textSecondary }]}>
            Here's what we've been working on for you:
          </Text>

          <View style={styles.list}>
            {UPDATES.map((item, i) => (
              <View key={i} style={styles.row}>
                <Text style={styles.icon}>{item.icon}</Text>
                <Text style={[styles.itemText, { color: t.textSecondary }]}>{item.text}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: t.accent }]}
            onPress={dismiss}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Got it, let's go!</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
    gap: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  list: {
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  icon: {
    fontSize: 18,
    marginTop: 1,
  },
  itemText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 21,
  },
  button: {
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});

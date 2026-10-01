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
import { db } from '../lib/dbQueries';

const WHATS_NEW_SEEN_VERSION_KEY = 'whats_new_seen_version';

export default function WhatsNewModal() {
  const { theme: t } = useTheme();
  const [content, setContent] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [row, seenRaw] = await Promise.all([
          db.getWhatsNew(),
          AsyncStorage.getItem(WHATS_NEW_SEEN_VERSION_KEY),
        ]);
        if (cancelled || !row) return;
        const seenVersion = parseInt(seenRaw ?? '0', 10) || 0;
        if (row.version > seenVersion) {
          setContent(row);
          setVisible(true);
        }
      } catch {
        // Fail silent — no modal if content can't be fetched.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  function dismiss() {
    if (content) {
      AsyncStorage.setItem(WHATS_NEW_SEEN_VERSION_KEY, String(content.version));
    }
    setVisible(false);
  }

  if (!content) return null;

  const items = Array.isArray(content.items) ? content.items : [];

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
          <Text style={[styles.title, { color: t.text }]}>{content.title}</Text>
          <Text style={[styles.subtitle, { color: t.textSecondary }]}>
            {content.subtitle}
          </Text>

          <View style={styles.list}>
            {items.map((item, i) => (
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

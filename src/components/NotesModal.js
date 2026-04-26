import { useEffect, useRef, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import { getPremiumTheme, hexToRgba } from '../theme/premiumTheme';
import PremiumIcon from './premium/PremiumIcon';

const STORAGE_PREFIX = '@ucat:notes:';
const VALID_SECTIONS = ['vr', 'qr', 'dm', 'sj'];

function storageKeyFor(sectionKey) {
  return `${STORAGE_PREFIX}${sectionKey}`;
}

const SECTION_META = {
  vr: { title: 'Verbal Reasoning', accentKey: 'blue' },
  dm: { title: 'Decision Making', accentKey: 'teal' },
  qr: { title: 'Quantitative Reasoning', accentKey: 'purple' },
  sj: { title: 'Situational Judgement', accentKey: 'mint' },
};

export default function NotesModal({ visible, sectionKey, onClose }) {
  const { isDark } = useTheme();
  const premium = getPremiumTheme(isDark);
  const c = premium.colors;

  const safeSection = VALID_SECTIONS.includes(sectionKey) ? sectionKey : 'vr';
  const meta = SECTION_META[safeSection];
  const accent = c[meta.accentKey] ?? c.blue;

  const [notes, setNotes] = useState('');
  const [loaded, setLoaded] = useState(false);
  const saveTimer = useRef(null);

  useEffect(() => {
    let cancelled = false;
    setLoaded(false);
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(storageKeyFor(safeSection));
        if (!cancelled) {
          setNotes(stored ?? '');
          setLoaded(true);
        }
      } catch {
        if (!cancelled) setLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [safeSection]);

  useEffect(() => {
    if (!loaded) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      AsyncStorage.setItem(storageKeyFor(safeSection), notes).catch(() => {});
    }, 250);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [notes, loaded, safeSection]);

  const flushSave = async () => {
    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
      saveTimer.current = null;
    }
    if (!loaded) return;
    try {
      await AsyncStorage.setItem(storageKeyFor(safeSection), notes);
    } catch {}
  };

  const handleClose = async () => {
    await flushSave();
    onClose?.();
  };

  const handleClear = () => setNotes('');

  const cardGradient = isDark
    ? ['rgba(18, 35, 64, 0.98)', 'rgba(8, 22, 43, 0.98)', 'rgba(4, 10, 23, 1)']
    : ['#FFFFFF', '#F7FAFF', '#EEF5FF'];

  const inputBg = isDark ? hexToRgba('#0a1830', 0.85) : '#FFFFFF';
  const accentGlow = hexToRgba(accent, isDark ? 0.18 : 0.12);

  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent onRequestClose={handleClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable style={styles.backdrop} onPress={handleClose} />

        <View style={styles.cardWrapper}>
          <LinearGradient
            colors={cardGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.card, { borderColor: c.border, shadowColor: accent }]}
          >
            <Pressable
              onPress={handleClose}
              hitSlop={16}
              style={styles.handleHit}
              accessibilityRole="button"
              accessibilityLabel="Close notes"
            >
              <View style={[styles.handle, { backgroundColor: isDark ? hexToRgba('#ffffff', 0.28) : hexToRgba('#0F172A', 0.28) }]} />
            </Pressable>

            <View style={[styles.accentStripe, { backgroundColor: accent, shadowColor: accent }]} />

            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <View style={[styles.iconBox, { backgroundColor: accentGlow, borderColor: hexToRgba(accent, 0.45) }]}>
                  <PremiumIcon name="notes" size={18} color="#FFFFFF" />
                </View>
                <View style={styles.titleBlock}>
                  <Text style={[styles.title, { color: c.text }]}>Notes</Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={handleClose}
                activeOpacity={0.75}
                style={[styles.closeIconBtn, { borderColor: c.border, backgroundColor: isDark ? hexToRgba('#ffffff', 0.04) : hexToRgba('#0F172A', 0.04) }]}
                accessibilityLabel="Close notes"
              >
                <PremiumIcon name="x" size={16} color={c.textSecondary} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: inputBg,
                  color: c.text,
                  borderColor: c.border,
                },
              ]}
              value={notes}
              onChangeText={setNotes}
              placeholder={`Notes...`}
              placeholderTextColor={c.textMuted}
              multiline
              textAlignVertical="top"
              autoFocus
            />

            <View style={styles.footer}>
              <TouchableOpacity
                onPress={handleClear}
                activeOpacity={0.75}
                style={[styles.clearBtn, { borderColor: hexToRgba(c.red, 0.45), backgroundColor: hexToRgba(c.red, isDark ? 0.1 : 0.06) }]}
              >
                <Text style={[styles.clearText, { color: c.red }]}>Clear notes</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(2, 6, 15, 0.6)',
  },
  cardWrapper: {
    width: '100%',
  },
  card: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    paddingTop: 10,
    paddingHorizontal: 18,
    paddingBottom: 28,
    height: '78%',
    overflow: 'hidden',
    shadowOpacity: 0.35,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: -6 },
  },
  handleHit: {
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 24,
  },
  handle: {
    width: 44,
    height: 5,
    borderRadius: 999,
  },
  accentStripe: {
    position: 'absolute',
    top: 0,
    left: 24,
    right: 24,
    height: 2,
    borderRadius: 2,
    opacity: 0.85,
    shadowOpacity: 0.6,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
    marginBottom: 14,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
    gap: 12,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleBlock: {
    flexShrink: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: '500',
  },
  closeIconBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    fontSize: 15,
    lineHeight: 22,
    minHeight: 200,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  footerHint: {
    fontSize: 12,
    fontWeight: '500',
  },
  clearBtn: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  clearText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});

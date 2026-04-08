import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function BottomToolbar({ onNotes, onCalculator, onPause, onNavigator, sectionColor }) {
  const { practiceTheme: t } = useTheme();
  const fg = '#ffffff';

  return (
    <View style={[styles.bar, { backgroundColor: t.headerBg, borderColor: t.headerBg }]}>
      {onPause && (
        <TouchableOpacity
          style={[styles.button, { borderColor: fg }]}
          onPress={onPause}
          activeOpacity={0.8}
        >
          <Text style={[styles.buttonText, { color: fg }]}>⏸ Pause</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={[styles.button, { borderColor: fg }]}
        onPress={onNotes}
        activeOpacity={0.8}
      >
        <Text style={[styles.buttonText, { color: fg }]}>✎ Notes</Text>
      </TouchableOpacity>

      {onCalculator && (
        <TouchableOpacity
          style={[styles.button, { borderColor: fg }]}
          onPress={onCalculator}
          activeOpacity={0.8}
        >
          <Text style={[styles.buttonText, { color: fg }]}>⊞ Calc</Text>
        </TouchableOpacity>
      )}

      {onNavigator && (
        <TouchableOpacity
          style={[styles.button, { borderColor: fg }]}
          onPress={onNavigator}
          activeOpacity={0.8}
        >
          <Text style={[styles.buttonText, { color: fg }]}>☰ Navigator</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
  },
  button: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  buttonText: {
    fontSize: 12,
    fontWeight: '700',
  },
});

import { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

function formatResult(val) {
  if (!isFinite(val) || isNaN(val)) return 'Error';
  return String(parseFloat(val.toPrecision(12)));
}

function compute(a, b, op) {
  switch (op) {
    case '+': return a + b;
    case '−': return a - b;
    case '×': return a * b;
    case '÷': return b !== 0 ? a / b : Infinity;
    default: return b;
  }
}

const GAP = 8;

function Btn({ label, onPress, type, style, t }) {
  const bg = type === 'red' || type === 'equals' ? '#b91c1c'
    : type === 'mem' ? t.accentDim
    : t.bgInput;
  const border = type === 'red' || type === 'equals' ? '#991b1b'
    : type === 'mem' ? t.accent
    : t.borderStrong;
  const textColor = type === 'red' || type === 'equals' ? '#ffffff' : t.text;
  const fontSize = type === 'red' || type === 'equals' ? 24 : 18;
  const fontWeight = type === 'red' || type === 'equals' ? '700' : '500';

  return (
    <TouchableOpacity
      style={[styles.btn, { backgroundColor: bg, borderColor: border }, style]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <Text style={[styles.btnText, { color: textColor, fontSize, fontWeight }]}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function CalculatorModal({ visible, onClose }) {
  const { practiceTheme: t } = useTheme();
  const [display, setDisplay] = useState('0');
  const [prevValue, setPrevValue] = useState(null);
  const [operator, setOperator] = useState(null);
  const [memory, setMemory] = useState(0);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [expression, setExpression] = useState('');

  function inputDigit(digit) {
    if (waitingForOperand) {
      setDisplay(String(digit));
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? String(digit) : display + digit);
    }
  }

  function inputDecimal() {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
      return;
    }
    if (!display.includes('.')) setDisplay(display + '.');
  }

  function handleOperator(op) {
    const current = parseFloat(display);
    if (operator && !waitingForOperand) {
      const result = compute(prevValue, current, operator);
      const resultStr = formatResult(result);
      setDisplay(resultStr);
      setPrevValue(parseFloat(resultStr));
      setExpression(`${resultStr} ${op}`);
    } else {
      setPrevValue(current);
      setExpression(`${display} ${op}`);
    }
    setOperator(op);
    setWaitingForOperand(true);
  }

  function handleEquals() {
    if (operator === null || prevValue === null) return;
    const current = parseFloat(display);
    const result = compute(prevValue, current, operator);
    const resultStr = formatResult(result);
    setExpression(`${prevValue} ${operator} ${display} =`);
    setDisplay(resultStr);
    setPrevValue(null);
    setOperator(null);
    setWaitingForOperand(true);
  }

  function handleOnC() {
    setDisplay('0');
    setPrevValue(null);
    setOperator(null);
    setWaitingForOperand(false);
    setExpression('');
  }

  function handleToggleSign() {
    const val = parseFloat(display);
    if (val !== 0) setDisplay(formatResult(-val));
  }

  function handlePercent() {
    setDisplay(formatResult(parseFloat(display) / 100));
    setWaitingForOperand(true);
  }

  function handleSqrt() {
    setDisplay(formatResult(Math.sqrt(parseFloat(display))));
    setWaitingForOperand(true);
  }

  function handleMRC() {
    setDisplay(formatResult(memory));
    setWaitingForOperand(true);
  }

  function handleMPlus() { setMemory(memory + parseFloat(display)); }
  function handleMMinus() { setMemory(memory - parseFloat(display)); }

  const b = (props) => <Btn {...props} t={t} />;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: t.bgCard, borderTopColor: t.borderStrong }]}>

          <View style={styles.header}>
            <Text style={[styles.headerTitle, { color: t.textSecondary }]}>Calculator</Text>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.closeBtn, { backgroundColor: t.bgInput }]}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={[styles.closeText, { color: t.textSecondary }]}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.display, { backgroundColor: t.bg, borderColor: t.borderStrong }]}>
            <Text style={[styles.expressionText, { color: t.textMuted }]} numberOfLines={1}>{expression}</Text>
            <Text style={[styles.displayText, { color: t.text }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.4}>
              {display}
            </Text>
          </View>

          <View style={styles.grid}>
            <View style={styles.row}>
              {b({ label: '+/−', onPress: handleToggleSign, type: 'red' })}
              {b({ label: '√',   onPress: handleSqrt,       type: 'red' })}
              {b({ label: '%',   onPress: handlePercent,     type: 'red' })}
              {b({ label: '÷',   onPress: () => handleOperator('÷'), type: 'red' })}
            </View>
            <View style={styles.row}>
              {b({ label: 'MRC', onPress: handleMRC,    type: 'mem' })}
              {b({ label: 'M−',  onPress: handleMMinus, type: 'mem' })}
              {b({ label: 'M+',  onPress: handleMPlus,  type: 'mem' })}
              {b({ label: '×',   onPress: () => handleOperator('×'), type: 'red' })}
            </View>
            <View style={styles.row}>
              {b({ label: '7', onPress: () => inputDigit('7') })}
              {b({ label: '8', onPress: () => inputDigit('8') })}
              {b({ label: '9', onPress: () => inputDigit('9') })}
              {b({ label: '−', onPress: () => handleOperator('−'), type: 'red' })}
            </View>
            <View style={styles.row}>
              {b({ label: '4', onPress: () => inputDigit('4') })}
              {b({ label: '5', onPress: () => inputDigit('5') })}
              {b({ label: '6', onPress: () => inputDigit('6') })}
              {b({ label: '+', onPress: () => handleOperator('+'), type: 'red' })}
            </View>
            <View style={[styles.row, { alignItems: 'stretch' }]}>
              <View style={styles.tallLeft}>
                <View style={styles.row}>
                  {b({ label: '1', onPress: () => inputDigit('1') })}
                  {b({ label: '2', onPress: () => inputDigit('2') })}
                  {b({ label: '3', onPress: () => inputDigit('3') })}
                </View>
                <View style={styles.row}>
                  {b({ label: 'ON/C', onPress: handleOnC, type: 'red' })}
                  {b({ label: '0',    onPress: () => inputDigit('0') })}
                  {b({ label: '.',    onPress: inputDecimal })}
                </View>
              </View>
              {b({ label: '=', onPress: handleEquals, type: 'equals', style: styles.btnTallEquals })}
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  container: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 32,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  headerTitle: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  closeBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  closeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  display: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 14,
    alignItems: 'flex-end',
    minHeight: 68,
    justifyContent: 'flex-end',
    borderWidth: 1,
  },
  expressionText: {
    fontSize: 12,
    marginBottom: 4,
  },
  displayText: {
    fontSize: 36,
    fontWeight: '300',
  },
  grid: {
    gap: GAP,
  },
  row: {
    flexDirection: 'row',
    gap: GAP,
  },
  tallLeft: {
    flex: 3,
    gap: GAP,
  },
  btn: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  btnTallEquals: {
    flex: 1,
    alignSelf: 'stretch',
    paddingVertical: 0,
  },
  btnText: {},
});

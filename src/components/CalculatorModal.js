import { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

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

function Btn({ label, onPress, type, style }) {
  return (
    <TouchableOpacity
      style={[
        styles.btn,
        type === 'red' && styles.btnRed,
        type === 'equals' && styles.btnEquals,
        type === 'mem' && styles.btnMem,
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <Text style={[
        styles.btnText,
        (type === 'red' || type === 'equals') && styles.btnTextLight,
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export default function CalculatorModal({ visible, onClose }) {
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

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>

          <View style={styles.header}>
            <Text style={styles.headerTitle}>Calculator</Text>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Display */}
          <View style={styles.display}>
            <Text style={styles.expressionText} numberOfLines={1}>{expression}</Text>
            <Text style={styles.displayText} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.4}>
              {display}
            </Text>
          </View>

          {/* Buttons */}
          <View style={styles.grid}>

            {/* Row 1 */}
            <View style={styles.row}>
              <Btn label="+/−" onPress={handleToggleSign} type="red" />
              <Btn label="√"   onPress={handleSqrt}       type="red" />
              <Btn label="%"   onPress={handlePercent}     type="red" />
              <Btn label="÷"   onPress={() => handleOperator('÷')} type="red" />
            </View>

            {/* Row 2 */}
            <View style={styles.row}>
              <Btn label="MRC" onPress={handleMRC}    type="mem" />
              <Btn label="M−"  onPress={handleMMinus} type="mem" />
              <Btn label="M+"  onPress={handleMPlus}  type="mem" />
              <Btn label="×"   onPress={() => handleOperator('×')} type="red" />
            </View>

            {/* Row 3 */}
            <View style={styles.row}>
              <Btn label="7" onPress={() => inputDigit('7')} />
              <Btn label="8" onPress={() => inputDigit('8')} />
              <Btn label="9" onPress={() => inputDigit('9')} />
              <Btn label="−" onPress={() => handleOperator('−')} type="red" />
            </View>

            {/* Row 4 */}
            <View style={styles.row}>
              <Btn label="4" onPress={() => inputDigit('4')} />
              <Btn label="5" onPress={() => inputDigit('5')} />
              <Btn label="6" onPress={() => inputDigit('6')} />
              <Btn label="+" onPress={() => handleOperator('+')} type="red" />
            </View>

            {/* Rows 5+6 — tall = button */}
            <View style={[styles.row, { alignItems: 'stretch' }]}>
              {/* Left 3 columns */}
              <View style={styles.tallLeft}>
                <View style={styles.row}>
                  <Btn label="1" onPress={() => inputDigit('1')} />
                  <Btn label="2" onPress={() => inputDigit('2')} />
                  <Btn label="3" onPress={() => inputDigit('3')} />
                </View>
                <View style={styles.row}>
                  <Btn label="ON/C" onPress={handleOnC} type="red" />
                  <Btn label="0"    onPress={() => inputDigit('0')} />
                  <Btn label="."    onPress={inputDecimal} />
                </View>
              </View>

              {/* Tall = */}
              <Btn label="=" onPress={handleEquals} type="equals" style={styles.btnTallEquals} />
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
    backgroundColor: '#16213e',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 32,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#2d3748',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  headerTitle: {
    color: '#a0aec0',
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
    backgroundColor: '#2d3748',
    borderRadius: 16,
  },
  closeText: {
    color: '#a0aec0',
    fontSize: 13,
    fontWeight: '700',
  },
  display: {
    backgroundColor: '#0d1117',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 14,
    alignItems: 'flex-end',
    minHeight: 68,
    justifyContent: 'flex-end',
    borderWidth: 1,
    borderColor: '#2d3748',
  },
  expressionText: {
    color: '#4a5568',
    fontSize: 12,
    marginBottom: 4,
  },
  displayText: {
    color: '#ffffff',
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
    backgroundColor: '#1e2a45',
    borderRadius: 10,
    paddingVertical: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#2d3748',
  },
  btnRed: {
    backgroundColor: '#b91c1c',
    borderColor: '#991b1b',
  },
  btnMem: {
    backgroundColor: '#1e3a5f',
    borderColor: '#2d4a6f',
  },
  btnEquals: {
    backgroundColor: '#b91c1c',
    borderColor: '#991b1b',
    borderRadius: 10,
  },
  btnTallEquals: {
    flex: 1,
    alignSelf: 'stretch',
    paddingVertical: 0,
  },
  btnText: {
    color: '#e2e8f0',
    fontSize: 18,
    fontWeight: '500',
  },
  btnTextLight: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '700',
  },
});

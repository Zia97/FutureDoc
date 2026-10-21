// Keep alert requests independent of screens so navigation and nested
// confirmations cannot unmount a pending dialog or replace its callbacks.
export function createAppAlertStore() {
  let nextId = 0;
  const queue = [], listeners = new Set();
  const notify = () => listeners.forEach((listener) => listener());
  const getSnapshot = () => queue[0] ?? null;
  const subscribe = (listener) => { listeners.add(listener); return () => listeners.delete(listener); };

  function alert(title, message, buttons, options = {}) {
    queue.push({ id: ++nextId, title: title ?? '', message: message ?? '',
      buttons: buttons ?? [{ text: 'OK' }], cancelable: options.cancelable === true,
      onDismiss: options.onDismiss });
    notify();
  }

  function press(id, index) {
    const current = getSnapshot();
    const button = current?.buttons[index];
    if (current?.id !== id || !button) return;
    queue.shift();
    notify();
    return button.onPress?.();
  }

  function dismiss(id) {
    const current = getSnapshot();
    if (!current || current.id !== id || !current.cancelable) return;
    queue.shift();
    notify();
    current.onDismiss?.();
  }

  return { alert, getSnapshot, subscribe, press, dismiss };
}

const AppAlert = createAppAlertStore();
export default AppAlert;

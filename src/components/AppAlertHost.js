import React, { useSyncExternalStore } from 'react';
import AppAlert from '../services/appAlert';
import AppDialog from './AppDialog';

export default function AppAlertHost() {
  const current = useSyncExternalStore(AppAlert.subscribe, AppAlert.getSnapshot, AppAlert.getSnapshot);
  return <AppDialog visible={!!current} title={current?.title} message={current?.message}
    buttons={current?.buttons} cancelable={current?.cancelable ?? false}
    onClose={() => AppAlert.dismiss(current?.id)} onAction={(index) => AppAlert.press(current?.id, index)} />;
}

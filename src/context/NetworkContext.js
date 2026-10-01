import React, { createContext, useContext, useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';

// ============================================================
// Single source of truth for connectivity state.
//
// `isInternetReachable` is the authoritative signal — it does a
// real reachability probe and so detects captive portals and dead
// networks where `isConnected` would otherwise be true. It can be
// `null` briefly at startup before the first probe completes; we
// fall back to `isConnected` in that window so we don't show a
// stale "offline" banner on a freshly-launched app.
// ============================================================

const NetworkContext = createContext({
  isConnected: true,
  isInternetReachable: true,
  isOnline: true,
});

let latestIsOnline = true;

// Synchronous read for non-React call sites (services, queues).
// Reflects the most recent NetInfo event seen by the provider.
export function getIsOnline() {
  return latestIsOnline;
}

function deriveIsOnline(state) {
  if (state == null) return true; // assume online before first event
  if (state.isInternetReachable === false) return false;
  if (state.isConnected === false) return false;
  return true;
}

export function NetworkProvider({ children }) {
  const [state, setState] = useState({
    isConnected: true,
    isInternetReachable: true,
    isOnline: true,
  });

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((s) => {
      const isOnline = deriveIsOnline(s);
      latestIsOnline = isOnline;
      setState({
        isConnected: s.isConnected !== false,
        isInternetReachable: s.isInternetReachable,
        isOnline,
      });
    });

    NetInfo.fetch().then((s) => {
      const isOnline = deriveIsOnline(s);
      latestIsOnline = isOnline;
      setState({
        isConnected: s.isConnected !== false,
        isInternetReachable: s.isInternetReachable,
        isOnline,
      });
    });

    return () => unsubscribe();
  }, []);

  return (
    <NetworkContext.Provider value={state}>
      {children}
    </NetworkContext.Provider>
  );
}

export function useNetwork() {
  return useContext(NetworkContext);
}

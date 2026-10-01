import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'text_size_preference';

// Patch Text.render once so every <Text> in the app picks up the current
// multiplier. The multiplier is read from a ref updated by TextSizeProvider.
const multiplierRef = { current: 1 };
if (!Text.__textSizePatched && typeof Text.render === 'function') {
  const originalRender = Text.render;
  Text.render = function patchedRender(...args) {
    const origin = originalRender.apply(this, args);
    const m = multiplierRef.current;
    if (!origin || m === 1) return origin;
    const scaleStyle = (s) => {
      if (!s) return s;
      if (Array.isArray(s)) return s.map(scaleStyle);
      if (typeof s !== 'object') return s;
      const out = { ...s };
      if (typeof s.fontSize === 'number') out.fontSize = s.fontSize * m;
      if (typeof s.lineHeight === 'number') out.lineHeight = s.lineHeight * m;
      return out;
    };
    return React.cloneElement(origin, { style: scaleStyle(origin.props.style) });
  };
  Text.__textSizePatched = true;
}

export const TEXT_SIZE_OPTIONS = [
  { id: 'default', label: 'Default', multiplier: 1.0 },
  { id: 'large', label: 'Large', multiplier: 1.15 },
];

const DEFAULT_ID = 'default';

const TextSizeContext = createContext(null);

export function TextSizeProvider({ children }) {
  const [sizeId, setSizeId] = useState(DEFAULT_ID);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((val) => {
      if (val && TEXT_SIZE_OPTIONS.some((o) => o.id === val)) {
        setSizeId(val);
      }
    });
  }, []);

  const value = useMemo(() => {
    const option = TEXT_SIZE_OPTIONS.find((o) => o.id === sizeId) ?? TEXT_SIZE_OPTIONS[0];
    const multiplier = option.multiplier;
    multiplierRef.current = multiplier;
    // Conservative multiplier for SVG text (chart axis labels, diagram labels, table cells)
    // so they grow but don't break tight layouts.
    const svgMultiplier = 1 + (multiplier - 1) * 0.66;
    return {
      sizeId,
      multiplier,
      svgMultiplier,
      setSize: (next) => {
        setSizeId(next);
        AsyncStorage.setItem(STORAGE_KEY, next);
      },
      scale: (n) => Math.round(n * multiplier),
      scaleSvg: (n) => Math.round(n * svgMultiplier),
      scaleStyle: (style) => {
        if (!style) return style;
        const out = { ...style };
        if (typeof style.fontSize === 'number') out.fontSize = Math.round(style.fontSize * multiplier);
        if (typeof style.lineHeight === 'number') out.lineHeight = Math.round(style.lineHeight * multiplier);
        return out;
      },
    };
  }, [sizeId]);

  // Remount the tree on size changes so every <Text> re-renders through the
  // patched render path (otherwise screens that don't subscribe to this
  // context wouldn't pick up the new multiplier until they re-render).
  return (
    <TextSizeContext.Provider value={value}>
      <React.Fragment key={sizeId}>{children}</React.Fragment>
    </TextSizeContext.Provider>
  );
}

export function useTextSize() {
  const ctx = useContext(TextSizeContext);
  if (!ctx) {
    return {
      sizeId: DEFAULT_ID,
      multiplier: 1,
      svgMultiplier: 1,
      setSize: () => {},
      scale: (n) => n,
      scaleSvg: (n) => n,
      scaleStyle: (s) => s,
    };
  }
  return ctx;
}

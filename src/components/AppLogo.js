import React from 'react';
import { Image, Platform, StyleSheet, View } from 'react-native';

import { premiumColors } from '../theme/premiumTheme';

export const APP_LOGO = require('../../assets/icon.png');

export default function AppLogo({
  size = 48,
  radius,
  style,
  frameStyle,
  imageStyle,
  shadowColor = premiumColors.blue,
  borderColor = 'rgba(255, 255, 255, 0.18)',
  shadow = true,
  accessibilityLabel = 'UCAT Genius logo',
}) {
  const cornerRadius = radius ?? Math.max(12, Math.round(size * 0.24));

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel}
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: cornerRadius,
          shadowColor,
        },
        !shadow && styles.noShadow,
        style,
      ]}
    >
      <View
        style={[
          styles.frame,
          {
            borderRadius: cornerRadius,
            borderColor,
          },
          frameStyle,
        ]}
      >
        <Image
          accessibilityIgnoresInvertColors
          source={APP_LOGO}
          style={[styles.image, imageStyle]}
          resizeMode="cover"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'visible',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: Platform.OS === 'ios' ? 0.2 : 0,
    shadowRadius: 16,
  },
  noShadow: {
    shadowOpacity: 0,
    shadowRadius: 0,
  },
  frame: {
    flex: 1,
    overflow: 'hidden',
    borderWidth: 1,
    backgroundColor: '#1A1A3F',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});

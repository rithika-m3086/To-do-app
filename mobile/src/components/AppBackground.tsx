import React, { ReactNode } from 'react';
import { View, Image, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface AppBackgroundProps {
  children: ReactNode;
  style?: ViewStyle;
}

export const AppBackground: React.FC<AppBackgroundProps> = ({ children, style }) => {
  const { isDark } = useTheme();

  if (isDark) {
    return (
      <View style={[styles.darkContainer, style]}>
        {children}
      </View>
    );
  }

  return (
    <View style={[styles.lightContainer, style]}>
      <Image
        source={require('../assets/download.jpg')}
        style={styles.gradientOverlay}
        resizeMode="cover"
      />
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  lightContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  darkContainer: {
    flex: 1,
    backgroundColor: '#000000', // Pure pitch-black dark mode
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    opacity: 0.18, // Soft translucent backdrop gradient tint
  },
});

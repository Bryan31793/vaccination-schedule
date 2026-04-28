import React, { ReactNode } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme';

interface ScreenWrapperProps {
  children: ReactNode;
  gradient?: boolean;
  gradientColors?: readonly [string, string, ...string[]];
}

export const ScreenWrapper: React.FC<ScreenWrapperProps> = ({
  children,
  gradient = true,
  gradientColors,
}) => {
  const bgColors = gradientColors ?? ['#F0F6FF', '#E8F4FD', '#FFFFFF'];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      {gradient ? (
        <LinearGradient
          colors={bgColors as unknown as [string, string, ...string[]]}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
            {children}
          </SafeAreaView>
        </LinearGradient>
      ) : (
        <SafeAreaView style={[styles.safeArea, styles.plainBg]} edges={['top', 'left', 'right']}>
          {children}
        </SafeAreaView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  plainBg: {
    backgroundColor: colors.background.primary,
  },
});

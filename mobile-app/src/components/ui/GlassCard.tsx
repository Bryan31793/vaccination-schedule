import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, borderRadius, shadows } from '../../theme';

interface GlassCardProps {
  children: ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'elevated' | 'outlined';
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  variant = 'default',
}) => {
  return (
    <View style={[styles.card, variantStyles[variant], style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.lg,
    padding: 16,
    marginVertical: 6,
  },
});

const variantStyles = StyleSheet.create({
  default: {
    backgroundColor: colors.background.card,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    ...shadows.md,
  },
  elevated: {
    backgroundColor: colors.neutral[0],
    ...shadows.lg,
  },
  outlined: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.primary[200],
  },
});

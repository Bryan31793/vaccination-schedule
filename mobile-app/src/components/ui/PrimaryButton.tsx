import React, { useCallback } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, borderRadius, shadows, typography } from '../../theme';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  icon?: React.ReactNode;
  style?: ViewStyle;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  size = 'medium',
  icon,
  style,
}) => {
  const isDisabled = disabled || loading;

  const sizeStyle = sizeStyles[size];
  const textStyle = textSizeStyles[size];

  if (variant === 'primary') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.8}
        style={[{ opacity: isDisabled ? 0.5 : 1 }, style]}
      >
        <LinearGradient
          colors={colors.gradients.primary as unknown as [string, string]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.base, sizeStyle, shadows.md]}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" size="small" />
          ) : (
            <>
              {icon && <>{icon}</>}
              <Text style={[styles.textPrimary, textStyle]}>{title}</Text>
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
      style={[
        styles.base,
        sizeStyle,
        variantStyles[variant],
        isDisabled && { opacity: 0.5 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'danger' ? colors.status.error : colors.primary[500]}
          size="small"
        />
      ) : (
        <>
          {icon && <>{icon}</>}
          <Text style={[variantTextStyles[variant], textStyle]}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
    gap: 8,
  },
  textPrimary: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});

const sizeStyles = StyleSheet.create({
  small: { paddingVertical: 8, paddingHorizontal: 16 },
  medium: { paddingVertical: 14, paddingHorizontal: 24 },
  large: { paddingVertical: 18, paddingHorizontal: 32 },
});

const textSizeStyles = StyleSheet.create({
  small: { fontSize: 13, fontWeight: '600' },
  medium: { fontSize: 15, fontWeight: '600' },
  large: { fontSize: 17, fontWeight: '700' },
});

const variantStyles = StyleSheet.create({
  secondary: {
    backgroundColor: colors.primary[50],
    borderWidth: 1.5,
    borderColor: colors.primary[200],
  },
  danger: {
    backgroundColor: colors.status.errorBg,
    borderWidth: 1.5,
    borderColor: colors.status.error,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
});

const variantTextStyles = StyleSheet.create({
  secondary: { color: colors.primary[600], fontWeight: '600' },
  danger: { color: colors.status.error, fontWeight: '600' },
  ghost: { color: colors.primary[500], fontWeight: '600' },
});

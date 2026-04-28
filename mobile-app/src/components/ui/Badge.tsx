import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, borderRadius } from '../../theme';
import { NivelAlerta, EstadoRegistro } from '../../types';

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: 'small' | 'medium';
  style?: ViewStyle;
}

const variantColors: Record<BadgeVariant, { bg: string; text: string }> = {
  success: { bg: colors.status.successBg, text: colors.status.success },
  warning: { bg: colors.status.warningBg, text: colors.status.warning },
  error: { bg: colors.status.errorBg, text: colors.status.error },
  info: { bg: colors.status.infoBg, text: colors.status.info },
  neutral: { bg: colors.neutral[100], text: colors.neutral[500] },
};

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'neutral',
  size = 'small',
  style,
}) => {
  const colorSet = variantColors[variant];
  const isSmall = size === 'small';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: colorSet.bg,
          paddingVertical: isSmall ? 3 : 5,
          paddingHorizontal: isSmall ? 8 : 12,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: colorSet.text,
            fontSize: isSmall ? 11 : 13,
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

// ── Helpers para mapear enums del backend a variantes de badge ──────

export const getBadgeVariantForEstado = (estado: EstadoRegistro): BadgeVariant => {
  switch (estado) {
    case EstadoRegistro.APLICADA:
      return 'success';
    case EstadoRegistro.PENDIENTE:
      return 'warning';
    case EstadoRegistro.CANCELADA:
      return 'error';
    default:
      return 'neutral';
  }
};

export const getBadgeVariantForAlerta = (nivel: NivelAlerta): BadgeVariant => {
  switch (nivel) {
    case NivelAlerta.CRITICO:
      return 'error';
    case NivelAlerta.MODERADO:
      return 'warning';
    case NivelAlerta.INFORMATIVO:
      return 'info';
    default:
      return 'neutral';
  }
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});

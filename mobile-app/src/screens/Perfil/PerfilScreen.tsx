import React, { useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Alert, Animated, ScrollView, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useMedicoAuth } from '../../context/MedicoAuthContext';
import { colors, typography, borderRadius, shadows } from '../../theme';
import { ScreenWrapper } from '../../components/ui';
import type { PerfilScreenProps } from '../../navigation/types';

const ROL_CONFIG: Record<string, { label: string; icon: keyof typeof Ionicons.glyphMap; color: string; bg: string }> = {
  ADMIN:     { label: 'Administrador', icon: 'settings',  color: colors.accent.purple,      bg: '#F3F0FF' },
  MEDICO:    { label: 'Médico',        icon: 'medical',   color: colors.primary[600],        bg: colors.primary[50] },
  ENFERMERO: { label: 'Enfermero/a',  icon: 'bandage',   color: colors.secondary[600],      bg: colors.secondary[50] },
};

const getInitials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('');

export const PerfilScreen: React.FC<PerfilScreenProps> = () => {
  const { user, logout } = useMedicoAuth();

  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 450, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 450, useNativeDriver: true }),
    ]).start();
  }, []);

  if (!user) return null;

  const rolCfg = ROL_CONFIG[user.rol] ?? ROL_CONFIG['MEDICO'];
  const initials = getInitials(user.nombreCompleto);
  const firstName = user.nombreCompleto.split(' ')[0];

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      if (window.confirm(`¿Deseas cerrar la sesión de ${firstName}?`)) {
        logout();
      }
      return;
    }
    Alert.alert(
      'Cerrar sesión',
      `¿Deseas cerrar la sesión de ${firstName}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Cerrar sesión', style: 'destructive', onPress: logout },
      ],
    );
  };

  return (
    <ScreenWrapper>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View style={[styles.hero, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <LinearGradient
            colors={[colors.primary[400], colors.primary[700]] as [string, string]}
            style={styles.avatar}
          >
            <Text style={styles.initials}>{initials}</Text>
          </LinearGradient>

          <Text style={styles.name}>{user.nombreCompleto}</Text>

          <View style={[styles.rolBadge, { backgroundColor: rolCfg.bg }]}>
            <Ionicons name={rolCfg.icon} size={13} color={rolCfg.color} />
            <Text style={[styles.rolLabel, { color: rolCfg.color }]}>{rolCfg.label}</Text>
          </View>
        </Animated.View>

        {/* Info card */}
        <Animated.View style={[styles.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.cardTitle}>Información de cuenta</Text>

          <InfoRow
            icon="person-outline"
            label="Nombre completo"
            value={user.nombreCompleto}
          />
          <InfoRow
            icon="card-outline"
            label="Cédula Profesional (SEP)"
            value={user.cedulaProfesional}
            mono
          />
          <InfoRow
            icon={rolCfg.icon}
            label="Rol en el sistema"
            value={rolCfg.label}
            valueColor={rolCfg.color}
            last
          />
        </Animated.View>

        {/* Security card */}
        <Animated.View style={[styles.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.cardTitle}>Seguridad</Text>
          <InfoRow
            icon="shield-checkmark-outline"
            label="Autenticación"
            value="JWT — activa"
            valueColor={colors.status.success}
            last
          />
        </Animated.View>

        {/* Logout */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
            <Ionicons name="log-out-outline" size={20} color={colors.status.error} />
            <Text style={styles.logoutText}>Cerrar sesión</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </ScreenWrapper>
  );
};

const InfoRow = ({
  icon, label, value, mono = false, valueColor, last = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  mono?: boolean;
  valueColor?: string;
  last?: boolean;
}) => (
  <View style={[rowStyles.row, !last && rowStyles.divider]}>
    <View style={rowStyles.iconWrap}>
      <Ionicons name={icon} size={16} color={colors.primary[500]} />
    </View>
    <View style={rowStyles.textWrap}>
      <Text style={rowStyles.label}>{label}</Text>
      <Text style={[rowStyles.value, mono && rowStyles.mono, valueColor ? { color: valueColor } : undefined]}>
        {value}
      </Text>
    </View>
  </View>
);

const rowStyles = StyleSheet.create({
  row:     { flexDirection: 'row', alignItems: 'center', paddingVertical: 14 },
  divider: { borderBottomWidth: 1, borderBottomColor: colors.neutral[100] },
  iconWrap: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: colors.primary[50],
    alignItems: 'center', justifyContent: 'center',
    marginRight: 14,
  },
  textWrap: { flex: 1 },
  label:   { ...typography.caption, color: colors.neutral[400], marginBottom: 2 },
  value:   { ...typography.body,    color: colors.neutral[800], fontWeight: '600' },
  mono:    { fontFamily: 'monospace', letterSpacing: 1 },
});

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20, paddingTop: 48, paddingBottom: 100 },

  hero: { alignItems: 'center', marginBottom: 28, gap: 10 },
  avatar: {
    width: 88, height: 88, borderRadius: 44,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 4,
    ...shadows.lg,
  },
  initials: { fontSize: 34, fontWeight: '800', color: '#FFF', letterSpacing: -1 },
  name:     { ...typography.h2, color: colors.neutral[900], textAlign: 'center' },

  rolBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: borderRadius.full,
  },
  rolLabel: { fontSize: 13, fontWeight: '700' },

  card: {
    backgroundColor: colors.neutral[0],
    borderRadius: borderRadius.xl,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 4,
    marginBottom: 16,
    ...shadows.sm,
  },
  cardTitle: {
    ...typography.caption,
    color: colors.neutral[400],
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 4,
  },

  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    paddingVertical: 16,
    borderRadius: borderRadius.xl,
    borderWidth: 1.5,
    borderColor: colors.status.error,
    backgroundColor: colors.status.errorBg,
    marginTop: 8,
  },
  logoutText: { fontSize: 15, fontWeight: '700', color: colors.status.error },
});

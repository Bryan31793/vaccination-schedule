import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { ScreenWrapper, GlassCard } from '../../components/ui';
import { colors, typography, borderRadius } from '../../theme';
import { dashboardApi } from '../../api/endpoints/dashboard';
import type { HomeScreenProps } from '../../navigation/types';

// ── Skeleton de una stat card ─────────────────────────────────────────────────
const StatSkeleton = () => (
  <View style={[styles.statCard, styles.skeleton]}>
    <View style={styles.skeletonCircle} />
    <View style={styles.skeletonValue} />
    <View style={styles.skeletonLabel} />
  </View>
);

// ── Stat card real ────────────────────────────────────────────────────────────
const StatCard = ({
  icon, label, value, color,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: number;
  color: string;
}) => (
  <GlassCard variant="elevated" style={styles.statCard}>
    <View style={[styles.iconCircle, { backgroundColor: color + '20' }]}>
      <Ionicons name={icon} size={24} color={color} />
    </View>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </GlassCard>
);

// ── QuickAction ───────────────────────────────────────────────────────────────
const QuickAction = ({
  icon, label, color, onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
  onPress: () => void;
}) => (
  <TouchableOpacity style={styles.quickAction} onPress={onPress} activeOpacity={0.7}>
    <View style={styles.quickActionLeft}>
      <View style={[styles.qaIcon, { backgroundColor: color + '18' }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={styles.quickActionLabel}>{label}</Text>
    </View>
    <Ionicons name="chevron-forward" size={18} color={colors.neutral[300]} />
  </TouchableOpacity>
);

// ── Pantalla principal ────────────────────────────────────────────────────────
export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['dashboard-resumen'],
    queryFn: dashboardApi.resumen,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

  return (
    <ScreenWrapper>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Bienvenido</Text>
            <Text style={styles.title}>Sistema de Vacunación</Text>
          </View>
          <TouchableOpacity
            style={styles.avatarCircle}
            onPress={() => navigation.navigate('Perfil')}
            activeOpacity={0.75}
          >
            <Ionicons name="person" size={22} color={colors.primary[500]} />
          </TouchableOpacity>
        </View>

        {/* Stats Grid */}
        <Text style={styles.sectionTitle}>Resumen General</Text>

        {isError ? (
          <TouchableOpacity style={styles.errorBox} onPress={() => refetch()}>
            <Ionicons name="cloud-offline-outline" size={20} color={colors.status.error} />
            <Text style={styles.errorText}>No se pudo cargar el resumen</Text>
            <Text style={styles.retryText}>Toca para reintentar</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.statsGrid}>
            {isLoading ? (
              <>
                <StatSkeleton />
                <StatSkeleton />
                <StatSkeleton />
                <StatSkeleton />
              </>
            ) : (
              <>
                <StatCard
                  icon="people"
                  label="Pacientes"
                  value={data!.totalPacientes}
                  color={colors.primary[500]}
                />
                <StatCard
                  icon="medkit"
                  label="Vacunas Hoy"
                  value={data!.vacunasAplicadasHoy}
                  color={colors.secondary[500]}
                />
                <StatCard
                  icon="warning"
                  label="Alertas"
                  value={data!.alertasActivas}
                  color={colors.accent.coral}
                />
                <StatCard
                  icon="shield-checkmark"
                  label="Catálogo"
                  value={data!.totalVacunas}
                  color={colors.accent.purple}
                />
              </>
            )}
          </View>
        )}

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
        <GlassCard variant="elevated">
          <QuickAction
            icon="person-add"
            label="Registrar Paciente"
            color={colors.primary[500]}
            onPress={() => navigation.navigate('Pacientes', { screen: 'RegistrarPaciente' })}
          />
          <View style={styles.divider} />
          <QuickAction
            icon="medkit"
            label="Aplicar Vacuna"
            color={colors.secondary[500]}
            onPress={() => navigation.navigate('Vacunar')}
          />
          <View style={styles.divider} />
          <QuickAction
            icon="chatbubble-ellipses"
            label="Consultar Asistente IA"
            color={colors.accent.purple}
            onPress={() => navigation.navigate('Chatbot')}
          />
        </GlassCard>
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content:   { padding: 20, paddingBottom: 100 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
  },
  greeting:     { ...typography.body, color: colors.neutral[500] },
  title:        { ...typography.h2, color: colors.neutral[900], marginTop: 2 },
  avatarCircle: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: colors.primary[50],
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: colors.primary[200],
  },

  sectionTitle: { ...typography.h4, marginBottom: 12, marginTop: 8 },

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    width: '47%',
    alignItems: 'center',
    paddingVertical: 20,
  },
  iconCircle: {
    width: 48, height: 48, borderRadius: 24,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 10,
  },
  statValue: { ...typography.h2, color: colors.neutral[800] },
  statLabel: { ...typography.caption, marginTop: 2 },

  // Skeleton
  skeleton: { backgroundColor: colors.neutral[100] },
  skeletonCircle: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: colors.neutral[200], marginBottom: 10,
  },
  skeletonValue: {
    width: 40, height: 24, borderRadius: 6,
    backgroundColor: colors.neutral[200], marginBottom: 6,
  },
  skeletonLabel: {
    width: 60, height: 12, borderRadius: 4,
    backgroundColor: colors.neutral[200],
  },

  // Error
  errorBox: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: colors.status.errorBg,
    borderRadius: borderRadius.lg,
    gap: 6,
    marginBottom: 12,
  },
  errorText: { ...typography.body, color: colors.status.error, fontWeight: '600' },
  retryText: { ...typography.caption, color: colors.status.error },

  // Quick actions
  quickAction: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  quickActionLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  qaIcon: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  quickActionLabel: { ...typography.body, color: colors.neutral[700], fontWeight: '500' },
  divider: { height: 1, backgroundColor: colors.neutral[100] },
});

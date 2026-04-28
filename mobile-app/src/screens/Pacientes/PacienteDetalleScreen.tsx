import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import {
  ScreenWrapper,
  GlassCard,
  Badge,
  getBadgeVariantForEstado,
} from '../../components/ui';
import { pacientesApi } from '../../api/endpoints/pacientes';
import { colors, typography, borderRadius, shadows } from '../../theme';
import type { PacienteDetalleScreenProps } from '../../navigation/types';

export const PacienteDetalleScreen: React.FC<PacienteDetalleScreenProps> = ({
  route,
}) => {
  const { curp } = route.params;

  const { data: historial, isLoading, isError } = useQuery({
    queryKey: ['historial', curp],
    queryFn: () => pacientesApi.historial(curp),
  });

  if (isLoading) {
    return (
      <ScreenWrapper>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
        </View>
      </ScreenWrapper>
    );
  }

  if (isError || !historial) {
    return (
      <ScreenWrapper>
        <View style={styles.center}>
          <Ionicons name="alert-circle" size={48} color={colors.neutral[300]} />
          <Text style={styles.errorText}>Error al cargar el historial</Text>
        </View>
      </ScreenWrapper>
    );
  }

  const { paciente, vacunasAplicadas, vacunasPendientes } = historial;

  return (
    <ScreenWrapper>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <GlassCard variant="elevated" style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatar}>
              <Ionicons
                name={paciente.sexo === 'M' ? 'woman' : 'man'}
                size={32}
                color={colors.primary[500]}
              />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{paciente.nombreCompleto}</Text>
              <Text style={styles.profileCurp}>{paciente.curp}</Text>
            </View>
          </View>
          <View style={styles.profileMeta}>
            <MetaItem icon="calendar" label="Edad" value={`${paciente.edad} años`} />
            <MetaItem icon="location" label="Ubicación" value={`${paciente.municipio || ''}, ${paciente.estado || ''}`} />
            <MetaItem icon="person" label="Sexo" value={paciente.sexo === 'H' ? 'Hombre' : 'Mujer'} />
          </View>
        </GlassCard>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={[styles.statBox, { backgroundColor: colors.status.successBg }]}>
            <Text style={[styles.statNum, { color: colors.status.success }]}>
              {vacunasAplicadas.length}
            </Text>
            <Text style={styles.statLabel}>Aplicadas</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: colors.status.warningBg }]}>
            <Text style={[styles.statNum, { color: colors.status.warning }]}>
              {vacunasPendientes.length}
            </Text>
            <Text style={styles.statLabel}>Pendientes</Text>
          </View>
        </View>

        {/* Vacunas Aplicadas */}
        <Text style={styles.sectionTitle}>
          <Ionicons name="checkmark-circle" size={18} color={colors.status.success} />{' '}
          Vacunas Aplicadas
        </Text>
        {vacunasAplicadas.length === 0 ? (
          <Text style={styles.emptySection}>Sin vacunas aplicadas aún</Text>
        ) : (
          vacunasAplicadas.map((reg) => (
            <GlassCard key={reg.id} style={styles.vacunaCard}>
              <View style={styles.vacunaRow}>
                <View style={[styles.dot, { backgroundColor: colors.status.success }]} />
                <View style={styles.vacunaInfo}>
                  <Text style={styles.vacunaName}>{reg.vacunaNombre}</Text>
                  <Text style={styles.vacunaDetail}>
                    Dosis {reg.numeroDosis} • Lote: {reg.lote}
                  </Text>
                  <Text style={styles.vacunaDate}>
                    {new Date(reg.fechaAplicacion).toLocaleDateString('es-MX')}
                  </Text>
                </View>
                <Badge
                  label={reg.estado}
                  variant={getBadgeVariantForEstado(reg.estado)}
                />
              </View>
            </GlassCard>
          ))
        )}

        {/* Vacunas Pendientes */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>
          <Ionicons name="time" size={18} color={colors.status.warning} />{' '}
          Vacunas Pendientes
        </Text>
        {vacunasPendientes.length === 0 ? (
          <Text style={styles.emptySection}>
            🎉 ¡Esquema de vacunación completo!
          </Text>
        ) : (
          vacunasPendientes.map((vac) => (
            <GlassCard key={vac.id} style={styles.vacunaCard}>
              <View style={styles.vacunaRow}>
                <View style={[styles.dot, { backgroundColor: colors.status.warning }]} />
                <View style={styles.vacunaInfo}>
                  <Text style={styles.vacunaName}>{vac.nombre}</Text>
                  <Text style={styles.vacunaDetail}>
                    {vac.fabricante} • {vac.numeroDosis} dosis
                  </Text>
                  <Text style={styles.vacunaDetail}>{vac.descripcion}</Text>
                </View>
              </View>
            </GlassCard>
          ))
        )}
      </ScrollView>
    </ScreenWrapper>
  );
};

const MetaItem = ({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) => (
  <View style={styles.metaItem}>
    <Ionicons name={icon} size={16} color={colors.neutral[400]} />
    <View>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue}>{value}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 100 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { ...typography.body, color: colors.neutral[400], marginTop: 12 },
  profileCard: { padding: 20 },
  profileHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    borderWidth: 2,
    borderColor: colors.primary[200],
  },
  profileInfo: { flex: 1 },
  profileName: { ...typography.h3, color: colors.neutral[900] },
  profileCurp: { ...typography.caption, marginTop: 2, letterSpacing: 0.5 },
  profileMeta: { gap: 10 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  metaLabel: { ...typography.caption, fontSize: 11 },
  metaValue: { ...typography.bodySmall, color: colors.neutral[700], fontWeight: '500' },
  statsRow: { flexDirection: 'row', gap: 12, marginTop: 16, marginBottom: 8 },
  statBox: {
    flex: 1,
    borderRadius: borderRadius.md,
    paddingVertical: 16,
    alignItems: 'center',
  },
  statNum: { ...typography.h2, fontSize: 28 },
  statLabel: { ...typography.caption, marginTop: 2 },
  sectionTitle: { ...typography.h4, marginBottom: 10, marginTop: 8 },
  emptySection: { ...typography.body, color: colors.neutral[400], paddingVertical: 12 },
  vacunaCard: { marginBottom: 2 },
  vacunaRow: { flexDirection: 'row', alignItems: 'flex-start' },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 5,
    marginRight: 10,
  },
  vacunaInfo: { flex: 1 },
  vacunaName: { ...typography.h4, fontSize: 15, color: colors.neutral[800] },
  vacunaDetail: { ...typography.caption, marginTop: 2 },
  vacunaDate: { ...typography.caption, color: colors.primary[500], marginTop: 3 },
});

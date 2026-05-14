import React from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { GlassCard } from '../../components/ui';
import { colors, typography, shadows } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { ciudadanoApi } from '../../api/endpoints/ciudadano';

export const MiSaludScreen: React.FC = () => {
  const { token, nombreCompleto } = useAuth();

  const { data: historial, isLoading } = useQuery({
    queryKey: ['ciudadano-historial', token],
    queryFn: () => ciudadanoApi.historial(token!),
    enabled: !!token,
  });

  const aplicadas  = historial?.totalAplicadas  ?? 0;
  const pendientes = historial?.totalPendientes ?? 0;
  const total      = aplicadas + pendientes;
  const progreso   = total > 0 ? Math.round((aplicadas / total) * 100) : 0;

  const nivelEsquema =
    progreso === 100 ? 'Esquema Completo'
    : progreso >= 60  ? 'Esquema Avanzado'
    : progreso >= 30  ? 'Esquema Parcial'
    : 'Esquema Inicial';

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Saludo */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Bienvenido</Text>
            <Text style={styles.name} numberOfLines={1}>
              {nombreCompleto ?? 'Ciudadano'}
            </Text>
          </View>
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={22} color={colors.secondary[500]} />
          </View>
        </View>

        {/* Estado del esquema */}
        <GlassCard variant="elevated" style={styles.schemeCard}>
          {isLoading ? (
            <ActivityIndicator color={colors.primary[500]} />
          ) : (
            <>
              <Text style={styles.schemeLabel}>Estado de vacunación</Text>
              <Text style={styles.schemeName}>{nivelEsquema}</Text>

              {/* Barra de progreso */}
              <View style={styles.progressBg}>
                <View style={[styles.progressFill, { width: `${progreso}%` as any }]} />
              </View>
              <Text style={styles.progressText}>{progreso}% completado</Text>

              <View style={styles.statsRow}>
                <View style={styles.stat}>
                  <Text style={styles.statNum}>{aplicadas}</Text>
                  <Text style={styles.statLabel}>Aplicadas</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.stat}>
                  <Text style={[styles.statNum, { color: colors.accent.coral }]}>
                    {pendientes}
                  </Text>
                  <Text style={styles.statLabel}>Pendientes</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.stat}>
                  <Text style={styles.statNum}>{total}</Text>
                  <Text style={styles.statLabel}>Total</Text>
                </View>
              </View>
            </>
          )}
        </GlassCard>

        {/* Próximas vacunas */}
        <Text style={styles.sectionTitle}>Próximas vacunas recomendadas</Text>
        {isLoading ? (
          <ActivityIndicator color={colors.primary[500]} style={{ marginTop: 20 }} />
        ) : (
          historial?.vacunasPendientes?.slice(0, 3).map((v: any) => (
            <GlassCard key={v.id} variant="default" style={styles.vacunaCard}>
              <View style={styles.vacunaRow}>
                <View style={[styles.vacunaIcon, { backgroundColor: colors.primary[50] }]}>
                  <Ionicons name="medical" size={20} color={colors.primary[500]} />
                </View>
                <View style={styles.vacunaInfo}>
                  <Text style={styles.vacunaNombre}>{v.nombre}</Text>
                  <Text style={styles.vacunaCategoria}>
                    {v.categoria.replace(/_/g, ' ')}
                  </Text>
                </View>
                <View style={styles.pendienteBadge}>
                  <Text style={styles.pendienteText}>Pendiente</Text>
                </View>
              </View>
            </GlassCard>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root:    { flex: 1, backgroundColor: colors.background.primary, marginBottom: 90 },
  scroll:  { flex: 1 },
  content: { padding: 20, paddingBottom: 20 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: { ...typography.body, color: colors.neutral[500] },
  name:     { ...typography.h2, color: colors.neutral[900], marginTop: 2, maxWidth: 240 },
  avatarCircle: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: colors.secondary[50],
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: colors.secondary[200],
  },
  schemeCard: { marginBottom: 24, padding: 20 },
  schemeLabel: { ...typography.caption, color: colors.neutral[500], marginBottom: 4 },
  schemeName:  { ...typography.h3, color: colors.neutral[800], marginBottom: 14 },
  progressBg: {
    height: 10, borderRadius: 5,
    backgroundColor: colors.neutral[100], marginBottom: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%', borderRadius: 5,
    backgroundColor: colors.secondary[500],
  },
  progressText: { ...typography.caption, color: colors.neutral[500], marginBottom: 16 },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: colors.neutral[50],
    borderRadius: 12, paddingVertical: 12,
  },
  stat:        { flex: 1, alignItems: 'center' },
  statNum:     { ...typography.h3, fontSize: 22, color: colors.neutral[800] },
  statLabel:   { ...typography.caption, marginTop: 2 },
  statDivider: { width: 1, backgroundColor: colors.neutral[200], marginVertical: 4 },
  sectionTitle: { ...typography.h4, marginBottom: 12 },
  vacunaCard:  { marginBottom: 10, padding: 14 },
  vacunaRow:   { flexDirection: 'row', alignItems: 'center' },
  vacunaIcon:  {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  vacunaInfo:  { flex: 1 },
  vacunaNombre: { ...typography.body, fontWeight: '600', color: colors.neutral[800] },
  vacunaCategoria: { ...typography.caption, marginTop: 2 },
  pendienteBadge: {
    backgroundColor: colors.status.warningBg,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20,
  },
  pendienteText: { fontSize: 11, fontWeight: '600', color: colors.status.warning },
});

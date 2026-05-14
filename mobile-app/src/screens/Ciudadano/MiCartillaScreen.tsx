import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { GlassCard } from '../../components/ui';
import { colors, typography, borderRadius, shadows } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { ciudadanoApi } from '../../api/endpoints/ciudadano';

export const MiCartillaScreen: React.FC = () => {
  const { token } = useAuth();

  const { data: historial, isLoading, isError } = useQuery({
    queryKey: ['ciudadano-historial', token],
    queryFn: () => ciudadanoApi.historial(token!),
    enabled: !!token,
  });

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
        <Text style={styles.loadingText}>Cargando tu cartilla...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.center}>
        <Ionicons name="cloud-offline" size={48} color={colors.neutral[300]} />
        <Text style={styles.errorText}>Error al cargar el historial.</Text>
      </View>
    );
  }

  const aplicadas  = historial?.vacunasAplicadas  ?? [];
  const pendientes = historial?.vacunasPendientes ?? [];

  return (
    <View style={styles.root}>
      <FlatList
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <Text style={styles.pageTitle}>Mi Cartilla</Text>

            {/* Vacunas Aplicadas */}
            <View style={styles.sectionHeader}>
              <Ionicons name="checkmark-circle" size={20} color={colors.status.success} />
              <Text style={styles.sectionTitle}>
                Vacunas Aplicadas ({aplicadas.length})
              </Text>
            </View>
            {aplicadas.length === 0 && (
              <Text style={styles.emptySection}>Sin registros aplicados aún.</Text>
            )}
            {aplicadas.map((v: any) => (
              <GlassCard key={v.id} variant="elevated" style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.checkBadge}>
                    <Ionicons name="checkmark" size={14} color="#FFF" />
                  </View>
                  <Text style={styles.vacunaNombre}>{v.vacunaNombre}</Text>
                </View>
                <View style={styles.row}>
                  <InfoChip icon="calendar" label={new Date(v.fechaAplicacion).toLocaleDateString('es-MX')} />
                  <InfoChip icon="layers"   label={`Dosis ${v.numeroDosis}`} />
                </View>
                <View style={styles.row}>
                  <InfoChip icon="business" label={v.unidadAplicadora} />
                  <InfoChip icon="barcode"  label={`Lote: ${v.lote}`} />
                </View>
              </GlassCard>
            ))}

            {/* Vacunas Pendientes */}
            <View style={[styles.sectionHeader, { marginTop: 20 }]}>
              <Ionicons name="time" size={20} color={colors.accent.amber} />
              <Text style={styles.sectionTitle}>
                Pendientes ({pendientes.length})
              </Text>
            </View>
            {pendientes.length === 0 && (
              <View style={styles.allDoneBox}>
                <Ionicons name="shield-checkmark" size={36} color={colors.status.success} />
                <Text style={styles.allDoneText}>¡Esquema completo!</Text>
              </View>
            )}
          </>
        }
        data={pendientes}
        keyExtractor={(item: any) => item.id}
        renderItem={({ item }: { item: any }) => (
          <GlassCard variant="default" style={StyleSheet.flatten([styles.card, styles.pendingCard]) as any}>
            <View style={styles.cardHeader}>
              <View style={styles.pendingBadge}>
                <Ionicons name="time" size={14} color={colors.accent.amber} />
              </View>
              <Text style={styles.vacunaNombre}>{item.nombre}</Text>
            </View>
            <View style={styles.row}>
              <InfoChip icon="medical"   label={item.categoria.replace(/_/g, ' ')} />
              <InfoChip icon="layers"    label={`${item.numeroDosis} dosis`} />
            </View>
            {item.descripcion ? (
              <Text style={styles.descripcion} numberOfLines={2}>{item.descripcion}</Text>
            ) : null}
          </GlassCard>
        )}
      />
    </View>
  );
};

const InfoChip = ({
  icon,
  label,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
}) => (
  <View style={chipStyles.chip}>
    <Ionicons name={icon} size={12} color={colors.neutral[500]} />
    <Text style={chipStyles.text} numberOfLines={1}>{label}</Text>
  </View>
);

const chipStyles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.neutral[50],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    flex: 1,
  },
  text: { fontSize: 11, color: colors.neutral[600], flexShrink: 1 },
});

const styles = StyleSheet.create({
  root:     { flex: 1, backgroundColor: colors.background.primary, marginBottom: 90 },
  center:   { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  list:     { padding: 20, paddingBottom: 20 },
  pageTitle: { ...typography.h2, marginBottom: 20 },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12,
  },
  sectionTitle: { ...typography.h4, color: colors.neutral[700] },
  card: { marginBottom: 10, padding: 14 },
  pendingCard: { borderLeftWidth: 3, borderLeftColor: colors.accent.amber },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  checkBadge: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: colors.status.success,
    alignItems: 'center', justifyContent: 'center',
  },
  pendingBadge: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: colors.status.warningBg,
    alignItems: 'center', justifyContent: 'center',
  },
  vacunaNombre: { ...typography.body, fontWeight: '700', color: colors.neutral[800], flex: 1 },
  row: { flexDirection: 'row', gap: 8, marginBottom: 6 },
  descripcion: { ...typography.caption, color: colors.neutral[500], marginTop: 4 },
  emptySection: { ...typography.caption, color: colors.neutral[400], marginBottom: 12 },
  allDoneBox: {
    alignItems: 'center', padding: 24, gap: 8,
    backgroundColor: colors.status.successBg,
    borderRadius: borderRadius.lg,
  },
  allDoneText: { ...typography.h4, color: colors.status.success },
  loadingText: { ...typography.body, color: colors.neutral[400], marginTop: 8 },
  errorText:   { ...typography.body, color: colors.neutral[400] },
});

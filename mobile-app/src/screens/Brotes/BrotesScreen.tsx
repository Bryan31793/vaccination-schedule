import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ScreenWrapper,
  GlassCard,
  Badge,
  getBadgeVariantForAlerta,
  PrimaryButton,
} from '../../components/ui';
import { brotesApi } from '../../api/endpoints/brotes';
import { colors, typography, borderRadius, shadows } from '../../theme';
import type { BrotesListScreenProps } from '../../navigation/types';
import type { AlertaBroteResponse, NivelAlerta } from '../../types';

const alertaGradient: Record<string, readonly [string, string]> = {
  CRITICO: colors.gradients.alertCritico as unknown as [string, string],
  MODERADO: colors.gradients.alertModerado as unknown as [string, string],
  INFORMATIVO: [colors.status.info, '#2563EB'],
};

export const BrotesScreen: React.FC<BrotesListScreenProps> = ({ navigation }) => {
  const {
    data: alertas = [],
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['brotes-activos'],
    queryFn: brotesApi.activos,
  });

  const renderAlerta = ({ item }: { item: AlertaBroteResponse }) => {
    const grad = alertaGradient[item.nivel] || alertaGradient.INFORMATIVO;

    return (
      <GlassCard variant="elevated" style={styles.alertaCard}>
        <View style={styles.alertaHeader}>
          <LinearGradient
            colors={grad}
            style={styles.alertaIcon}
          >
            <Ionicons
              name={
                item.nivel === 'CRITICO'
                  ? 'warning'
                  : item.nivel === 'MODERADO'
                  ? 'alert-circle'
                  : 'information-circle'
              }
              size={22}
              color="#FFF"
            />
          </LinearGradient>
          <View style={styles.alertaInfo}>
            <Text style={styles.alertaRegion}>{item.region}</Text>
            <Text style={styles.alertaCategoria}>
              {item.categoriaVacuna.replace('_', ' ')}
            </Text>
          </View>
          <Badge
            label={item.nivel}
            variant={getBadgeVariantForAlerta(item.nivel as NivelAlerta)}
            size="medium"
          />
        </View>
        <View style={styles.alertaStats}>
          <View style={styles.alertaStat}>
            <Text style={styles.alertaStatNum}>{item.casosDetectados}</Text>
            <Text style={styles.alertaStatLabel}>Casos</Text>
          </View>
          <View style={styles.alertaStatDivider} />
          <View style={styles.alertaStat}>
            <Text style={styles.alertaStatNum}>{item.umbralActivacion}</Text>
            <Text style={styles.alertaStatLabel}>Umbral</Text>
          </View>
          <View style={styles.alertaStatDivider} />
          <View style={styles.alertaStat}>
            <Text style={styles.alertaStatNum}>
              {(item.casosDetectados / item.umbralActivacion).toFixed(1)}x
            </Text>
            <Text style={styles.alertaStatLabel}>Ratio</Text>
          </View>
        </View>
        <Text style={styles.alertaDate}>
          Detectado: {new Date(item.fechaDeteccion).toLocaleDateString('es-MX')}
        </Text>
      </GlassCard>
    );
  };

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Alertas de Brote</Text>
          <PrimaryButton
            title="Asistente IA"
            variant="secondary"
            size="small"
            icon={
              <Ionicons
                name="chatbubble-ellipses"
                size={16}
                color={colors.primary[600]}
              />
            }
            onPress={() => navigation.navigate('AsistenteIA', {})}
          />
        </View>

        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.primary[500]} />
            <Text style={styles.loadingText}>Cargando alertas...</Text>
          </View>
        ) : isError ? (
          <View style={styles.center}>
            <Ionicons
              name="cloud-offline"
              size={48}
              color={colors.neutral[300]}
            />
            <Text style={styles.emptyText}>
              Error al cargar las alertas.
            </Text>
          </View>
        ) : (
          <FlatList
            data={alertas}
            keyExtractor={(item) => item.id}
            renderItem={renderAlerta}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.list}
            refreshControl={
              <RefreshControl
                refreshing={isRefetching}
                onRefresh={refetch}
                tintColor={colors.primary[500]}
              />
            }
            ListEmptyComponent={
              <View style={styles.center}>
                <Ionicons
                  name="shield-checkmark"
                  size={56}
                  color={colors.status.success}
                />
                <Text style={styles.emptyTitle}>¡Todo en orden!</Text>
                <Text style={styles.emptyText}>
                  No hay alertas de brote activas en este momento.
                </Text>
              </View>
            }
          />
        )}
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    marginBottom: 16,
  },
  title: { ...typography.h2 },
  list: { paddingBottom: 100 },
  alertaCard: { marginBottom: 4, padding: 16 },
  alertaHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  alertaIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  alertaInfo: { flex: 1 },
  alertaRegion: { ...typography.h4, fontSize: 16, color: colors.neutral[800] },
  alertaCategoria: { ...typography.caption, marginTop: 2 },
  alertaStats: {
    flexDirection: 'row',
    backgroundColor: colors.neutral[50],
    borderRadius: borderRadius.md,
    paddingVertical: 12,
    marginBottom: 8,
  },
  alertaStat: { flex: 1, alignItems: 'center' },
  alertaStatNum: { ...typography.h3, fontSize: 20, color: colors.neutral[800] },
  alertaStatLabel: { ...typography.caption, marginTop: 2 },
  alertaStatDivider: {
    width: 1,
    backgroundColor: colors.neutral[200],
    marginVertical: 4,
  },
  alertaDate: { ...typography.caption, textAlign: 'right' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  loadingText: { ...typography.body, marginTop: 12, color: colors.neutral[400] },
  emptyTitle: { ...typography.h3, color: colors.status.success, marginTop: 12 },
  emptyText: {
    ...typography.body,
    color: colors.neutral[400],
    textAlign: 'center',
    marginTop: 4,
  },
});

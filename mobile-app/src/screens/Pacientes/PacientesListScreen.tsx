import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { ScreenWrapper, GlassCard, Badge } from '../../components/ui';
import { pacientesApi } from '../../api/endpoints/pacientes';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import type { PacientesListScreenProps } from '../../navigation/types';
import type { PacienteResponse } from '../../types';

export const PacientesListScreen: React.FC<PacientesListScreenProps> = ({
  navigation,
}) => {
  const [search, setSearch] = useState('');

  const {
    data: pacientes = [],
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['pacientes'],
    queryFn: pacientesApi.listar,
  });

  const filtered = pacientes.filter(
    (p) =>
      p.nombreCompleto.toLowerCase().includes(search.toLowerCase()) ||
      p.curp.toLowerCase().includes(search.toLowerCase())
  );

  const renderItem = useCallback(
    ({ item }: { item: PacienteResponse }) => (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() =>
          navigation.navigate('PacienteDetalle', { curp: item.curp })
        }
      >
        <GlassCard variant="elevated" style={styles.card}>
          <View style={styles.cardRow}>
            <View style={styles.avatarSmall}>
              <Ionicons
                name={item.sexo === 'M' ? 'woman' : 'man'}
                size={22}
                color={
                  item.sexo === 'M'
                    ? colors.accent.coral
                    : colors.primary[500]
                }
              />
            </View>
            <View style={styles.cardInfo}>
              <Text style={styles.cardName}>{item.nombreCompleto}</Text>
              <Text style={styles.cardCurp}>CURP: {item.curp}</Text>
              <View style={styles.cardMeta}>
                <Badge label={`${item.edad} años`} variant="info" />
                <Text style={styles.cardLocation}>
                  📍 {item.municipio || item.estado || 'Sin ubicación'}
                </Text>
              </View>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.neutral[300]}
            />
          </View>
        </GlassCard>
      </TouchableOpacity>
    ),
    [navigation]
  );

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Pacientes</Text>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => navigation.navigate('RegistrarPaciente')}
          >
            <Ionicons name="add" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={colors.neutral[400]} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por nombre o CURP..."
            placeholderTextColor={colors.neutral[400]}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons
                name="close-circle"
                size={20}
                color={colors.neutral[400]}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Lista */}
        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.primary[500]} />
            <Text style={styles.loadingText}>Cargando pacientes...</Text>
          </View>
        ) : isError ? (
          <View style={styles.center}>
            <Ionicons
              name="cloud-offline"
              size={48}
              color={colors.neutral[300]}
            />
            <Text style={styles.emptyText}>
              Error al cargar los datos.{'\n'}Verifica la conexión con el
              servidor.
            </Text>
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
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
                  name="people-outline"
                  size={48}
                  color={colors.neutral[300]}
                />
                <Text style={styles.emptyText}>
                  {search
                    ? 'Sin resultados para tu búsqueda'
                    : 'No hay pacientes registrados'}
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
  addBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral[0],
    borderRadius: borderRadius.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: colors.neutral[800],
  },
  list: { paddingBottom: 100 },
  card: { marginBottom: 2 },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarSmall: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardInfo: { flex: 1 },
  cardName: {
    ...typography.h4,
    fontSize: 16,
    color: colors.neutral[800],
  },
  cardCurp: {
    ...typography.caption,
    marginTop: 2,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  cardLocation: {
    ...typography.caption,
    fontSize: 12,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  loadingText: {
    ...typography.body,
    marginTop: 12,
    color: colors.neutral[400],
  },
  emptyText: {
    ...typography.body,
    marginTop: 12,
    color: colors.neutral[400],
    textAlign: 'center',
  },
});

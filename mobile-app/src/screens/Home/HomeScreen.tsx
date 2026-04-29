import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper, GlassCard } from '../../components/ui';
import { colors, typography, spacing } from '../../theme';
import type { HomeScreenProps } from '../../navigation/types';

const StatCard = ({
  icon,
  label,
  value,
  color,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
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

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
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
            <Text style={styles.greeting}>Bienvenido 👋</Text>
            <Text style={styles.title}>Sistema de Vacunación</Text>
          </View>
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={22} color={colors.primary[500]} />
          </View>
        </View>

        {/* Stats Grid */}
        <Text style={styles.sectionTitle}>Resumen General</Text>
        <View style={styles.statsGrid}>
          <StatCard
            icon="people"
            label="Pacientes"
            value="--"
            color={colors.primary[500]}
          />
          <StatCard
            icon="medical"
            label="Vacunas Hoy"
            value="--"
            color={colors.secondary[500]}
          />
          <StatCard
            icon="warning"
            label="Alertas Activas"
            value="--"
            color={colors.accent.coral}
          />
          <StatCard
            icon="shield-checkmark"
            label="Catálogo"
            value="--"
            color={colors.accent.purple}
          />
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
        <GlassCard variant="elevated">
          <QuickAction
            icon="person-add"
            label="Registrar Paciente"
            color={colors.primary[500]}
            onPress={() =>
              navigation.navigate('Pacientes', {
                screen: 'RegistrarPaciente',
              })
            }
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

const QuickAction = ({
  icon,
  label,
  color,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
  onPress: () => void;
}) => (
  <View style={styles.quickAction}>
    <View style={styles.quickActionLeft}>
      <Ionicons name={icon} size={22} color={color} />
      <Text style={styles.quickActionLabel}>{label}</Text>
    </View>
    <Ionicons
      name="chevron-forward"
      size={20}
      color={colors.neutral[400]}
      onPress={onPress}
    />
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 100 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
  },
  greeting: {
    ...typography.body,
    color: colors.neutral[500],
  },
  title: {
    ...typography.h2,
    color: colors.neutral[900],
    marginTop: 2,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.primary[200],
  },
  sectionTitle: {
    ...typography.h4,
    marginBottom: 12,
    marginTop: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statCard: {
    width: '48%',
    alignItems: 'center',
    paddingVertical: 20,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  statValue: {
    ...typography.h2,
    color: colors.neutral[800],
  },
  statLabel: {
    ...typography.caption,
    marginTop: 2,
  },
  quickAction: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  quickActionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quickActionLabel: {
    ...typography.body,
    color: colors.neutral[700],
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: colors.neutral[100],
  },
});

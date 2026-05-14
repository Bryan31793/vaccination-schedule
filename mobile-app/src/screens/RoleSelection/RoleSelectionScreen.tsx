import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, borderRadius, shadows } from '../../theme';

const { width } = Dimensions.get('window');

interface RoleSelectionScreenProps {
  onSelect: (role: 'medico' | 'ciudadano') => void;
}

const RoleCard = ({
  icon,
  title,
  description,
  gradientColors,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  gradientColors: [string, string];
  onPress: () => void;
}) => (
  <TouchableOpacity
    style={styles.card}
    onPress={onPress}
    activeOpacity={0.85}
  >
    <View style={styles.cardInner}>
      <LinearGradient colors={gradientColors} style={styles.iconCircle}>
        <Ionicons name={icon} size={36} color="#FFF" />
      </LinearGradient>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardDescription}>{description}</Text>
      <View style={styles.cardArrow}>
        <Text style={styles.cardArrowText}>Ingresar</Text>
        <Ionicons name="arrow-forward" size={16} color={colors.primary[500]} />
      </View>
    </View>
  </TouchableOpacity>
);

export const RoleSelectionScreen: React.FC<RoleSelectionScreenProps> = ({ onSelect }) => {
  return (
    <LinearGradient
      colors={['#0F5080', '#1A8AD4', '#4DDCB6']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <LinearGradient
            colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)']}
            style={styles.logoCircle}
          >
            <Ionicons name="medkit" size={44} color="#FFF" />
          </LinearGradient>
          <Text style={styles.appSubtitle}>
            Sistema Nacional de Vacunación
          </Text>
        </View>

        {/* Role Cards */}
        <View style={styles.cardsContainer}>
          <Text style={styles.selectLabel}>¿Cómo deseas ingresar?</Text>

          <View style={styles.cardsRow}>
            <RoleCard
              icon="medkit"
              title="Personal Médico"
              description="Gestión de pacientes, vacunas y alertas de brote"
              gradientColors={[colors.primary[600], colors.primary[400]]}
              onPress={() => onSelect('medico')}
            />
            <RoleCard
              icon="person-circle"
              title="Ciudadano"
              description="Consulta tu cartilla, historial y vacunas pendientes"
              gradientColors={[colors.secondary[600], colors.secondary[400]]}
              onPress={() => onSelect('ciudadano')}
            />
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Secretaría de Salud • México
        </Text>
      </View>
    </LinearGradient>
  );
};

const CARD_WIDTH = Math.min((width - 64) / 2, 200);

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'web' ? 60 : 80,
    paddingBottom: 40,
    paddingHorizontal: 24,
  },
  header: { alignItems: 'center', gap: 12 },
  logoCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  appName: {
    fontSize: 34,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  appSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    fontWeight: '500',
  },
  cardsContainer: { width: '100%', alignItems: 'center', gap: 16 },
  selectLabel: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
    textAlign: 'center',
  },
  cardsRow: {
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'center',
  },
  card: {
    width: CARD_WIDTH,
    borderRadius: borderRadius.xl,
    backgroundColor: 'rgba(255,255,255,0.95)',
    ...shadows.lg,
    overflow: 'hidden',
  },
  cardInner: {
    padding: 20,
    alignItems: 'center',
    gap: 10,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.neutral[800],
    textAlign: 'center',
  },
  cardDescription: {
    fontSize: 12,
    color: colors.neutral[500],
    textAlign: 'center',
    lineHeight: 17,
  },
  cardArrow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  cardArrowText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary[500],
  },
  footer: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
  },
});

import React, { useState, useRef } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, Dimensions, ScrollView } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper, PrimaryButton, GlassCard } from '../../components/ui';
import { colors, typography } from '../../theme';
import { simulacionApi } from '../../api/endpoints/simulacion';
import { SimulacionScreenProps } from '../../navigation/types';

const { width } = Dimensions.get('window');

export const SimulacionScreen = ({ navigation }: SimulacionScreenProps) => {
  const [loading, setLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<Video>(null);

  const handleEjecutarSimulacion = async () => {
    setLoading(true);
    setError(null);
    setVideoUrl(null);
    try {
      await simulacionApi.ejecutar();
      const url = simulacionApi.getVideoUrl();
      // Agregamos un timestamp para evitar cache del video anterior
      setVideoUrl(`${url}?t=${Date.now()}`);
    } catch (err: any) {
      console.error(err);
      const serverMessage = err.response?.data?.mensaje || err.message;
      if (err.code === 'ECONNABORTED') {
        setError('La simulación está tardando más de lo esperado. Por favor, espera un momento y verifica de nuevo.');
      } else {
        setError(`Error al ejecutar la simulación: ${serverMessage}`);
      }
    } finally {
      setLoading(false);
    }
  };

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
            <Text style={styles.subtitle}>Modelo Epidemiológico</Text>
            <Text style={styles.title}>Simulación SIRVD</Text>
          </View>
          <View style={styles.iconCircle}>
            <Ionicons name="stats-chart" size={22} color={colors.primary[500]} />
          </View>
        </View>

        <GlassCard style={styles.card}>
          <Text style={styles.description}>
            Ejecuta un modelo SIRVD (Susceptibles, Infectados, Recuperados, Vacunados, Difuntos) dinámico basado en grafos para visualizar cómo se propaga una enfermedad en una población cerrada.
          </Text>
          
          <PrimaryButton
            title={loading ? "Simulando..." : "Ejecutar Simulación"}
            onPress={handleEjecutarSimulacion}
            loading={loading}
            icon={<Ionicons name="play-circle-outline" size={20} color="#FFF" />}
          />
        </GlassCard>

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary[500]} />
            <Text style={styles.loadingText}>Calculando movimientos y contagios...</Text>
            <Text style={styles.loadingSubtext}>Este proceso puede tardar hasta 60 segundos.</Text>
          </View>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {videoUrl && !loading && (
          <View style={styles.videoContainer}>
            <Text style={styles.sectionTitle}>Resultado de la Simulación</Text>
            <View style={styles.videoWrapper}>
              <Video
                ref={videoRef}
                style={styles.video}
                source={{ uri: videoUrl }}
                useNativeControls
                resizeMode={ResizeMode.CONTAIN}
                isLooping
                shouldPlay
              />
            </View>
            <Text style={styles.videoCaption}>
              El video muestra la interacción entre agentes y la curva SIRVD en tiempo real.
            </Text>
          </View>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 100 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
  },
  subtitle: {
    ...typography.body,
    color: colors.neutral[500],
  },
  title: {
    ...typography.h2,
    color: colors.neutral[900],
    marginTop: 2,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.primary[200],
  },
  card: {
    padding: 16,
    marginBottom: 20,
  },
  description: {
    ...typography.body,
    color: colors.neutral[600],
    marginBottom: 16,
    lineHeight: 22,
  },
  sectionTitle: {
    ...typography.h4,
    marginBottom: 12,
    marginTop: 8,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    ...typography.caption,
    color: colors.primary[600],
    marginTop: 12,
  },
  loadingSubtext: {
    ...typography.caption,
    fontSize: 12,
    color: colors.neutral[500],
    marginTop: 4,
  },
  errorContainer: {
    backgroundColor: colors.status.errorBg,
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  errorText: {
    ...typography.caption,
    color: colors.status.error,
    textAlign: 'center',
  },
  videoContainer: {
    marginTop: 8,
  },
  videoWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#000',
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  video: {
    width: width - 40,
    height: (width - 40) * (500 / 800), // Mantener aspect ratio de la simulación
  },
  videoCaption: {
    ...typography.caption,
    color: colors.neutral[500],
    marginTop: 8,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

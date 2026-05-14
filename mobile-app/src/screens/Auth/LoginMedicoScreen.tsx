import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, KeyboardAvoidingView, Platform, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useMutation } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { InputField, PrimaryButton } from '../../components/ui';
import { colors, typography, borderRadius, shadows } from '../../theme';
import { medicoAuthApi } from '../../api/endpoints/medicoAuth';
import { useMedicoAuth } from '../../context/MedicoAuthContext';
import { useBackPortal } from '../../context/BackPortalContext';
import type { LoginMedicoScreenProps } from '../../navigation/types';

const ROL_LABELS: Record<string, string> = {
  ADMIN: 'Administrador',
  MEDICO: 'Médico',
  ENFERMERO: 'Enfermero/a',
};

export const LoginMedicoScreen: React.FC<LoginMedicoScreenProps> = ({ navigation }) => {
  const { login } = useMedicoAuth();
  const onBack = useBackPortal();
  const [cedula, setCedula]         = useState('');
  const [password, setPassword]     = useState('');
  const [showPass, setShowPass]     = useState(false);

  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(28)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  const mutation = useMutation({
    mutationFn: () => medicoAuthApi.login({ cedulaProfesional: cedula, password }),
    onSuccess: async (data) => {
      await login(data);
      Toast.show({
        type: 'success',
        text1: `Bienvenido, ${data.nombreCompleto.split(' ')[0]}`,
        text2: ROL_LABELS[data.rol] ?? data.rol,
        visibilityTime: 2000,
      });
    },
    onError: (err: any) => {
      Toast.show({
        type: 'error',
        text1: 'Acceso denegado',
        text2: err?.response?.data?.mensaje ?? 'Cédula o contraseña incorrectos.',
        visibilityTime: 4000,
      });
    },
  });

  const isReady = cedula.trim().length >= 7 && password.length >= 8 && !mutation.isPending;

  const EyeToggle = (
    <TouchableOpacity onPress={() => setShowPass(v => !v)} style={styles.eyeBtn}>
      <Ionicons name={showPass ? 'eye-off' : 'eye'} size={20} color={colors.neutral[400]} />
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={['#E8F4FD', '#EEF6FF', '#FFFFFF']} style={styles.gradient}>
      {onBack && (
        <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={20} color={colors.primary[600]} />
        </TouchableOpacity>
      )}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          {/* Hero */}
          <Animated.View style={[styles.hero, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <LinearGradient
              colors={[colors.primary[400], colors.primary[700]] as [string, string]}
              style={styles.iconCircle}
            >
              <Ionicons name="medkit" size={38} color="#FFF" />
            </LinearGradient>
            <Text style={styles.title}>Portal Médico</Text>
            <Text style={styles.subtitle}>Acceso exclusivo para personal de salud autorizado</Text>
          </Animated.View>

          {/* Card */}
          <Animated.View style={[styles.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <InputField
              label="Cédula Profesional"
              icon="card-outline"
              placeholder="7 u 8 dígitos"
              value={cedula}
              onChangeText={(text) => setCedula(text.replace(/\D/g, ''))}
              keyboardType="number-pad"
              maxLength={8}
              required
            />
            <InputField
              label="Contraseña"
              icon="lock-closed-outline"
              placeholder="Mínimo 8 caracteres"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPass}
              rightElement={EyeToggle}
              required
            />

            <PrimaryButton
              title="Ingresar al sistema"
              onPress={() => mutation.mutate()}
              loading={mutation.isPending}
              disabled={!isReady}
              size="large"
              style={styles.btn}
            />

            <TouchableOpacity
              style={styles.linkBtn}
              onPress={() => navigation.navigate('RegistroMedico')}
            >
              <Text style={styles.linkText}>
                ¿Primera vez?{'  '}
                <Text style={styles.linkBold}>Registra tu cédula</Text>
              </Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Trust strip */}
          <Animated.View style={[styles.trustRow, { opacity: fadeAnim }]}>
            <TrustBadge icon="shield-checkmark" label="Acceso seguro" />
            <TrustBadge icon="school"           label="Cédula SEP" />
            <TrustBadge icon="lock-closed"      label="JWT cifrado" />
          </Animated.View>

        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const TrustBadge = ({ icon, label }: { icon: keyof typeof Ionicons.glyphMap; label: string }) => (
  <View style={styles.trustBadge}>
    <Ionicons name={icon} size={13} color={colors.primary[400]} />
    <Text style={styles.trustLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  backBtn: {
    position: 'absolute', top: 52, left: 16, zIndex: 10,
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.neutral[0],
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  scroll:   { flexGrow: 1, paddingHorizontal: 24, paddingTop: 64, paddingBottom: 32 },

  hero: { alignItems: 'center', marginBottom: 32, gap: 10 },
  iconCircle: {
    width: 84, height: 84, borderRadius: 42,
    alignItems: 'center', justifyContent: 'center',
    ...shadows.lg, marginBottom: 4,
  },
  title:    { ...typography.h2, color: colors.neutral[900], textAlign: 'center' },
  subtitle: { ...typography.body, color: colors.neutral[500], textAlign: 'center', paddingHorizontal: 12 },

  card: {
    backgroundColor: colors.neutral[0],
    borderRadius: borderRadius['2xl'],
    padding: 24,
    ...shadows.lg,
    marginBottom: 24,
  },
  eyeBtn: { padding: 6 },
  btn:    { marginTop: 4 },
  linkBtn: { alignItems: 'center', paddingVertical: 14 },
  linkText: { ...typography.body, color: colors.neutral[500] },
  linkBold: { color: colors.primary[600], fontWeight: '700' },

  trustRow: { flexDirection: 'row', justifyContent: 'center', gap: 20 },
  trustBadge: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  trustLabel: { ...typography.caption, color: colors.neutral[400] },
});

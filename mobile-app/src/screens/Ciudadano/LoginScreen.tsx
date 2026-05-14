import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, KeyboardAvoidingView, Platform,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useMutation } from '@tanstack/react-query';
import { InputField, PrimaryButton } from '../../components/ui';
import { colors, typography, borderRadius, shadows } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { useBackPortal } from '../../context/BackPortalContext';
import { ciudadanoApi } from '../../api/endpoints/ciudadano';
import type { LoginScreenProps } from '../../navigation/types';

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const { login } = useAuth();
  const onBack = useBackPortal();
  const [curp, setCurp]             = useState('');
  const [password, setPassword]     = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError]     = useState('');

  const fadeAnim    = useRef(new Animated.Value(0)).current;
  const slideAnim   = useRef(new Animated.Value(32)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 520, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 520, useNativeDriver: true }),
    ]).start();
  }, []);

  const mutation = useMutation({
    mutationFn: () => ciudadanoApi.login(curp.toUpperCase(), password),
    onSuccess: (data) => {
      setApiError('');
      login(data.token, data.curp, data.nombreCompleto);
    },
    onError: () => setApiError('CURP o contraseña incorrectos. Verifica tus datos.'),
  });

  const isReady = curp.length === 18 && password.length >= 8;

  const EyeToggle = (
    <TouchableOpacity onPress={() => setShowPassword(v => !v)} style={styles.eyeBtn}>
      <Ionicons
        name={showPassword ? 'eye-off' : 'eye'}
        size={20}
        color={colors.neutral[400]}
      />
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={['#E8F5F2', '#F0F9FF', '#FFFFFF']} style={styles.gradient}>
      {onBack && (
        <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={20} color={colors.secondary[600]} />
        </TouchableOpacity>
      )}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Hero ── */}
          <Animated.View style={[styles.hero, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <LinearGradient
              colors={[colors.secondary[400], colors.secondary[600]] as [string, string]}
              style={styles.iconCircle}
            >
              <Ionicons name="shield-checkmark" size={36} color="#FFF" />
            </LinearGradient>
            <Text style={styles.title}>Portal del Ciudadano</Text>
            <Text style={styles.subtitle}>Tu historial de vacunación en un solo lugar</Text>
          </Animated.View>

          {/* ── Form card ── */}
          <Animated.View style={[styles.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <InputField
              label="CURP"
              icon="card-outline"
              placeholder="18 caracteres en mayúsculas"
              value={curp}
              onChangeText={t => { setCurp(t.toUpperCase()); setApiError(''); }}
              maxLength={18}
              autoCapitalize="characters"
              required
            />
            <InputField
              label="Contraseña"
              icon="lock-closed-outline"
              placeholder="Mínimo 8 caracteres"
              value={password}
              onChangeText={t => { setPassword(t); setApiError(''); }}
              secureTextEntry={!showPassword}
              rightElement={EyeToggle}
              required
            />

            {apiError ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={16} color={colors.status.error} />
                <Text style={styles.errorText}>{apiError}</Text>
              </View>
            ) : null}

            <PrimaryButton
              title="Ingresar"
              onPress={() => mutation.mutate()}
              loading={mutation.isPending}
              disabled={!isReady}
              size="large"
              style={styles.btn}
            />

            <TouchableOpacity
              style={styles.linkBtn}
              onPress={() => navigation.navigate('Registro')}
            >
              <Text style={styles.linkText}>
                ¿No tienes cuenta?{'  '}
                <Text style={styles.linkBold}>Regístrate gratis</Text>
              </Text>
            </TouchableOpacity>
          </Animated.View>

          {/* ── Trust strip ── */}
          <Animated.View style={[styles.trustRow, { opacity: fadeAnim }]}>
            <TrustBadge icon="lock-closed" label="Datos seguros" />
            <TrustBadge icon="shield-half"  label="CURP oficial" />
            <TrustBadge icon="medical"      label="IMSS / SSA" />
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const TrustBadge = ({ icon, label }: { icon: keyof typeof Ionicons.glyphMap; label: string }) => (
  <View style={styles.trustBadge}>
    <Ionicons name={icon} size={14} color={colors.secondary[600]} />
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
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 60, paddingBottom: 32 },

  hero: { alignItems: 'center', marginBottom: 32, gap: 10 },
  iconCircle: {
    width: 80, height: 80, borderRadius: 40,
    alignItems: 'center', justifyContent: 'center',
    ...shadows.lg,
    marginBottom: 4,
  },
  title:    { ...typography.h2, color: colors.neutral[900], textAlign: 'center' },
  subtitle: { ...typography.body, color: colors.neutral[500], textAlign: 'center', paddingHorizontal: 8 },

  card: {
    backgroundColor: colors.neutral[0],
    borderRadius: borderRadius['2xl'],
    padding: 24,
    ...shadows.lg,
    marginBottom: 24,
  },

  eyeBtn: { padding: 6 },

  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.status.errorBg,
    borderRadius: borderRadius.md,
    padding: 12,
    marginBottom: 16,
  },
  errorText: { ...typography.bodySmall, color: colors.status.error, flex: 1 },

  btn:    { marginTop: 4 },
  linkBtn: { alignItems: 'center', paddingVertical: 14 },
  linkText: { ...typography.body, color: colors.neutral[500] },
  linkBold: { color: colors.secondary[600], fontWeight: '700' },

  trustRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  trustLabel: { ...typography.caption, color: colors.neutral[400] },
});

import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useMutation } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { InputField, PrimaryButton } from '../../components/ui';
import { colors, typography, borderRadius, shadows } from '../../theme';
import { medicoAuthApi } from '../../api/endpoints/medicoAuth';
import { useMedicoAuth } from '../../context/MedicoAuthContext';
import type { RegistroMedicoScreenProps } from '../../navigation/types';

type RolOption = 'MEDICO' | 'ENFERMERO' | 'ADMIN';

const ROLES: { value: RolOption; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: 'MEDICO',    label: 'Médico',      icon: 'medical' },
  { value: 'ENFERMERO', label: 'Enfermero/a', icon: 'bandage' },
  { value: 'ADMIN',     label: 'Admin',       icon: 'settings' },
];

export const RegistroMedicoScreen: React.FC<RegistroMedicoScreenProps> = ({ navigation }) => {
  const { login } = useMedicoAuth();

  const [form, setForm] = useState({ nombreCompleto: '', cedulaProfesional: '', password: '', confirmPassword: '' });
  const [rol, setRol]           = useState<RolOption>('MEDICO');
  const [showPass, setShowPass] = useState(false);
  const [showConf, setShowConf] = useState(false);

  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 480, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 480, useNativeDriver: true }),
    ]).start();
  }, []);

  const set = (key: keyof typeof form) => (val: string) => setForm(f => ({ ...f, [key]: val }));

  const passError = form.confirmPassword && form.password !== form.confirmPassword
    ? 'Las contraseñas no coinciden' : undefined;

  const cedulaValid = /^\d{7,8}$/.test(form.cedulaProfesional);

  const canSubmit =
    form.nombreCompleto.trim().length >= 3 &&
    cedulaValid &&
    form.password.length >= 8 &&
    !passError;

  const mutation = useMutation({
    mutationFn: () => medicoAuthApi.registro({
      nombreCompleto:    form.nombreCompleto.trim(),
      cedulaProfesional: form.cedulaProfesional,
      password:          form.password,
      rol,
    }),
    onSuccess: async (data) => {
      await login(data);
      Toast.show({
        type: 'success',
        text1: 'Cuenta creada exitosamente',
        text2: `Bienvenido/a al sistema, ${data.nombreCompleto.split(' ')[0]}`,
        visibilityTime: 2500,
      });
    },
    onError: (err: any) => {
      Toast.show({
        type: 'error',
        text1: 'Error al registrar',
        text2: err?.response?.data?.mensaje ?? 'Ocurrió un error. Intenta de nuevo.',
        visibilityTime: 4000,
      });
    },
  });

  const EyePass = (
    <TouchableOpacity onPress={() => setShowPass(v => !v)} style={styles.eyeBtn}>
      <Ionicons name={showPass ? 'eye-off' : 'eye'} size={20} color={colors.neutral[400]} />
    </TouchableOpacity>
  );
  const EyeConf = (
    <TouchableOpacity onPress={() => setShowConf(v => !v)} style={styles.eyeBtn}>
      <Ionicons name={showConf ? 'eye-off' : 'eye'} size={20} color={colors.neutral[400]} />
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={['#E8F4FD', '#EEF6FF', '#FFFFFF']} style={styles.gradient}>
      <KeyboardAwareScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        enableOnAndroid
        extraScrollHeight={24}
      >
        {/* Hero */}
        <Animated.View style={[styles.hero, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <LinearGradient
            colors={[colors.primary[400], colors.primary[700]] as [string, string]}
            style={styles.iconCircle}
          >
            <Ionicons name="person-add" size={32} color="#FFF" />
          </LinearGradient>
          <Text style={styles.title}>Registro de Personal</Text>
          <Text style={styles.subtitle}>Valida tu cédula profesional para acceder</Text>
        </Animated.View>

        {/* Sección 1 — Identidad */}
        <Animated.View style={[styles.section, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <SectionHeader number={1} icon="person" label="Datos personales" />
          <InputField
            label="Nombre completo"
            icon="person-outline"
            placeholder="Nombre(s) y apellidos"
            value={form.nombreCompleto}
            onChangeText={set('nombreCompleto')}
            required
          />
          <InputField
            label="Cédula Profesional"
            icon="card-outline"
            placeholder="7 u 8 dígitos (SEP)"
            value={form.cedulaProfesional}
            onChangeText={set('cedulaProfesional')}
            keyboardType="number-pad"
            maxLength={8}
            required
            error={form.cedulaProfesional && !cedulaValid ? 'Debe tener 7 u 8 dígitos' : undefined}
          />
        </Animated.View>

        {/* Sección 2 — Rol */}
        <Animated.View style={[styles.section, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <SectionHeader number={2} icon="briefcase" label="Rol en el sistema" />
          <View style={styles.rolesRow}>
            {ROLES.map(r => (
              <TouchableOpacity
                key={r.value}
                onPress={() => setRol(r.value)}
                activeOpacity={0.8}
                style={[styles.roleBtn, rol === r.value && styles.roleBtnActive]}
              >
                <Ionicons
                  name={r.icon}
                  size={20}
                  color={rol === r.value ? colors.primary[600] : colors.neutral[400]}
                />
                <Text style={[styles.roleBtnLabel, rol === r.value && styles.roleBtnLabelActive]}>
                  {r.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* Sección 3 — Acceso */}
        <Animated.View style={[styles.section, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <SectionHeader number={3} icon="lock-closed" label="Acceso seguro" />
          <InputField
            label="Contraseña"
            icon="lock-closed-outline"
            placeholder="Mínimo 8 caracteres"
            value={form.password}
            onChangeText={set('password')}
            secureTextEntry={!showPass}
            rightElement={EyePass}
            required
          />
          <InputField
            label="Confirmar contraseña"
            icon="lock-closed-outline"
            placeholder="Repite tu contraseña"
            value={form.confirmPassword}
            onChangeText={set('confirmPassword')}
            secureTextEntry={!showConf}
            rightElement={EyeConf}
            required
            error={passError}
          />
        </Animated.View>

        <PrimaryButton
          title="Crear cuenta"
          onPress={() => mutation.mutate()}
          loading={mutation.isPending}
          disabled={!canSubmit}
          size="large"
          style={styles.btn}
        />

        <TouchableOpacity style={styles.linkBtn} onPress={() => navigation.navigate('LoginMedico')}>
          <Text style={styles.linkText}>
            ¿Ya tienes cuenta?{'  '}
            <Text style={styles.linkBold}>Inicia sesión</Text>
          </Text>
        </TouchableOpacity>
      </KeyboardAwareScrollView>
    </LinearGradient>
  );
};

const SectionHeader = ({
  number, icon, label,
}: { number: number; icon: keyof typeof Ionicons.glyphMap; label: string }) => (
  <View style={shStyles.row}>
    <LinearGradient
      colors={[colors.primary[400], colors.primary[700]] as [string, string]}
      style={shStyles.badge}
    >
      <Text style={shStyles.num}>{number}</Text>
    </LinearGradient>
    <Ionicons name={icon} size={15} color={colors.primary[500]} />
    <Text style={shStyles.label}>{label}</Text>
  </View>
);

const shStyles = StyleSheet.create({
  row:   { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  badge: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  num:   { fontSize: 12, fontWeight: '700', color: '#FFF' },
  label: { ...typography.h4, color: colors.neutral[700] },
});

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  scroll:   { paddingHorizontal: 20, paddingTop: 56, paddingBottom: 36 },

  hero: { alignItems: 'center', marginBottom: 28, gap: 8 },
  iconCircle: {
    width: 72, height: 72, borderRadius: 36,
    alignItems: 'center', justifyContent: 'center',
    ...shadows.lg, marginBottom: 4,
  },
  title:    { ...typography.h2, color: colors.neutral[900], textAlign: 'center' },
  subtitle: { ...typography.body, color: colors.neutral[500], textAlign: 'center' },

  section: {
    backgroundColor: colors.neutral[0],
    borderRadius: borderRadius.xl,
    padding: 20,
    marginBottom: 16,
    ...shadows.sm,
  },

  rolesRow: { flexDirection: 'row', gap: 10 },
  roleBtn: {
    flex: 1, alignItems: 'center', gap: 6, paddingVertical: 14,
    borderRadius: borderRadius.md, borderWidth: 1.5,
    borderColor: colors.neutral[200], backgroundColor: colors.neutral[50],
  },
  roleBtnActive: { borderColor: colors.primary[400], backgroundColor: colors.primary[50] },
  roleBtnLabel: { fontSize: 12, fontWeight: '600', color: colors.neutral[400] },
  roleBtnLabelActive: { color: colors.primary[700] },

  eyeBtn: { padding: 6 },
  btn:    { marginBottom: 12 },
  linkBtn: { alignItems: 'center', paddingVertical: 10 },
  linkText: { ...typography.body, color: colors.neutral[500] },
  linkBold: { color: colors.primary[600], fontWeight: '700' },
});

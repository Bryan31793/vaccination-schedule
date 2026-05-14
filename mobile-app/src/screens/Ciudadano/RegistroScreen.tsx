import React, { useState, useRef, useEffect } from 'react';
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
import { ciudadanoApi } from '../../api/endpoints/ciudadano';
import type { RegistroScreenProps } from '../../navigation/types';

type Sexo = 'H' | 'M' | '';

export const RegistroScreen: React.FC<RegistroScreenProps> = ({ navigation }) => {
  const { login } = useAuth();

  const [form, setForm] = useState({
    curp: '', nombre: '', apellidoPaterno: '', apellidoMaterno: '',
    fechaNacimiento: '', municipio: '', estado: '',
    password: '', confirmPassword: '',
  });
  const [sexo, setSexo]                   = useState<Sexo>('');
  const [showPass, setShowPass]           = useState(false);
  const [showConfirm, setShowConfirm]     = useState(false);
  const [apiError, setApiError]           = useState('');

  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 480, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 480, useNativeDriver: true }),
    ]).start();
  }, []);

  const set = (key: keyof typeof form) => (val: string) => {
    setForm(f => ({ ...f, [key]: val }));
    setApiError('');
  };

  const passError = form.confirmPassword && form.password !== form.confirmPassword
    ? 'Las contraseñas no coinciden' : undefined;

  const curpValid = form.curp.length === 18;
  const fechaValid = /^\d{4}-\d{2}-\d{2}$/.test(form.fechaNacimiento);

  const canSubmit =
    curpValid &&
    form.password.length >= 8 &&
    !passError &&
    form.nombre.trim() &&
    form.apellidoPaterno.trim() &&
    fechaValid &&
    sexo !== '';

  const mutation = useMutation({
    mutationFn: () => {
      if (form.password !== form.confirmPassword) throw new Error('Las contraseñas no coinciden');
      return ciudadanoApi.registro({
        curp:            form.curp.toUpperCase(),
        password:        form.password,
        nombre:          form.nombre.trim(),
        apellidoPaterno: form.apellidoPaterno.trim(),
        apellidoMaterno: form.apellidoMaterno.trim() || undefined,
        fechaNacimiento: form.fechaNacimiento,
        sexo:            sexo as 'H' | 'M',
        municipio:       form.municipio.trim() || undefined,
        estado:          form.estado.trim() || undefined,
      });
    },
    onSuccess: (data) => {
      setApiError('');
      login(data.token, data.curp, data.nombreCompleto);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.mensaje ?? err.message ?? 'Error al registrarse.';
      setApiError(msg);
    },
  });

  const EyePass = (
    <TouchableOpacity onPress={() => setShowPass(v => !v)} style={styles.eyeBtn}>
      <Ionicons name={showPass ? 'eye-off' : 'eye'} size={20} color={colors.neutral[400]} />
    </TouchableOpacity>
  );
  const EyeConfirm = (
    <TouchableOpacity onPress={() => setShowConfirm(v => !v)} style={styles.eyeBtn}>
      <Ionicons name={showConfirm ? 'eye-off' : 'eye'} size={20} color={colors.neutral[400]} />
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={['#E6FAF5', '#F0F9FF', '#FFFFFF']} style={styles.gradient}>
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
              <Ionicons name="person-add" size={32} color="#FFF" />
            </LinearGradient>
            <Text style={styles.title}>Crear cuenta</Text>
            <Text style={styles.subtitle}>Gratis y seguro — solo necesitas tu CURP</Text>
          </Animated.View>

          {/* ── Sección 1: Identidad ── */}
          <Animated.View style={[styles.section, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <SectionHeader icon="card" number={1} label="Identidad oficial" />
            <InputField
              label="CURP"
              icon="card-outline"
              placeholder="18 caracteres"
              value={form.curp}
              onChangeText={set('curp')}
              maxLength={18}
              autoCapitalize="characters"
              required
              error={form.curp.length > 0 && !curpValid ? 'La CURP debe tener exactamente 18 caracteres' : undefined}
            />
            <InputField
              label="Nombre(s)"
              icon="person-outline"
              placeholder="Tus nombres de pila"
              value={form.nombre}
              onChangeText={set('nombre')}
              required
            />
            <InputField
              label="Apellido Paterno"
              icon="people-outline"
              placeholder="Primer apellido"
              value={form.apellidoPaterno}
              onChangeText={set('apellidoPaterno')}
              required
            />
            <InputField
              label="Apellido Materno"
              icon="people-outline"
              placeholder="Segundo apellido (opcional)"
              value={form.apellidoMaterno}
              onChangeText={set('apellidoMaterno')}
            />
          </Animated.View>

          {/* ── Sección 2: Datos demográficos ── */}
          <Animated.View style={[styles.section, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <SectionHeader icon="calendar" number={2} label="Datos personales" />
            <InputField
              label="Fecha de Nacimiento"
              icon="calendar-outline"
              placeholder="YYYY-MM-DD  (ej. 1990-05-20)"
              value={form.fechaNacimiento}
              onChangeText={set('fechaNacimiento')}
              required
              error={form.fechaNacimiento && !fechaValid ? 'Formato: YYYY-MM-DD' : undefined}
            />

            {/* Sexo toggle */}
            <View style={styles.sexoContainer}>
              <Text style={styles.sexoLabel}>
                Sexo <Text style={styles.req}>*</Text>
              </Text>
              <View style={styles.sexoRow}>
                <SexoButton value="H" label="Hombre" selected={sexo === 'H'} onPress={() => setSexo('H')} />
                <SexoButton value="M" label="Mujer"  selected={sexo === 'M'} onPress={() => setSexo('M')} />
              </View>
            </View>

            <InputField
              label="Municipio"
              icon="location-outline"
              placeholder="Tu municipio (opcional)"
              value={form.municipio}
              onChangeText={set('municipio')}
            />
            <InputField
              label="Estado"
              icon="map-outline"
              placeholder="Tu estado (opcional)"
              value={form.estado}
              onChangeText={set('estado')}
            />
          </Animated.View>

          {/* ── Sección 3: Acceso seguro ── */}
          <Animated.View style={[styles.section, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <SectionHeader icon="lock-closed" number={3} label="Acceso seguro" />
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
              label="Confirmar Contraseña"
              icon="lock-closed-outline"
              placeholder="Repite tu contraseña"
              value={form.confirmPassword}
              onChangeText={set('confirmPassword')}
              secureTextEntry={!showConfirm}
              rightElement={EyeConfirm}
              required
              error={passError}
            />
          </Animated.View>

          {/* ── Error API ── */}
          {apiError ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={16} color={colors.status.error} />
              <Text style={styles.errorText}>{apiError}</Text>
            </View>
          ) : null}

          {/* ── CTA ── */}
          <PrimaryButton
            title="Crear mi cuenta"
            onPress={() => mutation.mutate()}
            loading={mutation.isPending}
            disabled={!canSubmit}
            size="large"
            style={styles.btn}
          />

          <TouchableOpacity style={styles.linkBtn} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.linkText}>
              ¿Ya tienes cuenta?{'  '}
              <Text style={styles.linkBold}>Inicia sesión</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const SectionHeader = ({
  icon,
  number,
  label,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  number: number;
  label: string;
}) => (
  <View style={sectionHeaderStyles.row}>
    <LinearGradient
      colors={[colors.secondary[400], colors.secondary[600]] as [string, string]}
      style={sectionHeaderStyles.badge}
    >
      <Text style={sectionHeaderStyles.badgeNum}>{number}</Text>
    </LinearGradient>
    <Ionicons name={icon} size={16} color={colors.secondary[600]} />
    <Text style={sectionHeaderStyles.label}>{label}</Text>
  </View>
);

const sectionHeaderStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  badge: {
    width: 24, height: 24, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  badgeNum: { fontSize: 12, fontWeight: '700', color: '#FFF' },
  label: { ...typography.h4, color: colors.neutral[700] },
});

const SexoButton = ({
  value, label, selected, onPress,
}: {
  value: string; label: string; selected: boolean; onPress: () => void;
}) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.8}
    style={[sexoBtnStyles.btn, selected && sexoBtnStyles.selected]}
  >
    {selected && (
      <Ionicons name="checkmark-circle" size={16} color={colors.secondary[600]} />
    )}
    <Text style={[sexoBtnStyles.label, selected && sexoBtnStyles.labelSelected]}>
      {label}
    </Text>
  </TouchableOpacity>
);

const sexoBtnStyles = StyleSheet.create({
  btn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.neutral[200],
    backgroundColor: colors.neutral[50],
  },
  selected: {
    borderColor: colors.secondary[500],
    backgroundColor: colors.secondary[50],
  },
  label: { ...typography.body, fontWeight: '600', color: colors.neutral[500] },
  labelSelected: { color: colors.secondary[700] },
});

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 52, paddingBottom: 36 },

  hero: { alignItems: 'center', marginBottom: 28, gap: 8 },
  iconCircle: {
    width: 72, height: 72, borderRadius: 36,
    alignItems: 'center', justifyContent: 'center',
    ...shadows.lg,
    marginBottom: 4,
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

  sexoContainer: { marginBottom: 16 },
  sexoLabel: {
    fontSize: 13, fontWeight: '600', color: colors.neutral[600],
    marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5,
  },
  req: { color: colors.status.error },
  sexoRow: { flexDirection: 'row', gap: 12 },

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

  btn:     { marginBottom: 12 },
  linkBtn: { alignItems: 'center', paddingVertical: 10 },
  linkText: { ...typography.body, color: colors.neutral[500] },
  linkBold: { color: colors.secondary[600], fontWeight: '700' },
});

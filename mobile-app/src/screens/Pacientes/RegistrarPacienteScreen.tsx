import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ScreenWrapper, InputField, PrimaryButton, GlassCard } from '../../components/ui';
import { pacientesApi } from '../../api/endpoints/pacientes';
import { colors, typography } from '../../theme';
import type { RegistrarPacienteScreenProps } from '../../navigation/types';
import type { RegistrarPacienteRequest } from '../../types';

export const RegistrarPacienteScreen: React.FC<RegistrarPacienteScreenProps> = ({
  navigation,
}) => {
  const queryClient = useQueryClient();

  const [form, setForm] = useState<RegistrarPacienteRequest>({
    curp: '',
    nombre: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    fechaNacimiento: '',
    sexo: 'H',
    municipio: '',
    estado: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof RegistrarPacienteRequest, string>>>({});

  const mutation = useMutation({
    mutationFn: pacientesApi.registrar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pacientes'] });
      Alert.alert(
        '✅ Paciente Registrado',
        'El paciente se ha registrado exitosamente.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    },
    onError: (error: any) => {
      Alert.alert(
        'Error',
        error.response?.data?.mensaje || 'Ocurrió un error al registrar el paciente.'
      );
    },
  });

  const validate = (): boolean => {
    const newErrors: typeof errors = {};
    if (form.curp.length !== 18) newErrors.curp = 'La CURP debe tener 18 caracteres';
    if (!form.nombre.trim()) newErrors.nombre = 'El nombre es obligatorio';
    if (!form.apellidoPaterno.trim()) newErrors.apellidoPaterno = 'El apellido paterno es obligatorio';
    if (!form.fechaNacimiento.match(/^\d{4}-\d{2}-\d{2}$/))
      newErrors.fechaNacimiento = 'Formato: AAAA-MM-DD';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      mutation.mutate(form);
    }
  };

  const updateField = (key: keyof RegistrarPacienteRequest, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  return (
    <ScreenWrapper>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Registrar Paciente</Text>
          <Text style={styles.subtitle}>
            Completa los datos del nuevo paciente
          </Text>

          <GlassCard variant="elevated" style={styles.formCard}>
            <InputField
              label="CURP"
              icon="card"
              placeholder="18 caracteres"
              value={form.curp}
              onChangeText={(v) => updateField('curp', v.toUpperCase())}
              maxLength={18}
              autoCapitalize="characters"
              error={errors.curp}
              required
            />
            <InputField
              label="Nombre"
              icon="person"
              placeholder="Nombre(s)"
              value={form.nombre}
              onChangeText={(v) => updateField('nombre', v)}
              error={errors.nombre}
              required
            />
            <InputField
              label="Apellido Paterno"
              icon="person"
              placeholder="Apellido paterno"
              value={form.apellidoPaterno}
              onChangeText={(v) => updateField('apellidoPaterno', v)}
              error={errors.apellidoPaterno}
              required
            />
            <InputField
              label="Apellido Materno"
              icon="person"
              placeholder="Apellido materno (opcional)"
              value={form.apellidoMaterno}
              onChangeText={(v) => updateField('apellidoMaterno', v)}
            />
            <InputField
              label="Fecha de Nacimiento"
              icon="calendar"
              placeholder="AAAA-MM-DD"
              value={form.fechaNacimiento}
              onChangeText={(v) => updateField('fechaNacimiento', v)}
              error={errors.fechaNacimiento}
              required
            />

            {/* Sexo Toggle */}
            <Text style={styles.fieldLabel}>SEXO *</Text>
            <View style={styles.sexToggle}>
              <TouchableOpacity
                style={[
                  styles.sexOption,
                  form.sexo === 'H' && styles.sexOptionActive,
                ]}
                onPress={() => updateField('sexo', 'H')}
              >
                <Ionicons
                  name="man"
                  size={20}
                  color={form.sexo === 'H' ? '#FFF' : colors.primary[500]}
                />
                <Text
                  style={[
                    styles.sexLabel,
                    form.sexo === 'H' && styles.sexLabelActive,
                  ]}
                >
                  Hombre
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.sexOption,
                  form.sexo === 'M' && styles.sexOptionActiveF,
                ]}
                onPress={() => updateField('sexo', 'M')}
              >
                <Ionicons
                  name="woman"
                  size={20}
                  color={form.sexo === 'M' ? '#FFF' : colors.accent.coral}
                />
                <Text
                  style={[
                    styles.sexLabel,
                    form.sexo === 'M' && styles.sexLabelActive,
                  ]}
                >
                  Mujer
                </Text>
              </TouchableOpacity>
            </View>

            <InputField
              label="Municipio"
              icon="location"
              placeholder="Municipio"
              value={form.municipio}
              onChangeText={(v) => updateField('municipio', v)}
            />
            <InputField
              label="Estado"
              icon="map"
              placeholder="Estado"
              value={form.estado}
              onChangeText={(v) => updateField('estado', v)}
            />
          </GlassCard>

          <PrimaryButton
            title="Registrar Paciente"
            onPress={handleSubmit}
            loading={mutation.isPending}
            size="large"
            icon={<Ionicons name="checkmark-circle" size={20} color="#FFF" />}
            style={{ marginTop: 8 }}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 100 },
  title: { ...typography.h2, marginBottom: 4 },
  subtitle: { ...typography.body, color: colors.neutral[500], marginBottom: 20 },
  formCard: { padding: 20 },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.neutral[600],
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sexToggle: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  sexOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.neutral[200],
    backgroundColor: colors.neutral[50],
  },
  sexOptionActive: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  sexOptionActiveF: {
    backgroundColor: colors.accent.coral,
    borderColor: colors.accent.coral,
  },
  sexLabel: { fontSize: 14, fontWeight: '600', color: colors.neutral[600] },
  sexLabelActive: { color: '#FFF' },
});

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ScreenWrapper,
  InputField,
  PrimaryButton,
  GlassCard,
} from '../../components/ui';
import { vacunasApi } from '../../api/endpoints/vacunas';
import { vacunacionesApi } from '../../api/endpoints/vacunaciones';
import { colors, typography, borderRadius, shadows } from '../../theme';
import type { VacunarScreenProps } from '../../navigation/types';
import type { AplicarVacunaRequest, VacunaResponse } from '../../types';

export const VacunarScreen: React.FC<VacunarScreenProps> = () => {
  const [form, setForm] = useState<AplicarVacunaRequest>({
    curpPaciente: '',
    vacunaId: '',
    numeroDosis: 1,
    lote: '',
    unidadAplicadora: '',
    observaciones: '',
  });

  const [selectedVacuna, setSelectedVacuna] = useState<VacunaResponse | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof AplicarVacunaRequest, string>>>({});

  const { data: vacunas = [] } = useQuery({
    queryKey: ['vacunas'],
    queryFn: vacunasApi.listar,
  });

  const mutation = useMutation({
    mutationFn: vacunacionesApi.aplicar,
    onSuccess: () => {
      setShowSuccess(true);
    },
    onError: (error: any) => {
      Alert.alert(
        'Error',
        error.response?.data?.mensaje || 'Error al registrar la vacunación.'
      );
    },
  });

  const validate = () => {
    const e: typeof errors = {};
    if (!form.curpPaciente.trim()) e.curpPaciente = 'CURP es obligatorio';
    if (!form.vacunaId) e.vacunaId = 'Selecciona una vacuna';
    if (form.numeroDosis < 1) e.numeroDosis = 'Mínimo 1 dosis';
    if (!form.lote.trim()) e.lote = 'Lote es obligatorio';
    if (!form.unidadAplicadora.trim()) e.unidadAplicadora = 'Unidad es obligatoria';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) mutation.mutate(form);
  };

  const resetForm = () => {
    setForm({
      curpPaciente: '',
      vacunaId: '',
      numeroDosis: 1,
      lote: '',
      unidadAplicadora: '',
      observaciones: '',
    });
    setSelectedVacuna(null);
    setShowSuccess(false);
    setErrors({});
  };

  const updateField = (key: keyof AplicarVacunaRequest, value: string | number) => {
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
          <Text style={styles.title}>Aplicar Vacuna</Text>
          <Text style={styles.subtitle}>
            Registra una nueva aplicación de vacuna
          </Text>

          <GlassCard variant="elevated" style={styles.formCard}>
            <InputField
              label="CURP del Paciente"
              icon="card"
              placeholder="CURP (18 caracteres)"
              value={form.curpPaciente}
              onChangeText={(v) => updateField('curpPaciente', v.toUpperCase())}
              maxLength={18}
              autoCapitalize="characters"
              error={errors.curpPaciente}
              required
            />

            {/* Vaccine Selector */}
            <Text style={styles.fieldLabel}>VACUNA *</Text>
            <TouchableOpacity
              style={[
                styles.pickerBtn,
                errors.vacunaId ? styles.pickerBtnError : {},
              ]}
              onPress={() => setShowPicker(true)}
            >
              <Ionicons name="medical" size={20} color={colors.neutral[400]} />
              <Text
                style={[
                  styles.pickerText,
                  !selectedVacuna && { color: colors.neutral[400] },
                ]}
              >
                {selectedVacuna
                  ? `${selectedVacuna.nombre} (${selectedVacuna.fabricante})`
                  : 'Seleccionar vacuna...'}
              </Text>
              <Ionicons
                name="chevron-down"
                size={20}
                color={colors.neutral[400]}
              />
            </TouchableOpacity>
            {errors.vacunaId && (
              <Text style={styles.errorText}>{errors.vacunaId}</Text>
            )}

            <InputField
              label="Número de Dosis"
              icon="layers"
              placeholder="1"
              value={String(form.numeroDosis)}
              onChangeText={(v) => updateField('numeroDosis', parseInt(v) || 1)}
              keyboardType="numeric"
              error={errors.numeroDosis}
              required
            />
            <InputField
              label="Lote"
              icon="barcode"
              placeholder="Número de lote"
              value={form.lote}
              onChangeText={(v) => updateField('lote', v)}
              error={errors.lote}
              required
            />
            <InputField
              label="Unidad Aplicadora"
              icon="business"
              placeholder="Centro de salud, hospital..."
              value={form.unidadAplicadora}
              onChangeText={(v) => updateField('unidadAplicadora', v)}
              error={errors.unidadAplicadora}
              required
            />
            <InputField
              label="Observaciones"
              icon="chatbubble"
              placeholder="Notas adicionales (opcional)"
              value={form.observaciones || ''}
              onChangeText={(v) => updateField('observaciones', v)}
              multiline
              numberOfLines={3}
            />
          </GlassCard>

          <PrimaryButton
            title="Registrar Vacunación"
            onPress={handleSubmit}
            loading={mutation.isPending}
            size="large"
            icon={<Ionicons name="checkmark-done" size={20} color="#FFF" />}
            style={{ marginTop: 8 }}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Vaccine Picker Modal */}
      <Modal visible={showPicker} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seleccionar Vacuna</Text>
              <TouchableOpacity onPress={() => setShowPicker(false)}>
                <Ionicons name="close" size={24} color={colors.neutral[500]} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalList}>
              {vacunas.map((v) => (
                <TouchableOpacity
                  key={v.id}
                  style={[
                    styles.modalItem,
                    selectedVacuna?.id === v.id && styles.modalItemActive,
                  ]}
                  onPress={() => {
                    setSelectedVacuna(v);
                    updateField('vacunaId', v.id);
                    setShowPicker(false);
                  }}
                >
                  <View>
                    <Text style={styles.modalItemName}>{v.nombre}</Text>
                    <Text style={styles.modalItemDetail}>
                      {v.fabricante} • {v.numeroDosis} dosis •{' '}
                      {v.categoria.replace('_', ' ')}
                    </Text>
                  </View>
                  {selectedVacuna?.id === v.id && (
                    <Ionicons
                      name="checkmark-circle"
                      size={22}
                      color={colors.primary[500]}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal visible={showSuccess} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.successModal}>
            <LinearGradient
              colors={colors.gradients.success as unknown as [string, string]}
              style={styles.successIcon}
            >
              <Ionicons name="checkmark" size={48} color="#FFF" />
            </LinearGradient>
            <Text style={styles.successTitle}>¡Vacuna Registrada!</Text>
            <Text style={styles.successText}>
              La vacunación se ha registrado exitosamente en el sistema.
            </Text>
            <PrimaryButton
              title="Registrar Otra"
              onPress={resetForm}
              style={{ marginTop: 16, width: '100%' }}
            />
            <PrimaryButton
              title="Cerrar"
              variant="ghost"
              onPress={resetForm}
              style={{ marginTop: 8 }}
            />
          </View>
        </View>
      </Modal>
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
    fontSize: 13, fontWeight: '600', color: colors.neutral[600],
    marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5,
  },
  pickerBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: colors.neutral[50], borderRadius: borderRadius.md,
    borderWidth: 1.5, borderColor: colors.neutral[200],
    paddingHorizontal: 14, paddingVertical: 14, marginBottom: 16,
  },
  pickerBtnError: { borderColor: colors.status.error },
  pickerText: { flex: 1, fontSize: 15, color: colors.neutral[800] },
  errorText: { fontSize: 12, color: colors.status.error, marginTop: -12, marginBottom: 12 },
  // Modal
  modalOverlay: {
    flex: 1, backgroundColor: colors.background.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    maxHeight: '70%', padding: 20,
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: { ...typography.h3 },
  modalList: {},
  modalItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.neutral[100],
  },
  modalItemActive: { backgroundColor: colors.primary[50], borderRadius: 8, paddingHorizontal: 8 },
  modalItemName: { ...typography.h4, fontSize: 15 },
  modalItemDetail: { ...typography.caption, marginTop: 2 },
  // Success
  successModal: {
    backgroundColor: '#FFF', borderRadius: 24, margin: 32, padding: 32,
    alignItems: 'center', ...shadows.lg,
  },
  successIcon: {
    width: 80, height: 80, borderRadius: 40,
    alignItems: 'center', justifyContent: 'center', marginBottom: 20,
  },
  successTitle: { ...typography.h2, textAlign: 'center' },
  successText: {
    ...typography.body, color: colors.neutral[500],
    textAlign: 'center', marginTop: 8,
  },
});

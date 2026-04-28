/**
 * Paleta de colores premium — inspirada en un sistema de salud moderno.
 * Tonos azules médicos, acentos verde agua y coral para alertas.
 */
export const colors = {
  // ── Primarios ───────────────────────────────────────────────────────
  primary: {
    50: '#E8F4FD',
    100: '#BDE0F7',
    200: '#91CBF1',
    300: '#65B6EB',
    400: '#3AA1E5',
    500: '#1A8AD4', // Principal
    600: '#146DAA',
    700: '#0F5080',
    800: '#093456',
    900: '#04182C',
  },

  // ── Secundarios (Verde Agua / Teal) ─────────────────────────────────
  secondary: {
    50: '#E6FAF5',
    100: '#B3F0E0',
    200: '#80E6CB',
    300: '#4DDCB6',
    400: '#1AD2A1',
    500: '#0FBE8F', // Principal
    600: '#0C9872',
    700: '#097256',
    800: '#064C39',
    900: '#03261D',
  },

  // ── Acentos ─────────────────────────────────────────────────────────
  accent: {
    coral: '#FF6B6B',
    coralLight: '#FFA0A0',
    amber: '#FFB347',
    amberLight: '#FFD699',
    purple: '#A78BFA',
    purpleLight: '#C4B5FD',
  },

  // ── Estados ─────────────────────────────────────────────────────────
  status: {
    success: '#10B981',
    successBg: '#D1FAE5',
    warning: '#F59E0B',
    warningBg: '#FEF3C7',
    error: '#EF4444',
    errorBg: '#FEE2E2',
    info: '#3B82F6',
    infoBg: '#DBEAFE',
  },

  // ── Niveles de Alerta de Brote ──────────────────────────────────────
  alerta: {
    informativo: '#3B82F6',
    informativoBg: '#DBEAFE',
    moderado: '#F59E0B',
    moderadoBg: '#FEF3C7',
    critico: '#EF4444',
    criticoBg: '#FEE2E2',
  },

  // ── Neutrales ───────────────────────────────────────────────────────
  neutral: {
    0: '#FFFFFF',
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
    950: '#020617',
  },

  // ── Fondos ──────────────────────────────────────────────────────────
  background: {
    primary: '#F0F6FF',
    secondary: '#FFFFFF',
    card: 'rgba(255, 255, 255, 0.85)',
    cardBorder: 'rgba(255, 255, 255, 0.25)',
    overlay: 'rgba(15, 23, 42, 0.5)',
  },

  // ── Gradientes (arrays de colores para LinearGradient) ──────────────
  gradients: {
    primary: ['#1A8AD4', '#0FBE8F'],
    header: ['#0F5080', '#1A8AD4'],
    card: ['rgba(255,255,255,0.95)', 'rgba(248,250,252,0.9)'],
    alertCritico: ['#EF4444', '#DC2626'],
    alertModerado: ['#F59E0B', '#D97706'],
    success: ['#10B981', '#059669'],
  },
} as const;

export type Colors = typeof colors;

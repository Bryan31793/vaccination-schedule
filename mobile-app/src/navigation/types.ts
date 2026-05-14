import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type {
  CompositeScreenProps,
  NavigatorScreenParams,
} from '@react-navigation/native';

// ── Portal Médico — Auth Stack ────────────────────────────────────────────
export type MedicoAuthParamList = {
  LoginMedico: undefined;
  RegistroMedico: undefined;
};

export type LoginMedicoScreenProps    = NativeStackScreenProps<MedicoAuthParamList, 'LoginMedico'>;
export type RegistroMedicoScreenProps = NativeStackScreenProps<MedicoAuthParamList, 'RegistroMedico'>;

// ── Portal del Ciudadano — Auth Stack ─────────────────────────────────────
export type CiudadanoAuthParamList = {
  Login: undefined;
  Registro: undefined;
};

// ── Portal del Ciudadano — Tab Navigator ──────────────────────────────────
export type CiudadanoTabParamList = {
  MiSalud: undefined;
  MiCartilla: undefined;
  AsistenteCiudadano: undefined;
};

export type LoginScreenProps    = NativeStackScreenProps<CiudadanoAuthParamList, 'Login'>;
export type RegistroScreenProps = NativeStackScreenProps<CiudadanoAuthParamList, 'Registro'>;

export type MiSaludScreenProps       = BottomTabScreenProps<CiudadanoTabParamList, 'MiSalud'>;
export type MiCartillaScreenProps    = BottomTabScreenProps<CiudadanoTabParamList, 'MiCartilla'>;
export type AsistenteCiudadanoProps  = BottomTabScreenProps<CiudadanoTabParamList, 'AsistenteCiudadano'>;

// ── Stack de Home ─────────────────────────────────────────────────
export type HomeStackParamList = {
  HomeMain: undefined;
  Chatbot: undefined;
  Perfil: undefined;
};

// ── Stack de Pacientes ────────────────────────────────────────────
export type PacientesStackParamList = {
  PacientesList: undefined;
  PacienteDetalle: { curp: string };
  RegistrarPaciente: undefined;
};

// ── Stack de Brotes ───────────────────────────────────────────────
export type BrotesStackParamList = {
  BrotesList: undefined;
  AsistenteIA: { curp?: string };
};

// ── Bottom Tabs ───────────────────────────────────────────────────
export type RootTabParamList = {
  Home: NavigatorScreenParams<HomeStackParamList>;
  Pacientes: NavigatorScreenParams<PacientesStackParamList>;
  Vacunar: undefined;
  Brotes: NavigatorScreenParams<BrotesStackParamList>;
  Simulacion: undefined;
};

// ── Screen Props helpers ──────────────────────────────────────────
export type VacunarScreenProps    = BottomTabScreenProps<RootTabParamList, 'Vacunar'>;
export type SimulacionScreenProps = BottomTabScreenProps<RootTabParamList, 'Simulacion'>;
export type PerfilScreenProps     = NativeStackScreenProps<HomeStackParamList, 'Perfil'>;

export type HomeScreenProps = CompositeScreenProps<
  NativeStackScreenProps<HomeStackParamList, 'HomeMain'>,
  BottomTabScreenProps<RootTabParamList>
>;

export type ChatbotScreenProps = CompositeScreenProps<
  NativeStackScreenProps<HomeStackParamList, 'Chatbot'>,
  BottomTabScreenProps<RootTabParamList>
>;

export type PacientesListScreenProps = CompositeScreenProps<
  NativeStackScreenProps<PacientesStackParamList, 'PacientesList'>,
  BottomTabScreenProps<RootTabParamList>
>;

export type PacienteDetalleScreenProps = CompositeScreenProps<
  NativeStackScreenProps<PacientesStackParamList, 'PacienteDetalle'>,
  BottomTabScreenProps<RootTabParamList>
>;

export type RegistrarPacienteScreenProps = CompositeScreenProps<
  NativeStackScreenProps<PacientesStackParamList, 'RegistrarPaciente'>,
  BottomTabScreenProps<RootTabParamList>
>;

export type BrotesListScreenProps = CompositeScreenProps<
  NativeStackScreenProps<BrotesStackParamList, 'BrotesList'>,
  BottomTabScreenProps<RootTabParamList>
>;

export type AsistenteIAScreenProps = CompositeScreenProps<
  NativeStackScreenProps<BrotesStackParamList, 'AsistenteIA'>,
  BottomTabScreenProps<RootTabParamList>
>;

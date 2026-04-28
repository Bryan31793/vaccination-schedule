// ═══════════════════════════════════════════════════════════════════
// TypeScript interfaces que replican los DTOs del backend Spring Boot
// ═══════════════════════════════════════════════════════════════════

// ── Enums ──────────────────────────────────────────────────────────

export enum VacunaCategoria {
  INFLUENZA = 'INFLUENZA',
  COVID19 = 'COVID19',
  HEPATITIS_B = 'HEPATITIS_B',
  HEPATITIS_A = 'HEPATITIS_A',
  TETANOS_DIFTERIA = 'TETANOS_DIFTERIA',
  NEUMOCOCO = 'NEUMOCOCO',
  VPH = 'VPH',
  FIEBRE_AMARILLA = 'FIEBRE_AMARILLA',
  MENINGOCOCO = 'MENINGOCOCO',
  SARAMPION_RUBEOLA_PAPERAS = 'SARAMPION_RUBEOLA_PAPERAS',
}

export enum NivelAlerta {
  INFORMATIVO = 'INFORMATIVO',
  MODERADO = 'MODERADO',
  CRITICO = 'CRITICO',
}

export enum EstadoRegistro {
  PENDIENTE = 'PENDIENTE',
  APLICADA = 'APLICADA',
  CANCELADA = 'CANCELADA',
}

// ── Response DTOs ──────────────────────────────────────────────────

export interface PacienteResponse {
  id: string;
  curp: string;
  nombreCompleto: string;
  fechaNacimiento: string;
  edad: number;
  sexo: string;
  municipio: string;
  estado: string;
}

export interface VacunaResponse {
  id: string;
  nombre: string;
  fabricante: string;
  categoria: VacunaCategoria;
  numeroDosis: number;
  descripcion: string;
  requiereRefuerzo: boolean;
}

export interface RegistroVacunacionResponse {
  id: string;
  vacunaNombre: string;
  categoria: VacunaCategoria;
  numeroDosis: number;
  lote: string;
  unidadAplicadora: string;
  fechaAplicacion: string;
  estado: EstadoRegistro;
  observaciones: string;
}

export interface HistorialResponse {
  paciente: PacienteResponse;
  vacunasAplicadas: RegistroVacunacionResponse[];
  vacunasPendientes: VacunaResponse[];
  totalAplicadas: number;
  totalPendientes: number;
}

export interface AlertaBroteResponse {
  id: string;
  categoriaVacuna: VacunaCategoria;
  region: string;
  casosDetectados: number;
  umbralActivacion: number;
  nivel: NivelAlerta;
  fechaDeteccion: string;
  atendida: boolean;
}

export interface LlmRespuestaResponse {
  curpPaciente: string;
  pregunta: string;
  respuesta: string;
  generadaPorIa: boolean;
}

export interface ErrorResponse {
  status: number;
  codigo: string;
  mensaje: string;
  timestamp: string;
}

// ── Request DTOs ───────────────────────────────────────────────────

export interface RegistrarPacienteRequest {
  curp: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno?: string;
  fechaNacimiento: string; // ISO date string YYYY-MM-DD
  sexo: 'H' | 'M';
  municipio?: string;
  estado?: string;
}

export interface AplicarVacunaRequest {
  curpPaciente: string;
  vacunaId: string;
  numeroDosis: number;
  lote: string;
  unidadAplicadora: string;
  observaciones?: string;
}

export interface DetectarBrotesRequest {
  region: string;
  categoriaVacuna: VacunaCategoria;
  umbral: number;
}

export interface ConsultaLlmRequest {
  curpPaciente: string;
  pregunta: string;
}

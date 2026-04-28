package mx.salud.vacunacion.presentation.dto;

import jakarta.validation.constraints.*;
import mx.salud.vacunacion.domain.model.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * DTOs de Request y Response para la capa de presentación.
 * Desacoplan el contrato HTTP del modelo de dominio.
 */
public final class Dtos {

    private Dtos() {}

    // ════════════════════════════════════════════════════════════════════
    // REQUEST DTOs
    // ════════════════════════════════════════════════════════════════════

    public record RegistrarPacienteRequest(
            @NotBlank @Size(min = 18, max = 18, message = "La CURP debe tener exactamente 18 caracteres")
            String curp,

            @NotBlank String nombre,
            @NotBlank String apellidoPaterno,
                      String apellidoMaterno,

            @NotNull @Past(message = "La fecha de nacimiento debe ser en el pasado")
            LocalDate fechaNacimiento,

            @Pattern(regexp = "[HM]", message = "Sexo debe ser H o M")
            String sexo,

            String municipio,
            String estado
    ) {}

    public record AplicarVacunaRequest(
            @NotBlank String curpPaciente,
            @NotBlank String vacunaId,

            @Min(1) int numeroDosis,

            @NotBlank String lote,
            @NotBlank String unidadAplicadora,
                      String observaciones
    ) {}

    public record DetectarBrotesRequest(
            @NotBlank String region,
            @NotNull  Vacuna.Categoria categoriaVacuna,
            @Min(1)   int umbral
    ) {}

    public record ConsultaLlmRequest(
            @NotBlank String curpPaciente,
            @NotBlank @Size(max = 500) String pregunta
    ) {}

    // ════════════════════════════════════════════════════════════════════
    // RESPONSE DTOs
    // ════════════════════════════════════════════════════════════════════

    public record PacienteResponse(
            String id,
            String curp,
            String nombreCompleto,
            LocalDate fechaNacimiento,
            int edad,
            String sexo,
            String municipio,
            String estado
    ) {
        public static PacienteResponse fromDomain(Paciente p) {
            return new PacienteResponse(
                    p.getId(), p.getCurp(), p.nombreCompleto(),
                    p.getFechaNacimiento(), p.calcularEdad(),
                    p.getSexo(), p.getMunicipio(), p.getEstado());
        }
    }

    public record VacunaResponse(
            String id,
            String nombre,
            String fabricante,
            Vacuna.Categoria categoria,
            int numeroDosis,
            String descripcion,
            boolean requiereRefuerzo
    ) {
        public static VacunaResponse fromDomain(Vacuna v) {
            return new VacunaResponse(
                    v.getId(), v.getNombre(), v.getFabricante(),
                    v.getCategoria(), v.getNumeroDosis(),
                    v.getDescripcion(), v.requiereRefuerzo());
        }
    }

    public record RegistroVacunacionResponse(
            String id,
            String vacunaNombre,
            Vacuna.Categoria categoria,
            int numeroDosis,
            String lote,
            String unidadAplicadora,
            LocalDateTime fechaAplicacion,
            RegistroVacunacion.EstadoRegistro estado,
            String observaciones
    ) {
        public static RegistroVacunacionResponse fromDomain(RegistroVacunacion r) {
            return new RegistroVacunacionResponse(
                    r.getId(),
                    r.getVacuna().getNombre(),
                    r.getVacuna().getCategoria(),
                    r.getNumeroDosis(),
                    r.getLote(),
                    r.getUnidadAplicadora(),
                    r.getFechaAplicacion(),
                    r.getEstado(),
                    r.getObservaciones());
        }
    }

    public record HistorialResponse(
            PacienteResponse paciente,
            List<RegistroVacunacionResponse> vacunasAplicadas,
            List<VacunaResponse> vacunasPendientes,
            int totalAplicadas,
            int totalPendientes
    ) {}

    public record AlertaBroteResponse(
            String id,
            Vacuna.Categoria categoriaVacuna,
            String region,
            int casosDetectados,
            int umbralActivacion,
            AlertaBrote.NivelAlerta nivel,
            LocalDateTime fechaDeteccion,
            boolean atendida
    ) {
        public static AlertaBroteResponse fromDomain(AlertaBrote a) {
            return new AlertaBroteResponse(
                    a.getId(),
                    a.getCategoriaVacuna(),
                    a.getRegion(),
                    a.getCasosDetectados(),
                    a.getUmbralActivacion(),
                    a.getNivel(),
                    a.getFechaDeteccion(),
                    a.isAtendida());
        }
    }

    public record LlmRespuestaResponse(
            String curpPaciente,
            String pregunta,
            String respuesta,
            boolean generadaPorIa
    ) {}

    public record ErrorResponse(
            int status,
            String codigo,
            String mensaje,
            LocalDateTime timestamp
    ) {
        public static ErrorResponse of(int status, String codigo, String mensaje) {
            return new ErrorResponse(status, codigo, mensaje, LocalDateTime.now());
        }
    }
}

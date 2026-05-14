package mx.salud.vacunacion.domain.service;

/**
 * Excepción de dominio base. Las subcategorías permiten mapear respuestas HTTP distintas
 * sin que el dominio conozca el protocolo HTTP.
 */
public class VacunacionException extends RuntimeException {

    public enum Codigo {
        PACIENTE_NO_ENCONTRADO,
        VACUNA_NO_ENCONTRADA,
        REGISTRO_DUPLICADO,
        DOSIS_INVALIDA,
        VALIDACION_COFEPRIS_FALLIDA,
        BROTE_YA_ATENDIDO,
        CIUDADANO_YA_REGISTRADO,
        CREDENCIALES_INVALIDAS,
        ERROR_INTERNO
    }

    private final Codigo codigo;

    public VacunacionException(Codigo codigo, String mensaje) {
        super(mensaje);
        this.codigo = codigo;
    }

    public VacunacionException(Codigo codigo, String mensaje, Throwable causa) {
        super(mensaje, causa);
        this.codigo = codigo;
    }

    public Codigo getCodigo() { return codigo; }

    // ── Subclases de conveniencia ─────────────────────────────────────────────

    public static class PacienteNoEncontrado extends VacunacionException {
        public PacienteNoEncontrado(String curp) {
            super(Codigo.PACIENTE_NO_ENCONTRADO, "Paciente no encontrado con CURP: " + curp);
        }
    }

    public static class VacunaNoEncontrada extends VacunacionException {
        public VacunaNoEncontrada(String id) {
            super(Codigo.VACUNA_NO_ENCONTRADA, "Vacuna no encontrada con ID: " + id);
        }
    }

    public static class RegistroDuplicado extends VacunacionException {
        public RegistroDuplicado(String curp, String vacunaId, int dosis) {
            super(Codigo.REGISTRO_DUPLICADO,
                    "El paciente %s ya tiene registrada la dosis %d de la vacuna %s".formatted(curp, dosis, vacunaId));
        }
    }

    public static class ValidacionCofeprisFallida extends VacunacionException {
        public ValidacionCofeprisFallida(String motivo) {
            super(Codigo.VALIDACION_COFEPRIS_FALLIDA, "Validación COFEPRIS fallida: " + motivo);
        }
    }
}

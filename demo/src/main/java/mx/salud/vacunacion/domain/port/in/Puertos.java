package mx.salud.vacunacion.domain.port.in;

import mx.salud.vacunacion.domain.model.AlertaBrote;
import mx.salud.vacunacion.domain.model.Paciente;
import mx.salud.vacunacion.domain.model.RegistroVacunacion;
import mx.salud.vacunacion.domain.model.Vacuna;

import java.util.List;
import java.util.Optional;

/**
 * Puertos de entrada (driving ports).
 * Cada interfaz representa un caso de uso del sistema. La capa de aplicación
 * los implementa; la capa de presentación los consume.
 */
public final class Puertos {

    private Puertos() {}

    // ── 1. Registrar Paciente ─────────────────────────────────────────────────

    public interface RegistrarPaciente {
        record Comando(String curp, String nombre, String apellidoPaterno,
                       String apellidoMaterno, String fechaNacimiento,
                       String sexo, String municipio, String estado) {}

        Paciente ejecutar(Comando comando);
    }

    // ── 2. Consultar Paciente ─────────────────────────────────────────────────

    public interface ConsultarPaciente {
        Optional<Paciente> porCurp(String curp);
        Optional<Paciente> porId(String id);
        List<Paciente> todos();
    }

    // ── 3. Consultar Historial de Vacunación ─────────────────────────────────

    public interface ConsultarHistorial {
        record HistorialPaciente(Paciente paciente, List<RegistroVacunacion> registros,
                                 List<Vacuna> vacunasPendientes) {}

        HistorialPaciente porCurp(String curp);
    }

    // ── 4. Aplicar Vacuna ─────────────────────────────────────────────────────

    public interface AplicarVacuna {
        record Comando(String curpPaciente, String vacunaId, int numeroDosis,
                       String lote, String unidadAplicadora, String observaciones) {}

        RegistroVacunacion ejecutar(Comando comando);
    }

    // ── 5. Detectar Brotes ────────────────────────────────────────────────────

    public interface DetectarBrotes {
        record Comando(String region, Vacuna.Categoria categoriaVacuna, int umbral) {}

        List<AlertaBrote> analizar(Comando comando);
        List<AlertaBrote> alertasActivas();
    }

    // ── 6. Consultar LLM (lenguaje natural, específico por paciente) ─────────

    public interface ConsultarLlm {
        record Pregunta(String curpPaciente, String textoPregunta) {}
        record Respuesta(String texto, boolean generadaPorIa) {}

        Respuesta consultar(Pregunta pregunta);
    }

    // ── 7. Ejecutar Simulación Epidemiológica ─────────────────────────────────

    public interface EjecutarSimulacion {
        void ejecutar();
        byte[] obtenerVideo();
    }

    // ── 8. Chatbot General (SQL + IA, sin necesidad de CURP) ─────────────────

    public interface ConsultarChatbot {
        record Mensaje(String texto) {}
        record Respuesta(String texto) {}

        Respuesta procesar(Mensaje mensaje);
    }
}

package mx.salud.vacunacion.domain.port.out;

import mx.salud.vacunacion.domain.model.AlertaBrote;
import mx.salud.vacunacion.domain.model.Paciente;
import mx.salud.vacunacion.domain.model.RegistroVacunacion;
import mx.salud.vacunacion.domain.model.Vacuna;
import mx.salud.vacunacion.domain.event.BroteDetectadoEvent;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Puertos de salida (driven ports).
 * Definen lo que el dominio necesita del mundo exterior (BD, APIs, mensajería).
 * La infraestructura provee las implementaciones concretas.
 */
public final class Repositorios {

    private Repositorios() {}

    // ── 1. Repositorio de Pacientes ───────────────────────────────────────────

    public interface PacienteRepository {
        Paciente guardar(Paciente paciente);
        Optional<Paciente> buscarPorCurp(String curp);
        Optional<Paciente> buscarPorId(String id);
        List<Paciente> buscarTodos();
        boolean existePorCurp(String curp);
    }

    // ── 2. Repositorio de Vacunas (catálogo) ──────────────────────────────────

    public interface VacunaRepository {
        Vacuna guardar(Vacuna vacuna);
        Optional<Vacuna> buscarPorId(String id);
        List<Vacuna> buscarTodas();
        List<Vacuna> buscarPorCategoria(Vacuna.Categoria categoria);
    }

    // ── 3. Repositorio de Registros de Vacunación ─────────────────────────────

    public interface RegistroVacunacionRepository {
        RegistroVacunacion guardar(RegistroVacunacion registro);
        Optional<RegistroVacunacion> buscarPorId(String id);
        List<RegistroVacunacion> buscarPorPaciente(String pacienteId);
        boolean existeRegistroAplicado(String pacienteId, String vacunaId, int numeroDosis);
        List<RegistroVacunacion> buscarPorVacunaYRegionYPeriodo(
                String vacunaId, String region, LocalDateTime desde, LocalDateTime hasta);
        long contarPorCategoriaYRegionYPeriodo(
                Vacuna.Categoria categoria, String region, LocalDateTime desde, LocalDateTime hasta);
    }

    // ── 4. Repositorio de Alertas de Brote ────────────────────────────────────

    public interface AlertaBroteRepository {
        AlertaBrote guardar(AlertaBrote alerta);
        List<AlertaBrote> buscarActivas();
        List<AlertaBrote> buscarPorRegion(String region);
        Optional<AlertaBrote> buscarPorId(String id);
    }

    // ── 5. Puerto de Notificaciones ───────────────────────────────────────────

    public interface NotificacionPort {
        void notificarBrote(BroteDetectadoEvent evento);
        void notificarVacunacionAplicada(RegistroVacunacion registro);
    }

    // ── 6. Puerto de Validación COFEPRIS (OCR / API oficial) ─────────────────

    public interface ValidacionCofeprisPort {
        record ResultadoValidacion(boolean valido, String codigoAutorizacion, String mensajeError) {}

        ResultadoValidacion validar(String curpPaciente, String vacunaId, String lote);
    }

    // ── 7. Puerto LLM (Spring AI / futuro) ───────────────────────────────────

    public interface LlmPort {
        String generarRespuesta(String contextoHistorial, String pregunta);
    }

    // ── 8. Puerto de publicación de eventos de dominio ────────────────────────

    public interface DomainEventPublisher {
        void publicar(BroteDetectadoEvent evento);
    }
}

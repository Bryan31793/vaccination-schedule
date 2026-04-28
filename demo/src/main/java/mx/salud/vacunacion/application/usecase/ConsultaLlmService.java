package mx.salud.vacunacion.application.usecase;

import mx.salud.vacunacion.domain.port.in.Puertos;
import mx.salud.vacunacion.domain.port.out.Repositorios;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.stream.Collectors;

/**
 * Orquesta la consulta en lenguaje natural sobre el historial de un paciente.
 * El puerto LlmPort abstrae la integración con Spring AI / modelo externo,
 * por lo que este servicio no cambia cuando se reemplace el mock por el modelo real.
 */
@Service
@Transactional(readOnly = true)
public class ConsultaLlmService implements Puertos.ConsultarLlm {

    private final Puertos.ConsultarHistorial consultarHistorial;
    private final Repositorios.LlmPort llmPort;

    public ConsultaLlmService(
            Puertos.ConsultarHistorial consultarHistorial,
            Repositorios.LlmPort llmPort) {
        this.consultarHistorial = consultarHistorial;
        this.llmPort            = llmPort;
    }

    @Override
    public Respuesta consultar(Pregunta pregunta) {
        Puertos.ConsultarHistorial.HistorialPaciente historial =
                consultarHistorial.porCurp(pregunta.curpPaciente());

        String contexto = construirContexto(historial);
        String textoRespuesta = llmPort.generarRespuesta(contexto, pregunta.textoPregunta());

        return new Respuesta(textoRespuesta, true);
    }

    private String construirContexto(Puertos.ConsultarHistorial.HistorialPaciente historial) {
        String aplicadas = historial.registros().stream()
                .map(r -> "- %s (dosis %d) aplicada el %s en %s".formatted(
                        r.getVacuna().getNombre(),
                        r.getNumeroDosis(),
                        r.getFechaAplicacion().toLocalDate(),
                        r.getUnidadAplicadora()))
                .collect(Collectors.joining("\n"));

        String pendientes = historial.vacunasPendientes().stream()
                .map(v -> "- %s (%s)".formatted(v.getNombre(), v.getCategoria()))
                .collect(Collectors.joining("\n"));

        return """
                Paciente: %s, CURP: %s, Edad: %d años.

                Vacunas aplicadas:
                %s

                Vacunas pendientes del esquema:
                %s
                """.formatted(
                historial.paciente().nombreCompleto(),
                historial.paciente().getCurp(),
                historial.paciente().calcularEdad(),
                aplicadas.isBlank() ? "Ninguna registrada." : aplicadas,
                pendientes.isBlank() ? "Esquema completo." : pendientes
        );
    }
}

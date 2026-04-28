package mx.salud.vacunacion.infrastructure.adapter;

import mx.salud.vacunacion.domain.event.BroteDetectadoEvent;
import mx.salud.vacunacion.domain.model.RegistroVacunacion;
import mx.salud.vacunacion.domain.port.out.Repositorios;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.util.Random;

/**
 * Adapters secundarios: Notificación, COFEPRIS (mock), LLM (mock) y publicación de eventos.
 */
public final class Adapters {

    private Adapters() {}

    // ── Notificacion ──────────────────────────────────────────────────────────

    @Component
    public static class NotificacionAdapter implements Repositorios.NotificacionPort {

        private static final Logger log = LoggerFactory.getLogger(NotificacionAdapter.class);

        @Override
        public void notificarBrote(BroteDetectadoEvent evento) {
            log.warn("[ALERTA BROTE] Región: {}, Categoría: {}, Casos: {}, Nivel: {}",
                    evento.getAlerta().getRegion(),
                    evento.getAlerta().getCategoriaVacuna(),
                    evento.getAlerta().getCasosDetectados(),
                    evento.getAlerta().getNivel());
            // Integración futura: SNS, email, SMS, webhook
        }

        @Override
        public void notificarVacunacionAplicada(RegistroVacunacion registro) {
            log.info("[VACUNACIÓN] Paciente {} — {} dosis {} aplicada en {}",
                    registro.getPaciente().getCurp(),
                    registro.getVacuna().getNombre(),
                    registro.getNumeroDosis(),
                    registro.getUnidadAplicadora());
        }
    }

    // ── Validación COFEPRIS (simulada / OCR mock) ─────────────────────────────

    @Component
    public static class CofeprisAdapter implements Repositorios.ValidacionCofeprisPort {

        private static final Logger log = LoggerFactory.getLogger(CofeprisAdapter.class);
        private static final Random random = new Random();

        @Override
        public ResultadoValidacion validar(String curpPaciente, String vacunaId, String lote) {
            log.info("[COFEPRIS] Validando lote='{}' para paciente='{}' vacuna='{}'",
                    lote, curpPaciente, vacunaId);

            // Simula rechazo si el lote contiene "INVALIDO"
            if (lote != null && lote.toUpperCase().contains("INVALIDO")) {
                return new ResultadoValidacion(false, null,
                        "Lote no registrado en padrón COFEPRIS");
            }

            // Simula latencia de API real (10 % de probabilidad de fallo temporal)
            if (random.nextInt(10) == 0) {
                log.warn("[COFEPRIS] Fallo simulado de conectividad — reintentando...");
            }

            String codigoAutorizacion = "COFEPRIS-" + System.currentTimeMillis();
            return new ResultadoValidacion(true, codigoAutorizacion, null);
        }
    }

    // ── LLM Port (mock preparado para Spring AI) ──────────────────────────────

    @Component
    public static class LlmAdapter implements Repositorios.LlmPort {

        private static final Logger log = LoggerFactory.getLogger(LlmAdapter.class);

        @Override
        public String generarRespuesta(String contextoHistorial, String pregunta) {
            log.info("[LLM] Pregunta recibida: '{}'", pregunta);
            log.debug("[LLM] Contexto enviado:\n{}", contextoHistorial);

            /*
             * Mock que simula la respuesta de un modelo de lenguaje.
             * Para integrar con Spring AI, reemplazar este cuerpo por:
             *
             *   ChatClient chatClient = ...;  // inyectado por constructor
             *   return chatClient.prompt()
             *       .system(contextoHistorial)
             *       .user(pregunta)
             *       .call()
             *       .content();
             */
            return """
                    Basándome en el historial de vacunación proporcionado:

                    %s

                    Respuesta a tu pregunta "%s":
                    Esta es una respuesta simulada (mock). Para obtener respuestas reales,
                    configure la integración con Spring AI y un modelo de lenguaje como
                    Claude (Anthropic) u OpenAI GPT en el LlmAdapter.
                    """.formatted(contextoHistorial.lines().limit(3)
                            .reduce("", (a, b) -> a + b + "\n"),
                    pregunta);
        }
    }

    // ── Domain Event Publisher (Spring ApplicationEvents) ─────────────────────

    @Component
    public static class DomainEventPublisherAdapter implements Repositorios.DomainEventPublisher {

        private final ApplicationEventPublisher springPublisher;

        public DomainEventPublisherAdapter(ApplicationEventPublisher springPublisher) {
            this.springPublisher = springPublisher;
        }

        @Override
        public void publicar(BroteDetectadoEvent evento) {
            springPublisher.publishEvent(evento);
        }
    }

    // ── Event Listener: reacciona al BroteDetectadoEvent ─────────────────────

    @Component
    public static class BroteEventListener {

        private static final Logger log = LoggerFactory.getLogger(BroteEventListener.class);

        private final Repositorios.NotificacionPort notificacionPort;

        public BroteEventListener(Repositorios.NotificacionPort notificacionPort) {
            this.notificacionPort = notificacionPort;
        }

        @Async
        @EventListener
        public void onBroteDetectado(BroteDetectadoEvent evento) {
            log.error("[EVENTO] BroteDetectado recibido: {}", evento.getAlerta());
            notificacionPort.notificarBrote(evento);
        }
    }
}

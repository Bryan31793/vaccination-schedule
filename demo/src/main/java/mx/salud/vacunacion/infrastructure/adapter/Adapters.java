package mx.salud.vacunacion.infrastructure.adapter;

import mx.salud.vacunacion.domain.event.BroteDetectadoEvent;
import mx.salud.vacunacion.domain.model.RegistroVacunacion;
import mx.salud.vacunacion.domain.port.out.Repositorios;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.context.event.EventListener;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;
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

    // ── Chatbot Adapter (Ollama LLM + SQL generation) ─────────────────────────

    @Component
    public static class ChatbotAdapter implements Repositorios.ChatbotPort {

        private static final Logger log = LoggerFactory.getLogger(ChatbotAdapter.class);
        private static final String OLLAMA_URL = "http://localhost:11434/api/chat";
        private static final String MODEL = "llama3.2";

        private static final String DB_SCHEMA = """
                Base de datos MySQL del sistema de vacunación de adultos.

                pacientes(id, curp, nombre, apellido_paterno, apellido_materno, fecha_nacimiento, sexo, municipio, estado)

                vacunas(id, nombre, fabricante, categoria, numero_dosis, descripcion)
                  -- categorias: INFLUENZA, COVID19, HEPATITIS_B, HEPATITIS_A, TETANOS_DIFTERIA,
                  --             NEUMOCOCO, VPH, FIEBRE_AMARILLA, MENINGOCOCO, SARAMPION_RUBEOLA_PAPERAS

                registros_vacunacion(id, paciente_id, vacuna_id, numero_dosis, lote, unidad_aplicadora,
                                     observaciones, fecha_aplicacion, estado, fecha_creacion)
                  -- estado: PENDIENTE, APLICADA, CANCELADA
                  -- paciente_id referencia pacientes.id, vacuna_id referencia vacunas.id

                alertas_brote(id, vacuna_id, region, casos_detectados, nivel_alerta,
                              fecha_inicio, fecha_fin, atendida)
                  -- nivel_alerta: INFORMATIVO, MODERADO, CRITICO
                """;

        private final JdbcTemplate jdbcTemplate;
        private final RestClient restClient;

        public ChatbotAdapter(JdbcTemplate jdbcTemplate) {
            this.jdbcTemplate = jdbcTemplate;
            this.restClient = RestClient.create();
        }

        @Override
        public String procesarMensaje(String mensaje) {
            try {
                boolean necesitaSql = detectarNecesidadSql(mensaje);

                if (!necesitaSql) {
                    return responderGeneral(mensaje);
                }

                String sql = limpiarSql(generarSql(mensaje));
                if (!esSqlSeguro(sql)) {
                    log.warn("[Chatbot] SQL no seguro rechazado: {}", sql);
                    return responderGeneral(mensaje);
                }

                log.info("[Chatbot] SQL generado: {}", sql);
                String resultado = ejecutarSql(sql);
                log.debug("[Chatbot] Resultado BD: {}", resultado);

                return responderConResultado(mensaje, sql, resultado);

            } catch (Exception e) {
                log.error("[Chatbot] Error procesando mensaje", e);
                return "Lo siento, hubo un error al procesar tu pregunta. Intenta de nuevo.";
            }
        }

        private boolean detectarNecesidadSql(String pregunta) {
            String respuesta = llamarOllama(
                    """
                    Eres un clasificador. Responde ÚNICAMENTE con "SI" o "NO", sin ningún otro texto.
                    Responde "SI" si la pregunta requiere consultar datos de pacientes, vacunas, registros o alertas.
                    Responde "NO" si es una pregunta general que no necesita datos de la base de datos.
                    """,
                    "¿Requiere datos de BD? Pregunta: " + pregunta);
            return respuesta.trim().toUpperCase().contains("SI");
        }

        private String generarSql(String pregunta) {
            return llamarOllama(
                    "Eres experto en SQL para MySQL. Genera ÚNICAMENTE la consulta SQL sin explicaciones ni markdown.\n"
                    + "Solo responde con el SQL puro, empezando con SELECT y terminando con punto y coma.\n"
                    + "Solo puedes usar SELECT. Schema:\n" + DB_SCHEMA,
                    pregunta);
        }

        private String responderGeneral(String pregunta) {
            return llamarOllama(
                    """
                    Eres un asistente amable del sistema de vacunación de adultos.
                    Responde en español de forma clara y concisa.
                    """,
                    pregunta);
        }

        private String responderConResultado(String pregunta, String sql, String resultado) {
            return llamarOllama(
                    """
                    Eres un asistente del sistema de vacunación. Responde en español de forma amigable.
                    Se te da una pregunta y el resultado de una consulta SQL. Formula una respuesta clara.
                    """,
                    "Pregunta: " + pregunta + "\nSQL ejecutado: " + sql
                    + "\nResultado: " + resultado + "\n\nResponde la pregunta:");
        }

        private String limpiarSql(String texto) {
            texto = texto.replaceAll("(?i)```sql|```", "").strip();
            for (String linea : texto.split("\n")) {
                linea = linea.strip();
                String upper = linea.toUpperCase();
                if (upper.startsWith("SELECT") || upper.startsWith("WITH")) {
                    return linea.contains(";") ? linea.split(";")[0] + ";" : linea + ";";
                }
            }
            return texto.split(";")[0].trim() + ";";
        }

        private boolean esSqlSeguro(String sql) {
            String upper = sql.trim().toUpperCase();
            return upper.startsWith("SELECT") || upper.startsWith("WITH");
        }

        private String ejecutarSql(String sql) {
            try {
                List<Map<String, Object>> rows = jdbcTemplate.queryForList(sql);
                if (rows.isEmpty()) return "Sin resultados.";
                StringBuilder sb = new StringBuilder();
                for (Map<String, Object> row : rows) {
                    sb.append(row.values().stream()
                            .map(v -> v == null ? "null" : v.toString())
                            .reduce((a, b) -> a + " | " + b)
                            .orElse(""))
                            .append("\n");
                }
                return sb.toString().trim();
            } catch (Exception e) {
                log.error("[Chatbot] Error ejecutando SQL: {}", e.getMessage());
                return "Error al ejecutar la consulta.";
            }
        }

        @SuppressWarnings("unchecked")
        private String llamarOllama(String systemPrompt, String userPrompt) {
            try {
                var body = Map.of(
                        "model", MODEL,
                        "stream", false,
                        "messages", List.of(
                                Map.of("role", "system", "content", systemPrompt),
                                Map.of("role", "user",   "content", userPrompt)
                        )
                );

                var response = restClient.post()
                        .uri(OLLAMA_URL)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(body)
                        .retrieve()
                        .body(Map.class);

                if (response != null && response.containsKey("message")) {
                    Map<String, Object> message = (Map<String, Object>) response.get("message");
                    return (String) message.get("content");
                }
                return "No se obtuvo respuesta del modelo.";
            } catch (Exception e) {
                log.error("[Chatbot] Error llamando a Ollama: {}", e.getMessage());
                return "El servicio de IA no está disponible. Asegúrate de que Ollama esté corriendo con el modelo llama3.2.";
            }
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

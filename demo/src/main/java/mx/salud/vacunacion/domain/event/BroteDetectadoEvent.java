package mx.salud.vacunacion.domain.event;

import mx.salud.vacunacion.domain.model.AlertaBrote;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Evento de dominio disparado cuando la lógica de detección supera el umbral de brotes.
 * No depende de ningún framework; la infraestructura es responsable de publicarlo.
 */
public final class BroteDetectadoEvent {

    private final String eventId;
    private final LocalDateTime ocurridoEn;
    private final AlertaBrote alerta;

    public BroteDetectadoEvent(AlertaBrote alerta) {
        this.eventId    = UUID.randomUUID().toString();
        this.ocurridoEn = LocalDateTime.now();
        this.alerta     = alerta;
    }

    public String getEventId()           { return eventId; }
    public LocalDateTime getOcurridoEn() { return ocurridoEn; }
    public AlertaBrote getAlerta()       { return alerta; }

    @Override
    public String toString() {
        return "BroteDetectadoEvent{eventId='" + eventId + "', alerta=" + alerta + "}";
    }
}

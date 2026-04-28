package mx.salud.vacunacion.domain.model;

import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

/**
 * Aggregate Root del contexto de vacunación.
 * Encapsula la invariante: no se puede registrar una vacuna ya aplicada en la misma dosis.
 */
public final class RegistroVacunacion {

    public enum EstadoRegistro { PENDIENTE, APLICADA, CANCELADA }

    private final String id;
    private final Paciente paciente;
    private final Vacuna vacuna;
    private final int numeroDosis;
    private final String lote;
    private final String unidadAplicadora;
    private final LocalDateTime fechaAplicacion;
    private EstadoRegistro estado;
    private String observaciones;

    private RegistroVacunacion(Builder builder) {
        Objects.requireNonNull(builder.paciente, "Paciente es obligatorio");
        Objects.requireNonNull(builder.vacuna, "Vacuna es obligatoria");
        Objects.requireNonNull(builder.lote, "Lote es obligatorio");
        if (builder.numeroDosis < 1 || builder.numeroDosis > builder.vacuna.getNumeroDosis()) {
            throw new IllegalArgumentException(
                    "Número de dosis inválido para la vacuna " + builder.vacuna.getNombre());
        }
        this.id              = UUID.randomUUID().toString();
        this.paciente        = builder.paciente;
        this.vacuna          = builder.vacuna;
        this.numeroDosis     = builder.numeroDosis;
        this.lote            = builder.lote;
        this.unidadAplicadora = builder.unidadAplicadora;
        this.fechaAplicacion = builder.fechaAplicacion != null ? builder.fechaAplicacion : LocalDateTime.now();
        this.estado          = EstadoRegistro.PENDIENTE;
        this.observaciones   = builder.observaciones;
    }

    public void confirmarAplicacion() {
        if (estado != EstadoRegistro.PENDIENTE) {
            throw new IllegalStateException("Solo un registro PENDIENTE puede confirmarse");
        }
        this.estado = EstadoRegistro.APLICADA;
    }

    public void cancelar(String motivo) {
        if (estado == EstadoRegistro.APLICADA) {
            throw new IllegalStateException("No se puede cancelar un registro ya aplicado");
        }
        this.estado = EstadoRegistro.CANCELADA;
        this.observaciones = motivo;
    }

    public boolean estaAplicada()  { return estado == EstadoRegistro.APLICADA; }

    public String getId()                      { return id; }
    public Paciente getPaciente()              { return paciente; }
    public Vacuna getVacuna()                  { return vacuna; }
    public int getNumeroDosis()                { return numeroDosis; }
    public String getLote()                    { return lote; }
    public String getUnidadAplicadora()        { return unidadAplicadora; }
    public LocalDateTime getFechaAplicacion()  { return fechaAplicacion; }
    public EstadoRegistro getEstado()          { return estado; }
    public String getObservaciones()           { return observaciones; }

    // ── Builder ──────────────────────────────────────────────────────────────

    public static Builder builder() { return new Builder(); }

    public static final class Builder {
        private Paciente paciente;
        private Vacuna vacuna;
        private int numeroDosis = 1;
        private String lote;
        private String unidadAplicadora;
        private LocalDateTime fechaAplicacion;
        private String observaciones;

        public Builder paciente(Paciente paciente)              { this.paciente = paciente; return this; }
        public Builder vacuna(Vacuna vacuna)                    { this.vacuna = vacuna; return this; }
        public Builder numeroDosis(int numeroDosis)             { this.numeroDosis = numeroDosis; return this; }
        public Builder lote(String lote)                        { this.lote = lote; return this; }
        public Builder unidadAplicadora(String unidadAplicadora){ this.unidadAplicadora = unidadAplicadora; return this; }
        public Builder fechaAplicacion(LocalDateTime fecha)     { this.fechaAplicacion = fecha; return this; }
        public Builder observaciones(String observaciones)      { this.observaciones = observaciones; return this; }
        public RegistroVacunacion build()                       { return new RegistroVacunacion(this); }
    }
}

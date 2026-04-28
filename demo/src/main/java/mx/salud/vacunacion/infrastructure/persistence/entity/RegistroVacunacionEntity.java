package mx.salud.vacunacion.infrastructure.persistence.entity;

import jakarta.persistence.*;
import mx.salud.vacunacion.domain.model.RegistroVacunacion;

import java.time.LocalDateTime;

@Entity
@Table(name = "registros_vacunacion",
       indexes = @Index(columnList = "paciente_id, vacuna_id, numero_dosis"))
public class RegistroVacunacionEntity {

    @Id
    @Column(length = 36)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "paciente_id", nullable = false)
    private PacienteEntity paciente;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "vacuna_id", nullable = false)
    private VacunaEntity vacuna;

    @Column(name = "numero_dosis", nullable = false)
    private int numeroDosis;

    @Column(nullable = false)
    private String lote;

    @Column(name = "unidad_aplicadora")
    private String unidadAplicadora;

    @Column(name = "fecha_aplicacion", nullable = false)
    private LocalDateTime fechaAplicacion;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RegistroVacunacion.EstadoRegistro estado;

    @Column(columnDefinition = "TEXT")
    private String observaciones;

    protected RegistroVacunacionEntity() {}

    public static RegistroVacunacionEntity fromDomain(
            RegistroVacunacion r, PacienteEntity pe, VacunaEntity ve) {
        RegistroVacunacionEntity e = new RegistroVacunacionEntity();
        e.id               = r.getId();
        e.paciente         = pe;
        e.vacuna           = ve;
        e.numeroDosis      = r.getNumeroDosis();
        e.lote             = r.getLote();
        e.unidadAplicadora = r.getUnidadAplicadora();
        e.fechaAplicacion  = r.getFechaAplicacion();
        e.estado           = r.getEstado();
        e.observaciones    = r.getObservaciones();
        return e;
    }

    public RegistroVacunacion toDomain() {
        RegistroVacunacion r = RegistroVacunacion.builder()
                .paciente(paciente.toDomain())
                .vacuna(vacuna.toDomain())
                .numeroDosis(numeroDosis)
                .lote(lote)
                .unidadAplicadora(unidadAplicadora)
                .fechaAplicacion(fechaAplicacion)
                .observaciones(observaciones)
                .build();
        if (estado == RegistroVacunacion.EstadoRegistro.APLICADA)  r.confirmarAplicacion();
        if (estado == RegistroVacunacion.EstadoRegistro.CANCELADA) r.cancelar(observaciones);
        return r;
    }

    public String getId()                                { return id; }
    public PacienteEntity getPaciente()                  { return paciente; }
    public VacunaEntity getVacuna()                      { return vacuna; }
    public int getNumeroDosis()                          { return numeroDosis; }
    public RegistroVacunacion.EstadoRegistro getEstado() { return estado; }
    public LocalDateTime getFechaAplicacion()            { return fechaAplicacion; }
}

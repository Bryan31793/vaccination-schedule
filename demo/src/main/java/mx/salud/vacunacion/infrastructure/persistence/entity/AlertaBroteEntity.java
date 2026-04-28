package mx.salud.vacunacion.infrastructure.persistence.entity;

import jakarta.persistence.*;
import mx.salud.vacunacion.domain.model.AlertaBrote;
import mx.salud.vacunacion.domain.model.Vacuna;

import java.time.LocalDateTime;

@Entity
@Table(name = "alertas_brote")
public class AlertaBroteEntity {

    @Id
    @Column(length = 36)
    private String id;

    @Enumerated(EnumType.STRING)
    @Column(name = "categoria_vacuna", nullable = false)
    private Vacuna.Categoria categoriaVacuna;

    @Column(nullable = false)
    private String region;

    @Column(name = "casos_detectados", nullable = false)
    private int casosDetectados;

    @Column(name = "umbral_activacion", nullable = false)
    private int umbralActivacion;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AlertaBrote.NivelAlerta nivel;

    @Column(name = "fecha_deteccion", nullable = false)
    private LocalDateTime fechaDeteccion;

    private boolean atendida;

    protected AlertaBroteEntity() {}

    public static AlertaBroteEntity fromDomain(AlertaBrote a) {
        AlertaBroteEntity e = new AlertaBroteEntity();
        e.id               = a.getId();
        e.categoriaVacuna  = a.getCategoriaVacuna();
        e.region           = a.getRegion();
        e.casosDetectados  = a.getCasosDetectados();
        e.umbralActivacion = a.getUmbralActivacion();
        e.nivel            = a.getNivel();
        e.fechaDeteccion   = a.getFechaDeteccion();
        e.atendida         = a.isAtendida();
        return e;
    }

    public AlertaBrote toDomain() {
        AlertaBrote a = new AlertaBrote(categoriaVacuna, region, casosDetectados, umbralActivacion);
        if (atendida) a.marcarAtendida();
        return a;
    }

    public String getId()       { return id; }
    public boolean isAtendida() { return atendida; }
    public String getRegion()   { return region; }
}

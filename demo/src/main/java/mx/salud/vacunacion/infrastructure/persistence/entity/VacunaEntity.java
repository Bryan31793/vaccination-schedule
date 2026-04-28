package mx.salud.vacunacion.infrastructure.persistence.entity;

import jakarta.persistence.*;
import mx.salud.vacunacion.domain.model.Vacuna;

@Entity
@Table(name = "vacunas")
public class VacunaEntity {

    @Id
    @Column(length = 36)
    private String id;

    @Column(nullable = false)
    private String nombre;

    private String fabricante;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Vacuna.Categoria categoria;

    @Column(name = "numero_dosis", nullable = false)
    private int numeroDosis;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    protected VacunaEntity() {}

    public static VacunaEntity fromDomain(Vacuna v) {
        VacunaEntity e = new VacunaEntity();
        e.id          = v.getId();
        e.nombre      = v.getNombre();
        e.fabricante  = v.getFabricante();
        e.categoria   = v.getCategoria();
        e.numeroDosis = v.getNumeroDosis();
        e.descripcion = v.getDescripcion();
        return e;
    }

    public Vacuna toDomain() {
        return new Vacuna(id, nombre, fabricante, categoria, numeroDosis, descripcion);
    }

    public String getId()                { return id; }
    public Vacuna.Categoria getCategoria() { return categoria; }
}

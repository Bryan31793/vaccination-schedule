package mx.salud.vacunacion.domain.model;

import java.util.Objects;

public final class Vacuna {

    public enum Categoria {
        INFLUENZA, COVID19, HEPATITIS_B, HEPATITIS_A, TETANOS_DIFTERIA,
        NEUMOCOCO, VPH, FIEBRE_AMARILLA, MENINGOCOCO, SARAMPION_RUBEOLA_PAPERAS
    }

    private final String id;
    private final String nombre;
    private final String fabricante;
    private final Categoria categoria;
    private final int numeroDosis;
    private final String descripcion;

    public Vacuna(String id, String nombre, String fabricante, Categoria categoria,
                  int numeroDosis, String descripcion) {
        Objects.requireNonNull(id, "ID de vacuna es obligatorio");
        Objects.requireNonNull(nombre, "Nombre de vacuna es obligatorio");
        Objects.requireNonNull(categoria, "Categoría es obligatoria");
        if (numeroDosis < 1) throw new IllegalArgumentException("La vacuna debe tener al menos 1 dosis");
        this.id = id;
        this.nombre = nombre;
        this.fabricante = fabricante;
        this.categoria = categoria;
        this.numeroDosis = numeroDosis;
        this.descripcion = descripcion;
    }

    public boolean requiereRefuerzo() {
        return numeroDosis > 1;
    }

    public String getId()          { return id; }
    public String getNombre()      { return nombre; }
    public String getFabricante()  { return fabricante; }
    public Categoria getCategoria() { return categoria; }
    public int getNumeroDosis()    { return numeroDosis; }
    public String getDescripcion() { return descripcion; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Vacuna v)) return false;
        return id.equals(v.id);
    }

    @Override
    public int hashCode() { return id.hashCode(); }

    @Override
    public String toString() {
        return "Vacuna{id='" + id + "', nombre='" + nombre + "', categoria=" + categoria + "}";
    }
}

package mx.salud.vacunacion.domain.model;

import java.time.LocalDate;
import java.util.Objects;
import java.util.UUID;

public final class Paciente {

    private final String id;
    private final String curp;
    private final String nombre;
    private final String apellidoPaterno;
    private final String apellidoMaterno;
    private final LocalDate fechaNacimiento;
    private final String sexo;
    private final String municipio;
    private final String estado;

    public Paciente(String curp, String nombre, String apellidoPaterno, String apellidoMaterno,
                    LocalDate fechaNacimiento, String sexo, String municipio, String estado) {
        this(UUID.randomUUID().toString(), curp, nombre, apellidoPaterno, apellidoMaterno,
                fechaNacimiento, sexo, municipio, estado);
    }

    public Paciente(String id, String curp, String nombre, String apellidoPaterno, String apellidoMaterno,
                    LocalDate fechaNacimiento, String sexo, String municipio, String estado) {
        Objects.requireNonNull(curp, "CURP es obligatoria");
        Objects.requireNonNull(nombre, "Nombre es obligatorio");
        Objects.requireNonNull(fechaNacimiento, "Fecha de nacimiento es obligatoria");
        if (curp.length() != 18) throw new IllegalArgumentException("CURP debe tener 18 caracteres");
        this.id = id;
        this.curp = curp.toUpperCase();
        this.nombre = nombre;
        this.apellidoPaterno = apellidoPaterno;
        this.apellidoMaterno = apellidoMaterno;
        this.fechaNacimiento = fechaNacimiento;
        this.sexo = sexo;
        this.municipio = municipio;
        this.estado = estado;
    }

    public int calcularEdad() {
        return fechaNacimiento.until(LocalDate.now()).getYears();
    }

    public String nombreCompleto() {
        return nombre + " " + apellidoPaterno + " " + apellidoMaterno;
    }

    public String getId()              { return id; }
    public String getCurp()            { return curp; }
    public String getNombre()          { return nombre; }
    public String getApellidoPaterno() { return apellidoPaterno; }
    public String getApellidoMaterno() { return apellidoMaterno; }
    public LocalDate getFechaNacimiento() { return fechaNacimiento; }
    public String getSexo()            { return sexo; }
    public String getMunicipio()       { return municipio; }
    public String getEstado()          { return estado; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Paciente p)) return false;
        return curp.equals(p.curp);
    }

    @Override
    public int hashCode() { return curp.hashCode(); }

    @Override
    public String toString() {
        return "Paciente{curp='" + curp + "', nombre='" + nombreCompleto() + "', edad=" + calcularEdad() + "}";
    }
}

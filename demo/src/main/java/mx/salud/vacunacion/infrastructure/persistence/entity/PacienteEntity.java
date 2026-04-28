package mx.salud.vacunacion.infrastructure.persistence.entity;

import jakarta.persistence.*;
import mx.salud.vacunacion.domain.model.Paciente;

import java.time.LocalDate;

@Entity
@Table(name = "pacientes", uniqueConstraints = @UniqueConstraint(columnNames = "curp"))
public class PacienteEntity {

    @Id
    @Column(length = 36)
    private String id;

    @Column(nullable = false, length = 18)
    private String curp;

    @Column(nullable = false)
    private String nombre;

    @Column(name = "apellido_paterno")
    private String apellidoPaterno;

    @Column(name = "apellido_materno")
    private String apellidoMaterno;

    @Column(name = "fecha_nacimiento", nullable = false)
    private LocalDate fechaNacimiento;

    @Column(length = 1)
    private String sexo;

    private String municipio;

    private String estado;

    protected PacienteEntity() {}

    // ── Mappers ───────────────────────────────────────────────────────────────

    public static PacienteEntity fromDomain(Paciente p) {
        PacienteEntity e = new PacienteEntity();
        e.id              = p.getId();
        e.curp            = p.getCurp();
        e.nombre          = p.getNombre();
        e.apellidoPaterno = p.getApellidoPaterno();
        e.apellidoMaterno = p.getApellidoMaterno();
        e.fechaNacimiento = p.getFechaNacimiento();
        e.sexo            = p.getSexo();
        e.municipio       = p.getMunicipio();
        e.estado          = p.getEstado();
        return e;
    }

    public Paciente toDomain() {
        return new Paciente(id, curp, nombre, apellidoPaterno, apellidoMaterno,
                fechaNacimiento, sexo, municipio, estado);
    }

    public String getId()   { return id; }
    public String getCurp() { return curp; }
}

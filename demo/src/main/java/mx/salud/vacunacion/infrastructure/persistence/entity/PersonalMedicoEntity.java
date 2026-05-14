package mx.salud.vacunacion.infrastructure.persistence.entity;

import jakarta.persistence.*;
import mx.salud.vacunacion.domain.model.PersonalMedico;

import java.time.LocalDateTime;

@Entity
@Table(name = "personal_medico",
       uniqueConstraints = @UniqueConstraint(columnNames = "cedula_profesional"))
public class PersonalMedicoEntity {

    @Id
    private String id;

    @Column(name = "nombre_completo", nullable = false)
    private String nombreCompleto;

    @Column(name = "cedula_profesional", nullable = false, unique = true)
    private String cedulaProfesional;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PersonalMedico.Rol rol;

    @Column(nullable = false)
    private boolean activo = true;

    @Column(name = "fecha_registro", nullable = false)
    private LocalDateTime fechaRegistro;

    public PersonalMedicoEntity() {}

    public static PersonalMedicoEntity fromDomain(PersonalMedico m) {
        var e = new PersonalMedicoEntity();
        e.id                = m.getId();
        e.nombreCompleto    = m.getNombreCompleto();
        e.cedulaProfesional = m.getCedulaProfesional();
        e.passwordHash      = m.getPasswordHash();
        e.rol               = m.getRol();
        e.activo            = m.isActivo();
        e.fechaRegistro     = m.getFechaRegistro();
        return e;
    }

    public PersonalMedico toDomain() {
        return new PersonalMedico(id, nombreCompleto, cedulaProfesional,
                passwordHash, rol, activo, fechaRegistro);
    }

    public String getId()                { return id; }
    public String getCedulaProfesional() { return cedulaProfesional; }
}

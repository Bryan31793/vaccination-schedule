package mx.salud.vacunacion.infrastructure.persistence.entity;

import jakarta.persistence.*;
import mx.salud.vacunacion.domain.model.CredencialCiudadano;

import java.time.LocalDateTime;

@Entity
@Table(name = "credenciales_ciudadano",
       uniqueConstraints = @UniqueConstraint(columnNames = "curp"))
public class CredencialCiudadanoEntity {

    @Id
    @Column(length = 36)
    private String id;

    @Column(nullable = false, length = 18)
    private String curp;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(nullable = false)
    private boolean activo;

    @Column(name = "fecha_registro", nullable = false)
    private LocalDateTime fechaRegistro;

    protected CredencialCiudadanoEntity() {}

    public static CredencialCiudadanoEntity fromDomain(CredencialCiudadano c) {
        CredencialCiudadanoEntity e = new CredencialCiudadanoEntity();
        e.id            = c.getId();
        e.curp          = c.getCurp();
        e.passwordHash  = c.getPasswordHash();
        e.activo        = c.isActivo();
        e.fechaRegistro = c.getFechaRegistro();
        return e;
    }

    public CredencialCiudadano toDomain() {
        return new CredencialCiudadano(id, curp, passwordHash, activo, fechaRegistro);
    }
}

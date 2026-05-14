package mx.salud.vacunacion.domain.model;

import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

public final class PersonalMedico {

    public enum Rol { ADMIN, MEDICO, ENFERMERO }

    private final String id;
    private final String nombreCompleto;
    private final String cedulaProfesional;
    private final String passwordHash;
    private final Rol    rol;
    private final boolean activo;
    private final LocalDateTime fechaRegistro;

    public PersonalMedico(String nombreCompleto, String cedulaProfesional,
                          String passwordHash, Rol rol) {
        this(UUID.randomUUID().toString(), nombreCompleto, cedulaProfesional,
             passwordHash, rol, true, LocalDateTime.now());
    }

    public PersonalMedico(String id, String nombreCompleto, String cedulaProfesional,
                          String passwordHash, Rol rol, boolean activo,
                          LocalDateTime fechaRegistro) {
        Objects.requireNonNull(cedulaProfesional, "Cédula profesional es obligatoria");
        this.id                = id;
        this.nombreCompleto    = nombreCompleto;
        this.cedulaProfesional = cedulaProfesional;
        this.passwordHash      = passwordHash;
        this.rol               = rol;
        this.activo            = activo;
        this.fechaRegistro     = fechaRegistro;
    }

    public String getId()                { return id; }
    public String getNombreCompleto()    { return nombreCompleto; }
    public String getCedulaProfesional() { return cedulaProfesional; }
    public String getPasswordHash()      { return passwordHash; }
    public Rol    getRol()               { return rol; }
    public boolean isActivo()            { return activo; }
    public LocalDateTime getFechaRegistro() { return fechaRegistro; }
}

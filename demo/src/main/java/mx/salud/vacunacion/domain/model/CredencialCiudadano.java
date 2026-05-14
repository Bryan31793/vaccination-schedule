package mx.salud.vacunacion.domain.model;

import java.time.LocalDateTime;

public class CredencialCiudadano {

    private final String id;
    private final String curp;
    private final String passwordHash;
    private final boolean activo;
    private final LocalDateTime fechaRegistro;

    public CredencialCiudadano(String id, String curp, String passwordHash,
                                boolean activo, LocalDateTime fechaRegistro) {
        this.id            = id;
        this.curp          = curp;
        this.passwordHash  = passwordHash;
        this.activo        = activo;
        this.fechaRegistro = fechaRegistro;
    }

    public String getId()              { return id; }
    public String getCurp()            { return curp; }
    public String getPasswordHash()    { return passwordHash; }
    public boolean isActivo()          { return activo; }
    public LocalDateTime getFechaRegistro() { return fechaRegistro; }
}

package mx.salud.vacunacion.domain.model;

import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

public final class AlertaBrote {

    public enum NivelAlerta { INFORMATIVO, MODERADO, CRITICO }

    private final String id;
    private final Vacuna.Categoria categoriaVacuna;
    private final String region;
    private final int casosDectectados;
    private final int umbralActivacion;
    private final NivelAlerta nivel;
    private final LocalDateTime fechaDeteccion;
    private boolean atendida;

    public AlertaBrote(Vacuna.Categoria categoriaVacuna, String region,
                       int casosDetectados, int umbralActivacion) {
        Objects.requireNonNull(categoriaVacuna, "Categoría de vacuna es obligatoria");
        Objects.requireNonNull(region, "Región es obligatoria");
        this.id                = UUID.randomUUID().toString();
        this.categoriaVacuna   = categoriaVacuna;
        this.region            = region;
        this.casosDectectados  = casosDetectados;
        this.umbralActivacion  = umbralActivacion;
        this.nivel             = calcularNivel(casosDetectados, umbralActivacion);
        this.fechaDeteccion    = LocalDateTime.now();
        this.atendida          = false;
    }

    private static NivelAlerta calcularNivel(int casos, int umbral) {
        double ratio = (double) casos / umbral;
        if (ratio >= 2.0) return NivelAlerta.CRITICO;
        if (ratio >= 1.5) return NivelAlerta.MODERADO;
        return NivelAlerta.INFORMATIVO;
    }

    public void marcarAtendida() { this.atendida = true; }

    public String getId()                        { return id; }
    public Vacuna.Categoria getCategoriaVacuna() { return categoriaVacuna; }
    public String getRegion()                    { return region; }
    public int getCasosDetectados()              { return casosDectectados; }
    public int getUmbralActivacion()             { return umbralActivacion; }
    public NivelAlerta getNivel()                { return nivel; }
    public LocalDateTime getFechaDeteccion()     { return fechaDeteccion; }
    public boolean isAtendida()                  { return atendida; }

    @Override
    public String toString() {
        return "AlertaBrote{region='" + region + "', categoria=" + categoriaVacuna
                + ", casos=" + casosDectectados + ", nivel=" + nivel + "}";
    }
}

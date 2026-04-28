package mx.salud.vacunacion.infrastructure.config;

import mx.salud.vacunacion.application.usecase.PacienteYCatalogoServices.GestionarCatalogoService;
import mx.salud.vacunacion.domain.model.Vacuna;
import mx.salud.vacunacion.domain.port.out.Repositorios;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Carga el catálogo oficial de vacunas del esquema adulto al arrancar la aplicación,
 * solo si la tabla está vacía. Idempotente: seguro de ejecutar en cada inicio.
 */
@Component
public class CatalogoVacunasInitializer implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(CatalogoVacunasInitializer.class);

    private final GestionarCatalogoService catalogo;
    private final Repositorios.VacunaRepository vacunaRepository;

    public CatalogoVacunasInitializer(
            GestionarCatalogoService catalogo,
            Repositorios.VacunaRepository vacunaRepository) {
        this.catalogo        = catalogo;
        this.vacunaRepository = vacunaRepository;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (!vacunaRepository.buscarTodas().isEmpty()) {
            log.info("[CATÁLOGO] Vacunas ya inicializadas — omitiendo carga.");
            return;
        }

        List<Vacuna> vacunas = vacunasOficiales();
        vacunas.forEach(catalogo::guardar);
        log.info("[CATÁLOGO] {} vacunas del esquema adulto cargadas exitosamente.", vacunas.size());
    }

    private List<Vacuna> vacunasOficiales() {
        return List.of(
            new Vacuna("VAC-INF-001", "Influenza Estacional", "Sanofi Pasteur",
                    Vacuna.Categoria.INFLUENZA, 1,
                    "Vacuna trivalente/tetravalente contra influenza. Anual para adultos mayores."),

            new Vacuna("VAC-COVID-001", "COVID-19 Bivalente", "Pfizer-BioNTech",
                    Vacuna.Categoria.COVID19, 2,
                    "Vacuna bivalente mRNA contra COVID-19 original y variante Ómicron."),

            new Vacuna("VAC-HEPATB-001", "Hepatitis B", "Merck (Recombivax)",
                    Vacuna.Categoria.HEPATITIS_B, 3,
                    "Serie de 3 dosis: 0, 1 y 6 meses. Recomendada para adultos no vacunados."),

            new Vacuna("VAC-HEPA-001", "Hepatitis A", "GlaxoSmithKline (Havrix)",
                    Vacuna.Categoria.HEPATITIS_A, 2,
                    "2 dosis separadas por 6-12 meses. Viajeros internacionales y grupos de riesgo."),

            new Vacuna("VAC-TD-001", "Td / Tdap (Tétanos-Difteria)", "Sanofi Pasteur",
                    Vacuna.Categoria.TETANOS_DIFTERIA, 1,
                    "Refuerzo cada 10 años. Tdap única vez para protección contra pertussis."),

            new Vacuna("VAC-NEUMO-001", "Neumococo Conjugada (PCV20)", "Pfizer",
                    Vacuna.Categoria.NEUMOCOCO, 1,
                    "Adultos ≥65 años o con comorbilidades. Una sola dosis de PCV20."),

            new Vacuna("VAC-VPH-001", "VPH (Gardasil-9)", "Merck",
                    Vacuna.Categoria.VPH, 3,
                    "3 dosis para adultos 27-45 años según evaluación clínica. 0, 2 y 6 meses."),

            new Vacuna("VAC-SARAMP-001", "SRP (Sarampión-Rubéola-Paperas)", "Merck (M-M-R II)",
                    Vacuna.Categoria.SARAMPION_RUBEOLA_PAPERAS, 2,
                    "Adultos nacidos después de 1957 sin evidencia de inmunidad. 2 dosis."),

            new Vacuna("VAC-MENING-001", "Meningococo Conjugada (MenACWY)", "GlaxoSmithKline",
                    Vacuna.Categoria.MENINGOCOCO, 1,
                    "Estudiantes universitarios, personal militar y viajeros a países endémicos."),

            new Vacuna("VAC-FA-001", "Fiebre Amarilla", "Sanofi Pasteur (YF-VAX)",
                    Vacuna.Categoria.FIEBRE_AMARILLA, 1,
                    "Dosis única de por vida. Obligatoria para viajeros a zonas endémicas.")
        );
    }
}

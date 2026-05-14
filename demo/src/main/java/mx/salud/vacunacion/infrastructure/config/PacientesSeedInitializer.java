package mx.salud.vacunacion.infrastructure.config;

import mx.salud.vacunacion.domain.model.Paciente;
import mx.salud.vacunacion.domain.port.out.Repositorios;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
@Order(2)
public class PacientesSeedInitializer implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(PacientesSeedInitializer.class);

    private final Repositorios.PacienteRepository pacienteRepository;

    public PacientesSeedInitializer(Repositorios.PacienteRepository pacienteRepository) {
        this.pacienteRepository = pacienteRepository;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (!pacienteRepository.buscarTodos().isEmpty()) {
            log.info("[PACIENTES] Pacientes ya registrados — omitiendo seed.");
            return;
        }

        List<Paciente> pacientes = pacientesEjemplo();
        pacientes.forEach(pacienteRepository::guardar);
        log.info("[PACIENTES] {} pacientes de ejemplo cargados.", pacientes.size());
    }

    private List<Paciente> pacientesEjemplo() {
        return List.of(
            new Paciente("GOML800315HDFNZS09", "Luis",    "González",  "Morales",
                    LocalDate.of(1980, 3, 15), "H", "Cuauhtémoc",    "Ciudad de México"),
            new Paciente("RAGH920722MDFMRS04", "Gabriela","Ramírez",   "Hernández",
                    LocalDate.of(1992, 7, 22), "M", "Gustavo A. Madero", "Ciudad de México"),
            new Paciente("PELJ750910HDFLPN02", "Juan",    "Pérez",     "López",
                    LocalDate.of(1975, 9, 10), "H", "Monterrey",     "Nuevo León"),
            new Paciente("SAEM851120MDFNRR06", "María",   "Sánchez",   "Martínez",
                    LocalDate.of(1985, 11, 20), "M", "Guadalajara",  "Jalisco"),
            new Paciente("TOVR600505HDFRVL08", "Roberto", "Torres",    "Vargas",
                    LocalDate.of(1960, 5, 5),  "H", "Puebla",        "Puebla"),
            new Paciente("FLCA700418MDFLLR03", "Ana",     "Flores",    "Castillo",
                    LocalDate.of(1970, 4, 18), "M", "Mérida",        "Yucatán"),
            new Paciente("HEMJ990101HDFRNV01", "Javier",  "Hernández", "Méndez",
                    LocalDate.of(1999, 1, 1),  "H", "Tijuana",       "Baja California"),
            new Paciente("LOPS880630MDFPRS05", "Sofía",   "López",     "Paredes",
                    LocalDate.of(1988, 6, 30), "M", "León",          "Guanajuato")
        );
    }
}

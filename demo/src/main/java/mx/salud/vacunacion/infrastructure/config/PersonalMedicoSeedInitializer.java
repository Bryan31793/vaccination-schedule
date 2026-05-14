package mx.salud.vacunacion.infrastructure.config;

import mx.salud.vacunacion.domain.model.PersonalMedico;
import mx.salud.vacunacion.domain.port.out.Repositorios;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@Order(3)
public class PersonalMedicoSeedInitializer implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(PersonalMedicoSeedInitializer.class);

    private final Repositorios.PersonalMedicoRepository medicoRepository;
    private final PasswordEncoder                        encoder;

    public PersonalMedicoSeedInitializer(Repositorios.PersonalMedicoRepository medicoRepository,
                                         PasswordEncoder encoder) {
        this.medicoRepository = medicoRepository;
        this.encoder          = encoder;
    }

    @Override
    public void run(ApplicationArguments args) {
        List.of(
            new PersonalMedico("Administrador del Sistema", "1234567",
                    encoder.encode("admin123"), PersonalMedico.Rol.ADMIN),
            new PersonalMedico("Dr. Carlos Ramírez", "2345678",
                    encoder.encode("medico123"), PersonalMedico.Rol.MEDICO),
            new PersonalMedico("Enf. Laura Torres", "3456789",
                    encoder.encode("enfermero123"), PersonalMedico.Rol.ENFERMERO)
        ).forEach(m -> {
            if (!medicoRepository.existePorCedula(m.getCedulaProfesional())) {
                medicoRepository.guardar(m);
                log.info("[MÉDICOS] Creado: {} ({})", m.getNombreCompleto(), m.getRol());
            }
        });
    }
}

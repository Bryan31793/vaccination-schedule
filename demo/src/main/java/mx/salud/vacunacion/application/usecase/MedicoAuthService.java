package mx.salud.vacunacion.application.usecase;

import mx.salud.vacunacion.domain.model.PersonalMedico;
import mx.salud.vacunacion.domain.port.in.Puertos;
import mx.salud.vacunacion.domain.port.out.Repositorios;
import mx.salud.vacunacion.domain.service.VacunacionException;
import mx.salud.vacunacion.infrastructure.config.JwtConfig;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class MedicoAuthService
        implements Puertos.RegistrarMedico, Puertos.LoginMedico {

    private final Repositorios.PersonalMedicoRepository medicoRepository;
    private final PasswordEncoder                        passwordEncoder;
    private final JwtConfig                              jwtConfig;

    public MedicoAuthService(Repositorios.PersonalMedicoRepository medicoRepository,
                             PasswordEncoder passwordEncoder,
                             JwtConfig jwtConfig) {
        this.medicoRepository = medicoRepository;
        this.passwordEncoder  = passwordEncoder;
        this.jwtConfig        = jwtConfig;
    }

    @Override
    public Puertos.RegistrarMedico.Resultado ejecutar(Puertos.RegistrarMedico.Comando cmd) {
        if (medicoRepository.existePorCedula(cmd.cedulaProfesional())) {
            throw new VacunacionException(
                    VacunacionException.Codigo.REGISTRO_DUPLICADO,
                    "Ya existe personal registrado con la cédula: " + cmd.cedulaProfesional());
        }

        PersonalMedico.Rol rol;
        try {
            rol = cmd.rol() != null
                    ? PersonalMedico.Rol.valueOf(cmd.rol().toUpperCase())
                    : PersonalMedico.Rol.MEDICO;
        } catch (IllegalArgumentException e) {
            rol = PersonalMedico.Rol.MEDICO;
        }

        var medico = new PersonalMedico(
                cmd.nombreCompleto(),
                cmd.cedulaProfesional(),
                passwordEncoder.encode(cmd.password()),
                rol);

        medicoRepository.guardar(medico);

        String token = jwtConfig.generarToken(medico.getCedulaProfesional(), rol.name());
        return new Puertos.RegistrarMedico.Resultado(
                token, medico.getNombreCompleto(),
                medico.getCedulaProfesional(), rol.name());
    }

    @Override
    public Puertos.LoginMedico.Resultado ejecutar(Puertos.LoginMedico.Comando cmd) {
        var medico = medicoRepository.buscarPorCedula(cmd.cedulaProfesional())
                .orElseThrow(() -> new VacunacionException(
                        VacunacionException.Codigo.CREDENCIALES_INVALIDAS,
                        "Cédula o contraseña incorrectos"));

        if (!medico.isActivo()) {
            throw new VacunacionException(
                    VacunacionException.Codigo.CREDENCIALES_INVALIDAS,
                    "Cuenta desactivada. Contacte al administrador.");
        }

        if (!passwordEncoder.matches(cmd.password(), medico.getPasswordHash())) {
            throw new VacunacionException(
                    VacunacionException.Codigo.CREDENCIALES_INVALIDAS,
                    "Cédula o contraseña incorrectos");
        }

        String token = jwtConfig.generarToken(
                medico.getCedulaProfesional(), medico.getRol().name());
        return new Puertos.LoginMedico.Resultado(
                token, medico.getNombreCompleto(),
                medico.getCedulaProfesional(), medico.getRol().name());
    }
}

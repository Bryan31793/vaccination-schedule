package mx.salud.vacunacion.application.usecase;

import mx.salud.vacunacion.domain.model.CredencialCiudadano;
import mx.salud.vacunacion.domain.model.Paciente;
import mx.salud.vacunacion.domain.port.in.Puertos;
import mx.salud.vacunacion.domain.port.out.Repositorios;
import mx.salud.vacunacion.domain.service.VacunacionException;
import mx.salud.vacunacion.infrastructure.config.JwtConfig;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class CiudadanoAuthService
        implements Puertos.RegistrarCiudadano, Puertos.LoginCiudadano {

    private final Repositorios.PacienteRepository         pacienteRepo;
    private final Repositorios.CredencialCiudadanoRepository credencialRepo;
    private final Puertos.RegistrarPaciente                registrarPaciente;
    private final PasswordEncoder                          passwordEncoder;
    private final JwtConfig                                jwtConfig;

    public CiudadanoAuthService(
            Repositorios.PacienteRepository pacienteRepo,
            Repositorios.CredencialCiudadanoRepository credencialRepo,
            Puertos.RegistrarPaciente registrarPaciente,
            PasswordEncoder passwordEncoder,
            JwtConfig jwtConfig) {
        this.pacienteRepo     = pacienteRepo;
        this.credencialRepo   = credencialRepo;
        this.registrarPaciente = registrarPaciente;
        this.passwordEncoder  = passwordEncoder;
        this.jwtConfig        = jwtConfig;
    }

    @Override
    @Transactional
    public Puertos.RegistrarCiudadano.Resultado ejecutar(Puertos.RegistrarCiudadano.Comando cmd) {
        String curp = cmd.curp().toUpperCase();

        if (credencialRepo.existePorCurp(curp)) {
            throw new VacunacionException(
                    VacunacionException.Codigo.CIUDADANO_YA_REGISTRADO,
                    "Ya existe una cuenta para la CURP: " + curp);
        }

        Paciente paciente;
        if (pacienteRepo.existePorCurp(curp)) {
            paciente = pacienteRepo.buscarPorCurp(curp)
                    .orElseThrow(() -> new VacunacionException.PacienteNoEncontrado(curp));
        } else {
            var comandoPaciente = new Puertos.RegistrarPaciente.Comando(
                    curp, cmd.nombre(), cmd.apellidoPaterno(), cmd.apellidoMaterno(),
                    cmd.fechaNacimiento(), cmd.sexo(), cmd.municipio(), cmd.estado());
            paciente = registrarPaciente.ejecutar(comandoPaciente);
        }

        var credencial = new CredencialCiudadano(
                UUID.randomUUID().toString(),
                curp,
                passwordEncoder.encode(cmd.password()),
                true,
                LocalDateTime.now());
        credencialRepo.guardar(credencial);

        return new Puertos.RegistrarCiudadano.Resultado(
                jwtConfig.generarToken(curp), curp, paciente.nombreCompleto());
    }

    @Override
    @Transactional(readOnly = true)
    public Puertos.LoginCiudadano.Resultado ejecutar(Puertos.LoginCiudadano.Comando cmd) {
        String curp = cmd.curp().toUpperCase();

        var credencial = credencialRepo.buscarPorCurp(curp)
                .orElseThrow(() -> new VacunacionException(
                        VacunacionException.Codigo.CREDENCIALES_INVALIDAS,
                        "CURP o contraseña incorrectos"));

        if (!credencial.isActivo()) {
            throw new VacunacionException(
                    VacunacionException.Codigo.CREDENCIALES_INVALIDAS,
                    "La cuenta está desactivada. Contacte al administrador.");
        }

        if (!passwordEncoder.matches(cmd.password(), credencial.getPasswordHash())) {
            throw new VacunacionException(
                    VacunacionException.Codigo.CREDENCIALES_INVALIDAS,
                    "CURP o contraseña incorrectos");
        }

        Paciente paciente = pacienteRepo.buscarPorCurp(curp)
                .orElseThrow(() -> new VacunacionException.PacienteNoEncontrado(curp));

        String expiracion = LocalDateTime.now()
                .plusSeconds(jwtConfig.getExpiration() / 1000)
                .toString();

        return new Puertos.LoginCiudadano.Resultado(
                jwtConfig.generarToken(curp), curp, paciente.nombreCompleto(), expiracion);
    }
}

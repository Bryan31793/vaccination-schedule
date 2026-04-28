package mx.salud.vacunacion.application.usecase;

import mx.salud.vacunacion.domain.model.Paciente;
import mx.salud.vacunacion.domain.model.RegistroVacunacion;
import mx.salud.vacunacion.domain.model.Vacuna;
import mx.salud.vacunacion.domain.port.in.Puertos;
import mx.salud.vacunacion.domain.port.out.Repositorios;
import mx.salud.vacunacion.domain.service.VacunacionException;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class ConsultarHistorialService implements Puertos.ConsultarHistorial {

    private final Repositorios.PacienteRepository pacienteRepository;
    private final Repositorios.RegistroVacunacionRepository registroRepository;
    private final Repositorios.VacunaRepository vacunaRepository;

    public ConsultarHistorialService(
            Repositorios.PacienteRepository pacienteRepository,
            Repositorios.RegistroVacunacionRepository registroRepository,
            Repositorios.VacunaRepository vacunaRepository) {
        this.pacienteRepository = pacienteRepository;
        this.registroRepository = registroRepository;
        this.vacunaRepository   = vacunaRepository;
    }

    @Override
    public HistorialPaciente porCurp(String curp) {
        Paciente paciente = pacienteRepository.buscarPorCurp(curp)
                .orElseThrow(() -> new VacunacionException.PacienteNoEncontrado(curp));

        List<RegistroVacunacion> registros = registroRepository
                .buscarPorPaciente(paciente.getId())
                .stream()
                .filter(RegistroVacunacion::estaAplicada)
                .toList();

        Set<String> vacunasAplicadasIds = registros.stream()
                .map(r -> r.getVacuna().getId())
                .collect(Collectors.toSet());

        List<Vacuna> pendientes = vacunaRepository.buscarTodas().stream()
                .filter(v -> !vacunasAplicadasIds.contains(v.getId()))
                .toList();

        return new HistorialPaciente(paciente, registros, pendientes);
    }
}

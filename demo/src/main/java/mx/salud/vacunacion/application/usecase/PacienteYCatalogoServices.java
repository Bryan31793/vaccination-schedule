package mx.salud.vacunacion.application.usecase;

import mx.salud.vacunacion.domain.model.Paciente;
import mx.salud.vacunacion.domain.model.Vacuna;
import mx.salud.vacunacion.domain.port.in.Puertos;
import mx.salud.vacunacion.domain.port.out.Repositorios;
import mx.salud.vacunacion.domain.service.VacunacionException;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Agrupa los servicios de gestión de pacientes y catálogo de vacunas.
 * Implementa los puertos de entrada correspondientes mediante inyección por constructor.
 */
public final class PacienteYCatalogoServices {

    private PacienteYCatalogoServices() {}

    // ── Registrar Paciente ────────────────────────────────────────────────────

    @Service
    @Transactional
    public static class RegistrarPacienteService implements Puertos.RegistrarPaciente {

        private final Repositorios.PacienteRepository pacienteRepository;

        public RegistrarPacienteService(Repositorios.PacienteRepository pacienteRepository) {
            this.pacienteRepository = pacienteRepository;
        }

        @Override
        public Paciente ejecutar(Comando comando) {
            if (pacienteRepository.existePorCurp(comando.curp())) {
                throw new VacunacionException.RegistroDuplicado(comando.curp(), "—", 0);
            }
            Paciente paciente = new Paciente(
                    comando.curp(),
                    comando.nombre(),
                    comando.apellidoPaterno(),
                    comando.apellidoMaterno(),
                    LocalDate.parse(comando.fechaNacimiento()),
                    comando.sexo(),
                    comando.municipio(),
                    comando.estado()
            );
            return pacienteRepository.guardar(paciente);
        }
    }

    // ── Consultar Paciente ────────────────────────────────────────────────────

    @Service
    @Transactional(readOnly = true)
    public static class ConsultarPacienteService implements Puertos.ConsultarPaciente {

        private final Repositorios.PacienteRepository pacienteRepository;

        public ConsultarPacienteService(Repositorios.PacienteRepository pacienteRepository) {
            this.pacienteRepository = pacienteRepository;
        }

        @Override
        public Optional<Paciente> porCurp(String curp) {
            return pacienteRepository.buscarPorCurp(curp);
        }

        @Override
        public Optional<Paciente> porId(String id) {
            return pacienteRepository.buscarPorId(id);
        }

        @Override
        public List<Paciente> todos() {
            return pacienteRepository.buscarTodos();
        }
    }

    // ── Catálogo de Vacunas ───────────────────────────────────────────────────

    public interface GestionarCatalogo {
        Vacuna guardar(Vacuna vacuna);
        Optional<Vacuna> buscarPorId(String id);
        List<Vacuna> listarTodas();
        List<Vacuna> listarPorCategoria(Vacuna.Categoria categoria);
    }

    @Service
    @Transactional
    public static class GestionarCatalogoService implements GestionarCatalogo {

        private final Repositorios.VacunaRepository vacunaRepository;

        public GestionarCatalogoService(Repositorios.VacunaRepository vacunaRepository) {
            this.vacunaRepository = vacunaRepository;
        }

        @Override
        public Vacuna guardar(Vacuna vacuna) {
            return vacunaRepository.guardar(vacuna);
        }

        @Override
        public Optional<Vacuna> buscarPorId(String id) {
            return vacunaRepository.buscarPorId(id);
        }

        @Override
        public List<Vacuna> listarTodas() {
            return vacunaRepository.buscarTodas();
        }

        @Override
        public List<Vacuna> listarPorCategoria(Vacuna.Categoria categoria) {
            return vacunaRepository.buscarPorCategoria(categoria);
        }
    }
}

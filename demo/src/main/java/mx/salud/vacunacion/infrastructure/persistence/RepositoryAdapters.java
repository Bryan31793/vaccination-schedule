package mx.salud.vacunacion.infrastructure.persistence;

import mx.salud.vacunacion.domain.model.AlertaBrote;
import mx.salud.vacunacion.domain.model.CredencialCiudadano;
import mx.salud.vacunacion.domain.model.Paciente;
import mx.salud.vacunacion.domain.model.PersonalMedico;
import mx.salud.vacunacion.domain.model.RegistroVacunacion;
import mx.salud.vacunacion.domain.model.Vacuna;
import mx.salud.vacunacion.domain.port.out.Repositorios;
import mx.salud.vacunacion.infrastructure.persistence.entity.AlertaBroteEntity;
import mx.salud.vacunacion.infrastructure.persistence.entity.CredencialCiudadanoEntity;
import mx.salud.vacunacion.infrastructure.persistence.entity.PacienteEntity;
import mx.salud.vacunacion.infrastructure.persistence.entity.PersonalMedicoEntity;
import mx.salud.vacunacion.infrastructure.persistence.entity.RegistroVacunacionEntity;
import mx.salud.vacunacion.infrastructure.persistence.entity.VacunaEntity;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Adapters JPA que implementan los puertos de salida del dominio.
 * Los Spring Data repos (interfaces internas) son detalles de implementación;
 * el dominio solo conoce las interfaces de Repositorios.
 */
public final class RepositoryAdapters {

    private RepositoryAdapters() {}

    // ── Spring Data JPA interfaces (privadas al paquete infrastructure) ────────

    @Repository
    public interface PacienteJpaRepository extends JpaRepository<PacienteEntity, String> {
        Optional<PacienteEntity> findByCurp(String curp);
        boolean existsByCurp(String curp);
    }

    @Repository
    public interface VacunaJpaRepository extends JpaRepository<VacunaEntity, String> {
        List<VacunaEntity> findByCategoria(Vacuna.Categoria categoria);
    }

    @Repository
    public interface RegistroVacunacionJpaRepository extends JpaRepository<RegistroVacunacionEntity, String> {

        List<RegistroVacunacionEntity> findByPacienteId(String pacienteId);

        @Query("""
               SELECT COUNT(r) > 0 FROM RegistroVacunacionEntity r
               WHERE r.paciente.id = :pacienteId
                 AND r.vacuna.id   = :vacunaId
                 AND r.numeroDosis = :dosis
                 AND r.estado      = mx.salud.vacunacion.domain.model.RegistroVacunacion$EstadoRegistro.APLICADA
               """)
        boolean existeRegistroAplicado(@Param("pacienteId") String pacienteId,
                                       @Param("vacunaId")   String vacunaId,
                                       @Param("dosis")      int dosis);

        @Query("""
               SELECT r FROM RegistroVacunacionEntity r
               WHERE r.vacuna.id         = :vacunaId
                 AND r.paciente.estado   = :region
                 AND r.fechaAplicacion  >= :desde
                 AND r.fechaAplicacion  <= :hasta
               """)
        List<RegistroVacunacionEntity> findByVacunaIdAndRegionAndPeriodo(
                @Param("vacunaId") String vacunaId,
                @Param("region")   String region,
                @Param("desde")    LocalDateTime desde,
                @Param("hasta")    LocalDateTime hasta);

        @Query("""
               SELECT COUNT(r) FROM RegistroVacunacionEntity r
               WHERE r.vacuna.categoria  = :categoria
                 AND r.paciente.estado   = :region
                 AND r.fechaAplicacion  >= :desde
                 AND r.fechaAplicacion  <= :hasta
               """)
        long countByCategoriaAndRegionAndPeriodo(
                @Param("categoria") Vacuna.Categoria categoria,
                @Param("region")    String region,
                @Param("desde")     LocalDateTime desde,
                @Param("hasta")     LocalDateTime hasta);

        long countByFechaAplicacionBetween(LocalDateTime desde, LocalDateTime hasta);
    }

    @Repository
    public interface AlertaBroteJpaRepository extends JpaRepository<AlertaBroteEntity, String> {
        List<AlertaBroteEntity> findByAtendidaFalse();
        List<AlertaBroteEntity> findByRegion(String region);
    }

    // ── Adapter: PacienteRepository ───────────────────────────────────────────

    @Component
    public static class PacienteRepositoryAdapter implements Repositorios.PacienteRepository {

        private final PacienteJpaRepository jpa;

        public PacienteRepositoryAdapter(PacienteJpaRepository jpa) {
            this.jpa = jpa;
        }

        @Override
        public Paciente guardar(Paciente paciente) {
            return jpa.save(PacienteEntity.fromDomain(paciente)).toDomain();
        }

        @Override
        public Optional<Paciente> buscarPorCurp(String curp) {
            return jpa.findByCurp(curp).map(PacienteEntity::toDomain);
        }

        @Override
        public Optional<Paciente> buscarPorId(String id) {
            return jpa.findById(id).map(PacienteEntity::toDomain);
        }

        @Override
        public List<Paciente> buscarTodos() {
            return jpa.findAll().stream().map(PacienteEntity::toDomain).toList();
        }

        @Override
        public boolean existePorCurp(String curp) {
            return jpa.existsByCurp(curp);
        }
    }

    // ── Adapter: VacunaRepository ─────────────────────────────────────────────

    @Component
    public static class VacunaRepositoryAdapter implements Repositorios.VacunaRepository {

        private final VacunaJpaRepository jpa;

        public VacunaRepositoryAdapter(VacunaJpaRepository jpa) {
            this.jpa = jpa;
        }

        @Override
        public Vacuna guardar(Vacuna vacuna) {
            return jpa.save(VacunaEntity.fromDomain(vacuna)).toDomain();
        }

        @Override
        public Optional<Vacuna> buscarPorId(String id) {
            return jpa.findById(id).map(VacunaEntity::toDomain);
        }

        @Override
        public List<Vacuna> buscarTodas() {
            return jpa.findAll().stream().map(VacunaEntity::toDomain).toList();
        }

        @Override
        public List<Vacuna> buscarPorCategoria(Vacuna.Categoria categoria) {
            return jpa.findByCategoria(categoria).stream().map(VacunaEntity::toDomain).toList();
        }
    }

    // ── Adapter: RegistroVacunacionRepository ─────────────────────────────────

    @Component
    public static class RegistroVacunacionRepositoryAdapter implements Repositorios.RegistroVacunacionRepository {

        private final RegistroVacunacionJpaRepository registroJpa;
        private final PacienteJpaRepository           pacienteJpa;
        private final VacunaJpaRepository             vacunaJpa;

        public RegistroVacunacionRepositoryAdapter(
                RegistroVacunacionJpaRepository registroJpa,
                PacienteJpaRepository pacienteJpa,
                VacunaJpaRepository vacunaJpa) {
            this.registroJpa = registroJpa;
            this.pacienteJpa = pacienteJpa;
            this.vacunaJpa   = vacunaJpa;
        }

        @Override
        public RegistroVacunacion guardar(RegistroVacunacion registro) {
            PacienteEntity pe = pacienteJpa.getReferenceById(registro.getPaciente().getId());
            VacunaEntity   ve = vacunaJpa.getReferenceById(registro.getVacuna().getId());
            RegistroVacunacionEntity entity =
                    RegistroVacunacionEntity.fromDomain(registro, pe, ve);
            return registroJpa.save(entity).toDomain();
        }

        @Override
        public Optional<RegistroVacunacion> buscarPorId(String id) {
            return registroJpa.findById(id).map(RegistroVacunacionEntity::toDomain);
        }

        @Override
        public List<RegistroVacunacion> buscarPorPaciente(String pacienteId) {
            return registroJpa.findByPacienteId(pacienteId)
                    .stream().map(RegistroVacunacionEntity::toDomain).toList();
        }

        @Override
        public boolean existeRegistroAplicado(String pacienteId, String vacunaId, int numeroDosis) {
            return registroJpa.existeRegistroAplicado(pacienteId, vacunaId, numeroDosis);
        }

        @Override
        public List<RegistroVacunacion> buscarPorVacunaYRegionYPeriodo(
                String vacunaId, String region, LocalDateTime desde, LocalDateTime hasta) {
            return registroJpa.findByVacunaIdAndRegionAndPeriodo(vacunaId, region, desde, hasta)
                    .stream().map(RegistroVacunacionEntity::toDomain).toList();
        }

        @Override
        public long contarPorCategoriaYRegionYPeriodo(
                Vacuna.Categoria categoria, String region, LocalDateTime desde, LocalDateTime hasta) {
            return registroJpa.countByCategoriaAndRegionAndPeriodo(categoria, region, desde, hasta);
        }
    }

    // ── Adapter: AlertaBroteRepository ───────────────────────────────────────

    @Component
    public static class AlertaBroteRepositoryAdapter implements Repositorios.AlertaBroteRepository {

        private final AlertaBroteJpaRepository jpa;

        public AlertaBroteRepositoryAdapter(AlertaBroteJpaRepository jpa) {
            this.jpa = jpa;
        }

        @Override
        public AlertaBrote guardar(AlertaBrote alerta) {
            return jpa.save(AlertaBroteEntity.fromDomain(alerta)).toDomain();
        }

        @Override
        public List<AlertaBrote> buscarActivas() {
            return jpa.findByAtendidaFalse().stream().map(AlertaBroteEntity::toDomain).toList();
        }

        @Override
        public List<AlertaBrote> buscarPorRegion(String region) {
            return jpa.findByRegion(region).stream().map(AlertaBroteEntity::toDomain).toList();
        }

        @Override
        public Optional<AlertaBrote> buscarPorId(String id) {
            return jpa.findById(id).map(AlertaBroteEntity::toDomain);
        }
    }

    // ── Spring Data JPA: CredencialCiudadano ──────────────────────────────────

    @Repository
    public interface CredencialCiudadanoJpaRepository
            extends JpaRepository<CredencialCiudadanoEntity, String> {
        Optional<CredencialCiudadanoEntity> findByCurp(String curp);
        boolean existsByCurp(String curp);
    }

    // ── Adapter: CredencialCiudadanoRepository ────────────────────────────────

    @Component
    public static class CredencialCiudadanoRepositoryAdapter
            implements Repositorios.CredencialCiudadanoRepository {

        private final CredencialCiudadanoJpaRepository jpa;

        public CredencialCiudadanoRepositoryAdapter(CredencialCiudadanoJpaRepository jpa) {
            this.jpa = jpa;
        }

        @Override
        public CredencialCiudadano guardar(CredencialCiudadano credencial) {
            return jpa.save(CredencialCiudadanoEntity.fromDomain(credencial)).toDomain();
        }

        @Override
        public Optional<CredencialCiudadano> buscarPorCurp(String curp) {
            return jpa.findByCurp(curp).map(CredencialCiudadanoEntity::toDomain);
        }

        @Override
        public boolean existePorCurp(String curp) {
            return jpa.existsByCurp(curp);
        }
    }

    // ── Spring Data JPA: PersonalMedico ───────────────────────────────────────

    @Repository
    public interface PersonalMedicoJpaRepository
            extends JpaRepository<PersonalMedicoEntity, String> {
        Optional<PersonalMedicoEntity> findByCedulaProfesional(String cedula);
        boolean existsByCedulaProfesional(String cedula);
    }

    // ── Adapter: PersonalMedicoRepository ────────────────────────────────────

    @Component
    public static class PersonalMedicoRepositoryAdapter
            implements Repositorios.PersonalMedicoRepository {

        private final PersonalMedicoJpaRepository jpa;

        public PersonalMedicoRepositoryAdapter(PersonalMedicoJpaRepository jpa) {
            this.jpa = jpa;
        }

        @Override
        public PersonalMedico guardar(PersonalMedico medico) {
            return jpa.save(PersonalMedicoEntity.fromDomain(medico)).toDomain();
        }

        @Override
        public Optional<PersonalMedico> buscarPorCedula(String cedula) {
            return jpa.findByCedulaProfesional(cedula).map(PersonalMedicoEntity::toDomain);
        }

        @Override
        public boolean existePorCedula(String cedula) {
            return jpa.existsByCedulaProfesional(cedula);
        }
    }
}

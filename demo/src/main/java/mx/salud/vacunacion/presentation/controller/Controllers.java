package mx.salud.vacunacion.presentation.controller;

import jakarta.validation.Valid;
import mx.salud.vacunacion.application.usecase.PacienteYCatalogoServices;
import mx.salud.vacunacion.domain.model.Vacuna;
import mx.salud.vacunacion.domain.port.in.Puertos;
import mx.salud.vacunacion.domain.port.out.Repositorios;
import mx.salud.vacunacion.domain.service.VacunacionException;
import mx.salud.vacunacion.infrastructure.persistence.RepositoryAdapters;
import mx.salud.vacunacion.presentation.dto.Dtos;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * Cinco controladores REST agrupados por dominio funcional.
 * Cada uno recibe sus casos de uso por constructor (sin @Autowired).
 */
public final class Controllers {

    private Controllers() {}

    // ── 1. Pacientes ──────────────────────────────────────────────────────────

    @RestController
    @RequestMapping("/api/pacientes")
    public static class PacienteController {

        private final Puertos.RegistrarPaciente registrarPaciente;
        private final Puertos.ConsultarPaciente consultarPaciente;

        public PacienteController(
                Puertos.RegistrarPaciente registrarPaciente,
                Puertos.ConsultarPaciente consultarPaciente) {
            this.registrarPaciente = registrarPaciente;
            this.consultarPaciente = consultarPaciente;
        }

        @PostMapping
        public ResponseEntity<Dtos.PacienteResponse> registrar(
                @Valid @RequestBody Dtos.RegistrarPacienteRequest req) {
            var cmd = new Puertos.RegistrarPaciente.Comando(
                    req.curp(), req.nombre(), req.apellidoPaterno(), req.apellidoMaterno(),
                    req.fechaNacimiento().toString(), req.sexo(), req.municipio(), req.estado());
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Dtos.PacienteResponse.fromDomain(registrarPaciente.ejecutar(cmd)));
        }

        @GetMapping("/{curp}")
        public ResponseEntity<Dtos.PacienteResponse> porCurp(@PathVariable String curp) {
            return consultarPaciente.porCurp(curp.toUpperCase())
                    .map(p -> ResponseEntity.ok(Dtos.PacienteResponse.fromDomain(p)))
                    .orElseThrow(() -> new VacunacionException.PacienteNoEncontrado(curp));
        }

        @GetMapping
        public List<Dtos.PacienteResponse> listar() {
            return consultarPaciente.todos().stream()
                    .map(Dtos.PacienteResponse::fromDomain)
                    .toList();
        }
    }

    // ── 2. Historial de Vacunación ────────────────────────────────────────────

    @RestController
    @RequestMapping("/api/pacientes/{curp}/historial")
    public static class HistorialController {

        private final Puertos.ConsultarHistorial consultarHistorial;

        public HistorialController(Puertos.ConsultarHistorial consultarHistorial) {
            this.consultarHistorial = consultarHistorial;
        }

        @GetMapping
        public Dtos.HistorialResponse historial(@PathVariable String curp) {
            var h = consultarHistorial.porCurp(curp.toUpperCase());
            List<Dtos.RegistroVacunacionResponse> aplicadas = h.registros().stream()
                    .map(Dtos.RegistroVacunacionResponse::fromDomain).toList();
            List<Dtos.VacunaResponse> pendientes = h.vacunasPendientes().stream()
                    .map(Dtos.VacunaResponse::fromDomain).toList();
            return new Dtos.HistorialResponse(
                    Dtos.PacienteResponse.fromDomain(h.paciente()),
                    aplicadas, pendientes,
                    aplicadas.size(), pendientes.size());
        }
    }

    // ── 3. Aplicar Vacuna ─────────────────────────────────────────────────────

    @RestController
    @RequestMapping("/api/vacunaciones")
    public static class VacunacionController {

        private final Puertos.AplicarVacuna aplicarVacuna;

        public VacunacionController(Puertos.AplicarVacuna aplicarVacuna) {
            this.aplicarVacuna = aplicarVacuna;
        }

        @PostMapping
        public ResponseEntity<Dtos.RegistroVacunacionResponse> aplicar(
                @Valid @RequestBody Dtos.AplicarVacunaRequest req) {
            var cmd = new Puertos.AplicarVacuna.Comando(
                    req.curpPaciente().toUpperCase(),
                    req.vacunaId(),
                    req.numeroDosis(),
                    req.lote(),
                    req.unidadAplicadora(),
                    req.observaciones());
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Dtos.RegistroVacunacionResponse.fromDomain(aplicarVacuna.ejecutar(cmd)));
        }
    }

    // ── 4. Catálogo de Vacunas ────────────────────────────────────────────────

    @RestController
    @RequestMapping("/api/vacunas")
    public static class VacunaController {

        private final PacienteYCatalogoServices.GestionarCatalogoService catalogo;

        public VacunaController(PacienteYCatalogoServices.GestionarCatalogoService catalogo) {
            this.catalogo = catalogo;
        }

        @GetMapping
        public List<Dtos.VacunaResponse> listar() {
            return catalogo.listarTodas().stream()
                    .map(Dtos.VacunaResponse::fromDomain).toList();
        }

        @GetMapping("/{id}")
        public Dtos.VacunaResponse porId(@PathVariable String id) {
            return catalogo.buscarPorId(id)
                    .map(Dtos.VacunaResponse::fromDomain)
                    .orElseThrow(() -> new VacunacionException.VacunaNoEncontrada(id));
        }

        @GetMapping("/categoria/{categoria}")
        public List<Dtos.VacunaResponse> porCategoria(
                @PathVariable Vacuna.Categoria categoria) {
            return catalogo.listarPorCategoria(categoria).stream()
                    .map(Dtos.VacunaResponse::fromDomain).toList();
        }
    }

    // ── 5. Detección de Brotes ────────────────────────────────────────────────

    @RestController
    @RequestMapping("/api/brotes")
    public static class BroteController {

        private final Puertos.DetectarBrotes detectarBrotes;

        public BroteController(Puertos.DetectarBrotes detectarBrotes) {
            this.detectarBrotes = detectarBrotes;
        }

        @PostMapping("/analizar")
        public List<Dtos.AlertaBroteResponse> analizar(
                @Valid @RequestBody Dtos.DetectarBrotesRequest req) {
            var cmd = new Puertos.DetectarBrotes.Comando(
                    req.region(), req.categoriaVacuna(), req.umbral());
            return detectarBrotes.analizar(cmd).stream()
                    .map(Dtos.AlertaBroteResponse::fromDomain).toList();
        }

        @GetMapping("/activos")
        public List<Dtos.AlertaBroteResponse> activos() {
            return detectarBrotes.alertasActivas().stream()
                    .map(Dtos.AlertaBroteResponse::fromDomain).toList();
        }
    }

    // ── 6. Consulta LLM ───────────────────────────────────────────────────────

    @RestController
    @RequestMapping("/api/consultas")
    public static class LlmController {

        private final Puertos.ConsultarLlm consultarLlm;

        public LlmController(Puertos.ConsultarLlm consultarLlm) {
            this.consultarLlm = consultarLlm;
        }

        @PostMapping("/llm")
        public Dtos.LlmRespuestaResponse consultar(
                @Valid @RequestBody Dtos.ConsultaLlmRequest req) {
            var pregunta = new Puertos.ConsultarLlm.Pregunta(
                    req.curpPaciente().toUpperCase(), req.pregunta());
            var respuesta = consultarLlm.consultar(pregunta);
            return new Dtos.LlmRespuestaResponse(
                    req.curpPaciente(), req.pregunta(),
                    respuesta.texto(), respuesta.generadaPorIa());
        }
    }

    // ── 7. Simulación Epidemiológica ─────────────────────────────────────────

    @RestController
    @RequestMapping("/api/simulacion")
    public static class SimulacionController {

        private final Puertos.EjecutarSimulacion ejecutarSimulacion;

        public SimulacionController(Puertos.EjecutarSimulacion ejecutarSimulacion) {
            this.ejecutarSimulacion = ejecutarSimulacion;
        }

        @PostMapping("/ejecutar")
        public ResponseEntity<Void> ejecutar() {
            ejecutarSimulacion.ejecutar();
            return ResponseEntity.ok().build();
        }

        @GetMapping("/video")
        public ResponseEntity<byte[]> obtenerVideo() {
            byte[] video = ejecutarSimulacion.obtenerVideo();
            return ResponseEntity.ok()
                    .header("Content-Type", "video/mp4")
                    .body(video);
        }
    }

    // ── 8. Chatbot General ────────────────────────────────────────────────────

    @RestController
    @RequestMapping("/api/chatbot")
    public static class ChatbotController {

        private final Puertos.ConsultarChatbot consultarChatbot;

        public ChatbotController(Puertos.ConsultarChatbot consultarChatbot) {
            this.consultarChatbot = consultarChatbot;
        }

        @PostMapping
        public Dtos.ChatbotMensajeResponse chat(
                @Valid @RequestBody Dtos.ChatbotMensajeRequest req) {
            var respuesta = consultarChatbot.procesar(
                    new Puertos.ConsultarChatbot.Mensaje(req.mensaje()));
            return new Dtos.ChatbotMensajeResponse(respuesta.texto());
        }
    }

    // ── 9. Portal del Ciudadano ───────────────────────────────────────────────

    @RestController
    @RequestMapping("/api/ciudadano")
    public static class CiudadanoController {

        private final Puertos.RegistrarCiudadano  registrarCiudadano;
        private final Puertos.LoginCiudadano      loginCiudadano;
        private final Puertos.ConsultarPaciente   consultarPaciente;
        private final Puertos.ConsultarHistorial  consultarHistorial;

        public CiudadanoController(Puertos.RegistrarCiudadano registrarCiudadano,
                                   Puertos.LoginCiudadano loginCiudadano,
                                   Puertos.ConsultarPaciente consultarPaciente,
                                   Puertos.ConsultarHistorial consultarHistorial) {
            this.registrarCiudadano = registrarCiudadano;
            this.loginCiudadano     = loginCiudadano;
            this.consultarPaciente  = consultarPaciente;
            this.consultarHistorial = consultarHistorial;
        }

        @PostMapping("/registro")
        public ResponseEntity<Dtos.TokenResponse> registro(
                @Valid @RequestBody Dtos.RegistroCiudadanoRequest req) {
            var cmd = new Puertos.RegistrarCiudadano.Comando(
                    req.curp().toUpperCase(),
                    req.password(),
                    req.nombre(),
                    req.apellidoPaterno(),
                    req.apellidoMaterno(),
                    req.fechaNacimiento().toString(),
                    req.sexo(),
                    req.municipio(),
                    req.estado());
            var res = registrarCiudadano.ejecutar(cmd);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new Dtos.TokenResponse(res.token(), res.curp(), res.nombreCompleto(), null));
        }

        @PostMapping("/login")
        public Dtos.TokenResponse login(
                @Valid @RequestBody Dtos.LoginCiudadanoRequest req) {
            var cmd = new Puertos.LoginCiudadano.Comando(req.curp().toUpperCase(), req.password());
            var res = loginCiudadano.ejecutar(cmd);
            return new Dtos.TokenResponse(res.token(), res.curp(), res.nombreCompleto(), res.expiracion());
        }

        @GetMapping("/perfil")
        public Dtos.PacienteResponse perfil(Authentication auth) {
            String curp = auth.getName();
            return consultarPaciente.porCurp(curp)
                    .map(Dtos.PacienteResponse::fromDomain)
                    .orElseThrow(() -> new VacunacionException.PacienteNoEncontrado(curp));
        }

        @GetMapping("/historial")
        public Dtos.HistorialResponse historial(Authentication auth) {
            String curp = auth.getName();
            var h = consultarHistorial.porCurp(curp);
            var aplicadas  = h.registros().stream()
                    .map(Dtos.RegistroVacunacionResponse::fromDomain).toList();
            var pendientes = h.vacunasPendientes().stream()
                    .map(Dtos.VacunaResponse::fromDomain).toList();
            return new Dtos.HistorialResponse(
                    Dtos.PacienteResponse.fromDomain(h.paciente()),
                    aplicadas, pendientes,
                    aplicadas.size(), pendientes.size());
        }
    }

    // ── 10. Auth Médico ───────────────────────────────────────────────────────

    @RestController
    @RequestMapping("/api/auth/medico")
    public static class AuthMedicoController {

        private final Puertos.RegistrarMedico registrarMedico;
        private final Puertos.LoginMedico     loginMedico;

        public AuthMedicoController(Puertos.RegistrarMedico registrarMedico,
                                    Puertos.LoginMedico loginMedico) {
            this.registrarMedico = registrarMedico;
            this.loginMedico     = loginMedico;
        }

        @PostMapping("/registro")
        public ResponseEntity<Dtos.MedicoTokenResponse> registro(
                @Valid @RequestBody Dtos.RegistroMedicoRequest req) {
            var cmd = new Puertos.RegistrarMedico.Comando(
                    req.nombreCompleto(), req.cedulaProfesional(),
                    req.password(), req.rol());
            var res = registrarMedico.ejecutar(cmd);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new Dtos.MedicoTokenResponse(
                            res.token(), res.nombreCompleto(),
                            res.cedulaProfesional(), res.rol()));
        }

        @PostMapping("/login")
        public Dtos.MedicoTokenResponse login(
                @Valid @RequestBody Dtos.LoginMedicoRequest req) {
            var cmd = new Puertos.LoginMedico.Comando(
                    req.cedulaProfesional(), req.password());
            var res = loginMedico.ejecutar(cmd);
            return new Dtos.MedicoTokenResponse(
                    res.token(), res.nombreCompleto(),
                    res.cedulaProfesional(), res.rol());
        }

        @GetMapping("/perfil")
        public Dtos.MedicoTokenResponse perfil(Authentication auth) {
            // Devuelve info básica del token activo (subject = cédula)
            String cedula = auth.getName();
            String rol    = auth.getAuthorities().iterator().next()
                                .getAuthority().replace("ROLE_", "");
            return new Dtos.MedicoTokenResponse(null, null, cedula, rol);
        }
    }

    // ── 11. Dashboard ─────────────────────────────────────────────────────────

    @RestController
    @RequestMapping("/api/dashboard")
    public static class DashboardController {

        private final Repositorios.PacienteRepository           pacienteRepo;
        private final Repositorios.VacunaRepository             vacunaRepo;
        private final Repositorios.AlertaBroteRepository        broteRepo;
        private final RepositoryAdapters.RegistroVacunacionJpaRepository registroJpa;

        public DashboardController(
                Repositorios.PacienteRepository pacienteRepo,
                Repositorios.VacunaRepository vacunaRepo,
                Repositorios.AlertaBroteRepository broteRepo,
                RepositoryAdapters.RegistroVacunacionJpaRepository registroJpa) {
            this.pacienteRepo = pacienteRepo;
            this.vacunaRepo   = vacunaRepo;
            this.broteRepo    = broteRepo;
            this.registroJpa  = registroJpa;
        }

        @GetMapping("/resumen")
        public Map<String, Object> resumen() {
            LocalDateTime inicioDia = LocalDate.now().atStartOfDay();
            LocalDateTime finDia    = inicioDia.plusDays(1).minusNanos(1);

            long totalPacientes      = pacienteRepo.buscarTodos().size();
            long totalVacunas        = vacunaRepo.buscarTodas().size();
            long vacunasAplicadasHoy = registroJpa.countByFechaAplicacionBetween(inicioDia, finDia);
            long alertasActivas      = broteRepo.buscarActivas().size();

            return Map.of(
                "totalPacientes",      totalPacientes,
                "totalVacunas",        totalVacunas,
                "vacunasAplicadasHoy", vacunasAplicadasHoy,
                "alertasActivas",      alertasActivas
            );
        }
    }
}

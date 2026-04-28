package mx.salud.vacunacion.presentation.controller;

import jakarta.validation.Valid;
import mx.salud.vacunacion.application.usecase.PacienteYCatalogoServices;
import mx.salud.vacunacion.domain.model.Vacuna;
import mx.salud.vacunacion.domain.port.in.Puertos;
import mx.salud.vacunacion.domain.service.VacunacionException;
import mx.salud.vacunacion.presentation.dto.Dtos;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
}

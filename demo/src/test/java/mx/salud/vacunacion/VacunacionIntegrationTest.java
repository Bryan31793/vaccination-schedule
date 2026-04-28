package mx.salud.vacunacion;

import mx.salud.vacunacion.domain.model.Vacuna;
import mx.salud.vacunacion.domain.port.in.Puertos;
import mx.salud.vacunacion.domain.port.out.Repositorios;
import mx.salud.vacunacion.domain.service.VacunacionException;
import mx.salud.vacunacion.presentation.dto.Dtos;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import tools.jackson.databind.ObjectMapper;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK)
@ActiveProfiles("dev")
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
class VacunacionIntegrationTest {

    @Autowired WebApplicationContext webApplicationContext;
    @Autowired ObjectMapper           mapper;
    @Autowired Puertos.RegistrarPaciente  registrarPaciente;
    @Autowired Puertos.AplicarVacuna      aplicarVacuna;
    @Autowired Puertos.ConsultarHistorial consultarHistorial;
    @Autowired Repositorios.VacunaRepository vacunaRepository;

    MockMvc mvc;

    private static final String CURP_VALIDA = "GOML800101HDFNRS09";

    @BeforeEach
    void setUp() {
        mvc = MockMvcBuilders
                .webAppContextSetup(webApplicationContext)
                .apply(SecurityMockMvcConfigurers.springSecurity())
                .build();
    }

    // ── Utilidades ────────────────────────────────────────────────────────────

    private void registrarPacienteBase() {
        registrarPaciente.ejecutar(new Puertos.RegistrarPaciente.Comando(
                CURP_VALIDA, "Luis", "González", "Morales",
                "1980-01-01", "H", "Gustavo A. Madero", "CDMX"));
    }

    private Vacuna primeraVacunaDisponible() {
        return vacunaRepository.buscarTodas().get(0);
    }

    // ── Tests de dominio (sin HTTP) ───────────────────────────────────────────

    @Test
    @DisplayName("Registrar paciente persiste y recupera por CURP")
    void registrarYConsultarPaciente() {
        registrarPacienteBase();

        var historial = consultarHistorial.porCurp(CURP_VALIDA);

        assertThat(historial.paciente().getCurp()).isEqualTo(CURP_VALIDA);
        assertThat(historial.registros()).isEmpty();
        assertThat(historial.vacunasPendientes()).isNotEmpty();
    }

    @Test
    @DisplayName("Aplicar vacuna registra dosis APLICADA en el historial")
    void aplicarVacunaActualizaHistorial() {
        registrarPacienteBase();
        Vacuna vacuna = primeraVacunaDisponible();

        aplicarVacuna.ejecutar(new Puertos.AplicarVacuna.Comando(
                CURP_VALIDA, vacuna.getId(), 1,
                "LOTE-TEST-001", "Centro de Salud Norte", null));

        var historial = consultarHistorial.porCurp(CURP_VALIDA);
        assertThat(historial.registros()).hasSize(1);
        assertThat(historial.registros().get(0).getVacuna().getId()).isEqualTo(vacuna.getId());
    }

    @Test
    @DisplayName("Aplicar la misma dosis dos veces lanza RegistroDuplicado")
    void aplicarVacunaDuplicadaLanzaExcepcion() {
        registrarPacienteBase();
        Vacuna vacuna = primeraVacunaDisponible();

        var cmd = new Puertos.AplicarVacuna.Comando(
                CURP_VALIDA, vacuna.getId(), 1, "LOTE-001", "Unidad 1", null);

        aplicarVacuna.ejecutar(cmd);

        assertThatThrownBy(() -> aplicarVacuna.ejecutar(cmd))
                .isInstanceOf(VacunacionException.RegistroDuplicado.class);
    }

    @Test
    @DisplayName("Lote INVALIDO es rechazado por el puerto COFEPRIS")
    void loteInvalidoEsRechazado() {
        registrarPacienteBase();
        Vacuna vacuna = primeraVacunaDisponible();

        var cmd = new Puertos.AplicarVacuna.Comando(
                CURP_VALIDA, vacuna.getId(), 1, "LOTE-INVALIDO", "Unidad 1", null);

        assertThatThrownBy(() -> aplicarVacuna.ejecutar(cmd))
                .isInstanceOf(VacunacionException.ValidacionCofeprisFallida.class);
    }

    // ── Tests HTTP (MockMvc) ──────────────────────────────────────────────────

    @Test
    @DisplayName("GET /api/vacunas retorna catálogo sin autenticación")
    void catalogoPublico() throws Exception {
        mvc.perform(get("/api/vacunas"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(10));
    }

    @Test
    @DisplayName("POST /api/pacientes sin autenticación retorna 401")
    void registrarSinAutenticacionRetorna401() throws Exception {
        var req = new Dtos.RegistrarPacienteRequest(
                CURP_VALIDA, "Luis", "González", "Morales",
                LocalDate.parse("1980-01-01"), "H", "GAM", "CDMX");

        mvc.perform(post("/api/pacientes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(req)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "admin", roles = "ADMIN")
    @DisplayName("POST /api/pacientes con CURP inválida retorna 400")
    void registrarCurpInvalidaRetorna400() throws Exception {
        var req = new Dtos.RegistrarPacienteRequest(
                "CURPCORTA", "Luis", "González", "Morales",
                LocalDate.parse("1980-01-01"), "H", "GAM", "CDMX");

        mvc.perform(post("/api/pacientes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.codigo").value("VALIDACION_FALLIDA"));
    }

    @Test
    @WithMockUser(username = "admin", roles = "ADMIN")
    @DisplayName("Flujo completo: registrar paciente → aplicar vacuna → consultar historial via HTTP")
    void flujoCompletoViaHttp() throws Exception {
        // 1. Registrar paciente
        var reqPaciente = new Dtos.RegistrarPacienteRequest(
                CURP_VALIDA, "Luis", "González", "Morales",
                LocalDate.parse("1980-01-01"), "H", "GAM", "CDMX");

        mvc.perform(post("/api/pacientes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(reqPaciente)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.curp").value(CURP_VALIDA));

        // 2. Aplicar vacuna
        Vacuna vacuna = primeraVacunaDisponible();
        var reqVacuna = new Dtos.AplicarVacunaRequest(
                CURP_VALIDA, vacuna.getId(), 1,
                "LOTE-HTTP-001", "Hospital General", null);

        mvc.perform(post("/api/vacunaciones")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(reqVacuna)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.estado").value("APLICADA"));

        // 3. Consultar historial
        mvc.perform(get("/api/pacientes/{curp}/historial", CURP_VALIDA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalAplicadas").value(1))
                .andExpect(jsonPath("$.vacunasAplicadas[0].vacunaNombre")
                        .value(vacuna.getNombre()));
    }
}

package mx.salud.vacunacion.presentation.controller;

import mx.salud.vacunacion.domain.service.VacunacionException;
import mx.salud.vacunacion.presentation.dto.Dtos;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    // ── Excepciones de dominio tipadas ────────────────────────────────────────

    @ExceptionHandler(VacunacionException.class)
    public ResponseEntity<Dtos.ErrorResponse> handleDomain(VacunacionException ex) {
        HttpStatus status = switch (ex.getCodigo()) {
            case PACIENTE_NO_ENCONTRADO, VACUNA_NO_ENCONTRADA -> HttpStatus.NOT_FOUND;
            case REGISTRO_DUPLICADO, CIUDADANO_YA_REGISTRADO  -> HttpStatus.CONFLICT;
            case DOSIS_INVALIDA, VALIDACION_COFEPRIS_FALLIDA  -> HttpStatus.valueOf(422);
            case BROTE_YA_ATENDIDO                            -> HttpStatus.CONFLICT;
            case CREDENCIALES_INVALIDAS                       -> HttpStatus.UNAUTHORIZED;
            case ERROR_INTERNO                                -> HttpStatus.INTERNAL_SERVER_ERROR;
        };
        log.warn("[DOMINIO] {} — {}", ex.getCodigo(), ex.getMessage());
        return ResponseEntity.status(status)
                .body(Dtos.ErrorResponse.of(status.value(), ex.getCodigo().name(), ex.getMessage()));
    }

    // ── Validación de Bean Validation (@Valid) ────────────────────────────────

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Dtos.ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        String detalle = ex.getBindingResult().getFieldErrors().stream()
                .map(e -> e.getField() + ": " + e.getDefaultMessage())
                .collect(Collectors.joining(", "));
        log.warn("[VALIDACIÓN] {}", detalle);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Dtos.ErrorResponse.of(400, "VALIDACION_FALLIDA", detalle));
    }

    // ── Argumento ilegal del dominio ──────────────────────────────────────────

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Dtos.ErrorResponse> handleIllegalArg(IllegalArgumentException ex) {
        log.warn("[ARGUMENTO] {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Dtos.ErrorResponse.of(400, "ARGUMENTO_INVALIDO", ex.getMessage()));
    }

    // ── Estado ilegal del agregado ────────────────────────────────────────────

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Dtos.ErrorResponse> handleIllegalState(IllegalStateException ex) {
        log.warn("[ESTADO] {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(Dtos.ErrorResponse.of(409, "ESTADO_INVALIDO", ex.getMessage()));
    }

    // ── Catch-all ─────────────────────────────────────────────────────────────

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Dtos.ErrorResponse> handleGeneric(Exception ex) {
        log.error("[ERROR INESPERADO]", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Dtos.ErrorResponse.of(500, "ERROR_INTERNO",
                        "Error interno del servidor. Contacte al administrador."));
    }
}

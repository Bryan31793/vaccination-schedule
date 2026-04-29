package mx.salud.vacunacion.application.usecase;

import mx.salud.vacunacion.domain.port.in.Puertos;
import mx.salud.vacunacion.domain.service.VacunacionException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Service
public class SimulacionService implements Puertos.EjecutarSimulacion {

    private static final Logger log = LoggerFactory.getLogger(SimulacionService.class);
    private static final String VIDEO_PATH = "../epidemic-graph-simulation/outputs/sir_dinamico.mp4";

    @Override
    public void ejecutar() {
        log.info("Iniciando simulación epidemiológica...");
        try {
            ProcessBuilder pb = new ProcessBuilder("python3", "main.py");
            pb.directory(new File("../epidemic-graph-simulation"));
            pb.inheritIO();
            Process process = pb.start();
            int exitCode = process.waitFor();
            if (exitCode != 0) {
                throw new VacunacionException(VacunacionException.Codigo.ERROR_INTERNO, 
                    "Error al ejecutar la simulación. Código de salida: " + exitCode);
            }
            log.info("Simulación completada con éxito.");
        } catch (IOException | InterruptedException e) {
            log.error("Error al ejecutar la simulación", e);
            throw new VacunacionException(VacunacionException.Codigo.ERROR_INTERNO, 
                "Error al ejecutar la simulación", e);
        }
    }

    @Override
    public byte[] obtenerVideo() {
        try {
            Path path = Paths.get(VIDEO_PATH);
            if (!Files.exists(path)) {
                throw new VacunacionException(VacunacionException.Codigo.ERROR_INTERNO, 
                    "El video de la simulación no existe. Ejecute la simulación primero.");
            }
            return Files.readAllBytes(path);
        } catch (IOException e) {
            log.error("Error al leer el video de la simulación", e);
            throw new VacunacionException(VacunacionException.Codigo.ERROR_INTERNO, 
                "Error al leer el video de la simulación", e);
        }
    }
}

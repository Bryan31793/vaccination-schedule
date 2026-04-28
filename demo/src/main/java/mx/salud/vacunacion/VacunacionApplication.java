package mx.salud.vacunacion;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class VacunacionApplication {

    public static void main(String[] args) {
        SpringApplication.run(VacunacionApplication.class, args);
    }
}

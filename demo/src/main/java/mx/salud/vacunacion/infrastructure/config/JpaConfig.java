package mx.salud.vacunacion.infrastructure.config;

import org.springframework.boot.persistence.autoconfigure.EntityScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@Configuration
@EntityScan(basePackages = "mx.salud.vacunacion.infrastructure.persistence.entity")
@EnableJpaRepositories(
        basePackages = "mx.salud.vacunacion.infrastructure.persistence",
        considerNestedRepositories = true
)
public class JpaConfig {}

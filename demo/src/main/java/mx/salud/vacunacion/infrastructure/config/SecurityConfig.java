package mx.salud.vacunacion.infrastructure.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Actuator y H2 console sin autenticación en dev
                .requestMatchers("/h2-console/**", "/actuator/**").permitAll()
                // Lectura de catálogo público y video de simulación
                .requestMatchers(HttpMethod.GET, "/api/vacunas/**", "/api/simulacion/video").permitAll()
                // Operaciones de escritura requieren rol ENFERMERO o superior
                .requestMatchers(HttpMethod.POST, "/api/vacunaciones/**").hasAnyRole("ENFERMERO", "MEDICO", "ADMIN")
                // Alertas de brote solo para personal médico y admin
                .requestMatchers("/api/brotes/**").hasAnyRole("MEDICO", "ADMIN")
                // Simulación para personal médico y admin
                .requestMatchers("/api/simulacion/**").hasAnyRole("MEDICO", "ADMIN")
                // El resto requiere autenticación
                .anyRequest().authenticated()
            )
            .httpBasic(basic -> {});

        // Permite frames para H2 console en dev
        http.headers(h -> h.frameOptions(fo -> fo.sameOrigin()));

        return http.build();
    }

    @Bean
    public UserDetailsService userDetailsService(PasswordEncoder encoder) {
        return new InMemoryUserDetailsManager(
            User.withUsername("admin")
                .password(encoder.encode("admin123"))
                .roles("ADMIN", "MEDICO", "ENFERMERO")
                .build(),
            User.withUsername("medico")
                .password(encoder.encode("medico123"))
                .roles("MEDICO", "ENFERMERO")
                .build(),
            User.withUsername("enfermero")
                .password(encoder.encode("enfermero123"))
                .roles("ENFERMERO")
                .build()
        );
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOriginPatterns(List.of("*")); // En desarrollo permite todo; restringir en producción
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", config);
        return source;
    }
}

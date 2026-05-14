package mx.salud.vacunacion.infrastructure.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
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
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    // ── JWT filter bean (no @Component para no registrarse como servlet filter) ──

    @Bean
    public JwtAuthFilter jwtAuthFilter(JwtConfig jwtConfig) {
        return new JwtAuthFilter(jwtConfig);
    }

    // ── Cadena 1: Auth médico — rutas públicas de registro/login ─────────────

    @Bean
    @Order(1)
    public SecurityFilterChain authMedicoPublicChain(HttpSecurity http) throws Exception {
        http
            .securityMatcher("/api/auth/medico/registro", "/api/auth/medico/login")
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth.anyRequest().permitAll());
        return http.build();
    }

    // ── Cadena 2: Portal del Ciudadano — JWT Bearer ───────────────────────────

    @Bean
    @Order(2)
    public SecurityFilterChain ciudadanoFilterChain(HttpSecurity http,
                                                    JwtAuthFilter jwtAuthFilter) throws Exception {
        http
            .securityMatcher("/api/ciudadano/**")
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.POST,
                        "/api/ciudadano/registro",
                        "/api/ciudadano/login").permitAll()
                .anyRequest().hasRole("CIUDADANO")
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // ── Cadena 3: Personal médico — JWT Bearer ────────────────────────────────

    @Bean
    @Order(3)
    public SecurityFilterChain staffFilterChain(HttpSecurity http,
                                                JwtAuthFilter jwtAuthFilter) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/h2-console/**", "/actuator/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/vacunas/**", "/api/simulacion/video", "/api/dashboard/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/vacunaciones/**").hasAnyRole("ENFERMERO", "MEDICO", "ADMIN")
                .requestMatchers("/api/brotes/**").hasAnyRole("MEDICO", "ADMIN")
                .requestMatchers("/api/simulacion/**").hasAnyRole("MEDICO", "ADMIN")
                .requestMatchers("/api/auth/medico/perfil").hasAnyRole("MEDICO", "ADMIN", "ENFERMERO")
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        http.headers(h -> h.frameOptions(fo -> fo.sameOrigin()));

        return http.build();
    }

    // ── Usuarios del personal (en memoria, sin cambios) ───────────────────────

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
        config.setAllowedOriginPatterns(List.of("*"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", config);
        return source;
    }
}

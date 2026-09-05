package com.university.fms.config;

import com.university.fms.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
@RequiredArgsConstructor
public class SecurityConfig {
    private final JwtAuthenticationFilter jwtFilter;
    private final UserDetailsService userDetailsService;
    @Value("${app.cors.allowed-origins}") private String allowedOrigins;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.csrf(AbstractHttpConfigurer::disable)
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/auth/**").permitAll()
                .requestMatchers("/health", "/actuator/health").permitAll()
                .requestMatchers(HttpMethod.GET, "/departments", "/leave-types", "/subjects").permitAll()
                .requestMatchers("/admin/**").hasAnyRole("SUPER_ADMIN")
                .requestMatchers("/payroll/**").hasAnyRole("SUPER_ADMIN", "DEAN", "HOD")
                .requestMatchers(HttpMethod.DELETE, "/faculty/**").hasAnyRole("SUPER_ADMIN", "DEAN")
                .requestMatchers("/leaves/approve/**", "/leaves/reject/**").hasAnyRole("SUPER_ADMIN", "DEAN", "HOD")
                .anyRequest().authenticated())
            .authenticationProvider(authenticationProvider())
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
    @Bean public AuthenticationProvider authenticationProvider(){DaoAuthenticationProvider p=new DaoAuthenticationProvider();p.setUserDetailsService(userDetailsService);p.setPasswordEncoder(passwordEncoder());return p;}
    @Bean public AuthenticationManager authenticationManager(AuthenticationConfiguration c)throws Exception{return c.getAuthenticationManager();}
    @Bean public PasswordEncoder passwordEncoder(){return new BCryptPasswordEncoder(12);}
    @Bean public CorsConfigurationSource corsConfigurationSource(){CorsConfiguration c=new CorsConfiguration();c.setAllowedOrigins(Arrays.asList(allowedOrigins.split(",")));c.setAllowedMethods(List.of("GET","POST","PUT","PATCH","DELETE","OPTIONS"));c.setAllowedHeaders(List.of("*"));c.setAllowCredentials(true);c.setMaxAge(3600L);UrlBasedCorsConfigurationSource s=new UrlBasedCorsConfigurationSource();s.registerCorsConfiguration("/**",c);return s;}
}

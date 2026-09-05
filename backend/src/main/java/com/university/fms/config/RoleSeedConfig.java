package com.university.fms.config;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class RoleSeedConfig implements CommandLineRunner {
    private final JdbcTemplate jdbc;

    @Override
    public void run(String... args) {
        String[][] roles = {
            {"STUDENT", "Student account"},
            {"TEACHER", "Teacher account"},
            {"FACULTY", "Faculty account"}
        };
        for (String[] role : roles) {
            jdbc.update("INSERT IGNORE INTO roles (role_name, description) VALUES (?, ?)", role[0], role[1]);
        }
    }
}

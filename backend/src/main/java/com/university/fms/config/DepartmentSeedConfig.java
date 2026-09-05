package com.university.fms.config;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Keeps the department lookup complete on every deployment.
 * INSERT IGNORE makes this safe when the departments already exist.
 */
@Component
@RequiredArgsConstructor
public class DepartmentSeedConfig implements CommandLineRunner {

    private final JdbcTemplate jdbc;

    @Override
    public void run(String... args) {
        String[][] departments = {
            {"CS", "Computer Science & Engineering"},
            {"IT", "Information Technology"},
            {"AI", "Artificial Intelligence & Machine Learning"},
            {"DS", "Data Science"},
            {"CSE-DS", "Computer Science & Engineering (Data Science)"},
            {"CSE-AI", "Computer Science & Engineering (Artificial Intelligence)"},
            {"ECE", "Electronics & Communication Engineering"},
            {"EEE", "Electrical & Electronics Engineering"},
            {"EE", "Electrical Engineering"},
            {"ME", "Mechanical Engineering"},
            {"CE", "Civil Engineering"},
            {"AE", "Automobile Engineering"},
            {"CHE", "Chemical Engineering"},
            {"AERO", "Aerospace Engineering"},
            {"BIO", "Biotechnology"},
            {"BME", "Biomedical Engineering"},
            {"ARCH", "Architecture"},
            {"MCA", "Master of Computer Applications"},
            {"MBA", "Master of Business Administration"},
            {"MCOM", "Master of Commerce"},
            {"MSC-CS", "M.Sc. Computer Science"},
            {"MSC-IT", "M.Sc. Information Technology"},
            {"SCI", "Basic Sciences"},
            {"MATH", "Mathematics"},
            {"PHY", "Physics"},
            {"CHEM", "Chemistry"},
            {"ENG", "English & Communication Skills"},
            {"COM", "Commerce & Management"},
            {"LAW", "Law"},
            {"EDU", "Education"}
        };

        for (String[] d : departments) {
            jdbc.update(
                "INSERT IGNORE INTO departments (dept_code, dept_name) VALUES (?, ?)",
                d[0], d[1]
            );
        }
    }
}

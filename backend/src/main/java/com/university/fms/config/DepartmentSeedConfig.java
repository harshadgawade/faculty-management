package com.university.fms.config;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/** Keeps the department lookup complete for the 2024 academic curriculum. */
@Component
@RequiredArgsConstructor
public class DepartmentSeedConfig implements CommandLineRunner {

    private final JdbcTemplate jdbc;

    @Override
    public void run(String... args) {
        String[][] departments = {
            {"CS", "Computer Science & Engineering"},
            {"IT", "Information Technology"},
            {"AIML", "Artificial Intelligence & Machine Learning"},
            {"DS", "Data Science"},
            {"CYBER", "Cyber Security"},
            {"SE", "Software Engineering"},
            {"CLOUD", "Cloud Computing"},
            {"BCA", "Computer Applications"},
            {"ECE", "Electronics & Communication"},
            {"EE", "Electrical Engineering"},
            {"ME", "Mechanical Engineering"},
            {"CE", "Civil Engineering"},
            {"AUTO", "Automobile Engineering"},
            {"RA", "Robotics & Automation"},
            {"BT", "Biotechnology"},
            {"BME", "Biomedical Engineering"},
            {"MATH", "Mathematics"},
            {"PHY", "Physics"},
            {"CHEM", "Chemistry"},
            {"CM", "Commerce & Management"},
            {"ENG", "English & Communication"},
            {"BBA", "Bachelor of Business Administration"}
        };

        for (String[] d : departments) {
            jdbc.update(
                "INSERT IGNORE INTO departments (dept_code, dept_name) VALUES (?, ?)",
                d[0], d[1]
            );
        }
    }
}

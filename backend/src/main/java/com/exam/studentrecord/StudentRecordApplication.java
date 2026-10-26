package com.exam.studentrecord;

import com.exam.studentrecord.entity.Student;
import com.exam.studentrecord.repository.StudentRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

/**
 * Main entry point for the Spring Boot application.
 */
@SpringBootApplication
public class StudentRecordApplication {

    public static void main(String[] args) {
        SpringApplication.run(StudentRecordApplication.class, args);
    }

    /**
     * Seeds initial sample student records on startup if database is empty.
     * Useful for practical lab demonstrations.
     */
    @Bean
    public CommandLineRunner initDatabase(StudentRepository repository) {
        return args -> {
            if (repository.count() == 0) {
                repository.save(new Student("21CS101", "Aarav Sharma", "Computer Science", "aarav.sharma@example.com"));
                repository.save(new Student("21IT102", "Priya Patel", "Information Technology", "priya.patel@example.com"));
                repository.save(new Student("21EC103", "Rahul Verma", "Electronics & Communication", "rahul.verma@example.com"));
                System.out.println(">>> Sample student records seeded successfully into H2 database.");
            }
        };
    }
}

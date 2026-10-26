package com.exam.studentrecord.service;

import com.exam.studentrecord.entity.Student;
import com.exam.studentrecord.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * Service layer containing business logic and input validation.
 */
@Service
public class StudentService {

    private final StudentRepository studentRepository;

    @Autowired
    public StudentService(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    /**
     * Retrieve all student records from the database.
     */
    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    /**
     * Retrieve a single student by ID.
     */
    public Optional<Student> getStudentById(Long id) {
        return studentRepository.findById(id);
    }

    /**
     * Create and save a new student record after validating fields.
     */
    public Student createStudent(Student student) {
        validateStudent(student);

        // Check if roll number already exists
        Optional<Student> existingStudent = studentRepository.findByRollNumber(student.getRollNumber().trim());
        if (existingStudent.isPresent()) {
            throw new IllegalArgumentException("Roll number already exists: " + student.getRollNumber());
        }

        // Clean values before saving
        student.setRollNumber(student.getRollNumber().trim().toUpperCase());
        student.setName(student.getName().trim());
        student.setBranch(student.getBranch().trim());
        student.setEmail(student.getEmail().trim().toLowerCase());

        return studentRepository.save(student);
    }

    /**
     * Update an existing student record by ID.
     */
    public Student updateStudent(Long id, Student studentDetails) {
        validateStudent(studentDetails);

        Student existingStudent = studentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Student not found with ID: " + id));

        // Check roll number uniqueness if changed
        String updatedRoll = studentDetails.getRollNumber().trim().toUpperCase();
        if (!existingStudent.getRollNumber().equalsIgnoreCase(updatedRoll)) {
            Optional<Student> duplicate = studentRepository.findByRollNumber(updatedRoll);
            if (duplicate.isPresent()) {
                throw new IllegalArgumentException("Roll number already exists: " + updatedRoll);
            }
        }

        existingStudent.setRollNumber(updatedRoll);
        existingStudent.setName(studentDetails.getName().trim());
        existingStudent.setBranch(studentDetails.getBranch().trim());
        existingStudent.setEmail(studentDetails.getEmail().trim().toLowerCase());

        return studentRepository.save(existingStudent);
    }

    /**
     * Delete a student by ID.
     */
    public void deleteStudent(Long id) {
        if (!studentRepository.existsById(id)) {
            throw new IllegalArgumentException("Student not found with ID: " + id);
        }
        studentRepository.deleteById(id);
    }

    /**
     * Helper validation method for required fields and basic email format.
     */
    private void validateStudent(Student student) {
        if (student == null) {
            throw new IllegalArgumentException("Student data cannot be empty.");
        }
        if (student.getRollNumber() == null || student.getRollNumber().trim().isEmpty()) {
            throw new IllegalArgumentException("Roll number is required.");
        }
        if (student.getName() == null || student.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Student name is required.");
        }
        if (student.getBranch() == null || student.getBranch().trim().isEmpty()) {
            throw new IllegalArgumentException("Branch is required.");
        }
        if (student.getEmail() == null || student.getEmail().trim().isEmpty()) {
            throw new IllegalArgumentException("Email is required.");
        }
        if (!student.getEmail().contains("@") || !student.getEmail().contains(".")) {
            throw new IllegalArgumentException("Please enter a valid email address.");
        }
    }
}

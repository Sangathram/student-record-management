package com.exam.studentrecord.repository;

import com.exam.studentrecord.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository interface providing standard CRUD operations via Spring Data JPA.
 * JpaRepository provides methods like findAll(), findById(), save(), deleteById().
 */
@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {
    Optional<Student> findByRollNumber(String rollNumber);
}

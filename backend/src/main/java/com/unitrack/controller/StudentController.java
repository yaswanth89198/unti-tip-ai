package com.unitrack.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/students")
@CrossOrigin(origins = "*")
public class StudentController {

    @GetMapping
    @PreAuthorize("hasAnyRole('DEAN', 'HOD', 'COORDINATOR')")
    public ResponseEntity<List<Map<String, Object>>> getAllStudents(
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String course,
            @RequestParam(required = false) Integer semester,
            @RequestParam(required = false) String search) {
        // Query database via StudentRepository and return filtered list
        return ResponseEntity.ok(Collections.emptyList());
    }

    @GetMapping("/{enrollmentId}")
    public ResponseEntity<?> getStudentProfile(@PathVariable String enrollmentId) {
        // Validate 6-digit enrollment ID and check authorization
        if (enrollmentId == null || !enrollmentId.matches("^\\d{6}$")) {
            return ResponseEntity.badRequest().body(Map.of("error", "Enrollment ID must be exactly 6 digits."));
        }
        return ResponseEntity.ok(Map.of("enrollmentId", enrollmentId, "status", "Found"));
    }

    @GetMapping("/{enrollmentId}/semesters/{semesterNumber}")
    public ResponseEntity<?> getSemesterRecords(
            @PathVariable String enrollmentId,
            @PathVariable Integer semesterNumber) {
        return ResponseEntity.ok(Map.of(
            "enrollmentId", enrollmentId,
            "semester", semesterNumber,
            "subjects", Collections.emptyList()
        ));
    }
}

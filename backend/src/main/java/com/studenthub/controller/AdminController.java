package com.studenthub.controller;

import com.studenthub.dto.DashboardStatsDto;
import com.studenthub.dto.StudentDto;
import com.studenthub.entity.User;
import com.studenthub.service.DashboardService;
import com.studenthub.service.StudentService;
import com.studenthub.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private DashboardService dashboardService;

    @Autowired
    private StudentService studentService;

    @Autowired
    private UserService userService;

    @PutMapping("/profile")
    public ResponseEntity<User> updateProfile(@RequestBody Map<String, String> payload) {
        User current = userService.getCurrentlyAuthenticatedUser();
        return ResponseEntity.ok(userService.updateAdminProfile(
                current.getId(),
                payload.get("fullName"),
                payload.get("email"),
                payload.get("password")
        ));
    }

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsDto> getDashboardStats() {
        DashboardStatsDto stats = dashboardService.getAdminStats();
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/students")
    public ResponseEntity<List<StudentDto>> getAllStudents() {
        List<StudentDto> students = studentService.getAllStudents();
        return ResponseEntity.ok(students);
    }

    @GetMapping("/students/search")
    public ResponseEntity<List<StudentDto>> searchStudents(@RequestParam String query) {
        List<StudentDto> students = studentService.searchStudents(query);
        return ResponseEntity.ok(students);
    }

    @DeleteMapping("/students/{id}")
    public ResponseEntity<Void> deleteStudentAccount(@PathVariable Long id) {
        studentService.deleteStudent(id);
        return ResponseEntity.noContent().build();
    }
}

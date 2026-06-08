package com.studenthub.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentDto {
    private Long studentId;
    private Long userId;

    @NotBlank(message = "Full name is required")
    private String fullName;

    private String email;

    @Pattern(regexp = "^$|^\\d{10}$", message = "Phone number must be exactly 10 digits")
    private String phone;

    @NotBlank(message = "Department is required")
    private String department;

    private Long instituteId;
    private String instituteName;
    private String password;
}

package com.studenthub;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.studenthub.repository.UserRepository;
import com.studenthub.entity.User;
import com.studenthub.entity.UserRole;

@SpringBootApplication
public class StudentHubApplication {
    public static void main(String[] args) {
        SpringApplication.run(StudentHubApplication.class, args);
    }

    @Bean
    public CommandLineRunner initDatabase(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            if (!userRepository.existsByEmail("superadmin@studenthub.com")) {
                User superAdmin = User.builder()
                        .fullName("Super Admin")
                        .email("superadmin@studenthub.com")
                        .password(passwordEncoder.encode("superadmin123"))
                        .role(UserRole.ROLE_SUPER_ADMIN)
                        .build();
                userRepository.save(superAdmin);
                System.out.println("Seeded superadmin@studenthub.com user");
            }
        };
    }
}

package com.burnouttracker;

import com.burnouttracker.model.ConsentRecord;
import com.burnouttracker.model.User;
import com.burnouttracker.model.enums.Role;
import com.burnouttracker.repository.ConsentRepository;
import com.burnouttracker.repository.UserRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements ApplicationRunner {

    private final UserRepository userRepository;
    private final ConsentRepository consentRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                          ConsentRepository consentRepository,
                          PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.consentRepository = consentRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(ApplicationArguments args) {
        createAdminIfNotExists();
        createCounselorIfNotExists();
    }

    private void createAdminIfNotExists() {
        String adminEmail = "admin@university.edu";

        if (userRepository.existsByEmail(adminEmail)) {
            return;
        }

        User admin = User.builder()
            .name("Admin User")
            .email(adminEmail)
            .password(passwordEncoder.encode("AdminPass123!"))
            .department("Administration")
            .role(Role.ADMIN)
            .isActive(true)
            .build();

        admin = userRepository.save(admin);

        ConsentRecord consentRecord = ConsentRecord.builder()
            .user(admin)
            .hasConsented(true)
            .anonymizeData(false)
            .build();
        consentRecord.setConsentedAt(java.time.LocalDateTime.now());

        consentRepository.save(consentRecord);

        System.out.println("Created admin account: admin@university.edu / AdminPass123!");
    }

    private void createCounselorIfNotExists() {
        String counselorEmail = "counselor@university.edu";

        if (userRepository.existsByEmail(counselorEmail)) {
            return;
        }

        User counselor = User.builder()
            .name("Counselor User")
            .email(counselorEmail)
            .password(passwordEncoder.encode("CounselorPass123!"))
            .department("Student Services")
            .role(Role.COUNSELOR)
            .isActive(true)
            .build();

        counselor = userRepository.save(counselor);

        ConsentRecord consentRecord = ConsentRecord.builder()
            .user(counselor)
            .hasConsented(true)
            .anonymizeData(false)
            .build();
        consentRecord.setConsentedAt(java.time.LocalDateTime.now());

        consentRepository.save(consentRecord);

        System.out.println("Created counselor account: counselor@university.edu / CounselorPass123!");
    }
}

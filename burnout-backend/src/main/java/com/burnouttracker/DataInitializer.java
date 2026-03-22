package com.burnouttracker;

import com.burnouttracker.model.*;
import com.burnouttracker.model.enums.*;
import com.burnouttracker.repository.*;
import com.burnouttracker.service.AlertTriggerService;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Component
public class DataInitializer implements ApplicationRunner {

    private final UserRepository userRepository;
    private final ConsentRepository consentRepository;
    private final PasswordEncoder passwordEncoder;
    private final MoodEntryRepository moodEntryRepository;
    private final BurnoutScoreRepository burnoutScoreRepository;
    private final AlertRepository alertRepository;
    private final AlertTriggerService alertTriggerService;

    public DataInitializer(UserRepository userRepository,
            ConsentRepository consentRepository,
            PasswordEncoder passwordEncoder,
            MoodEntryRepository moodEntryRepository,
            BurnoutScoreRepository burnoutScoreRepository,
            AlertRepository alertRepository,
            AlertTriggerService alertTriggerService) {
        this.userRepository = userRepository;
        this.consentRepository = consentRepository;
        this.passwordEncoder = passwordEncoder;
        this.moodEntryRepository = moodEntryRepository;
        this.burnoutScoreRepository = burnoutScoreRepository;
        this.alertRepository = alertRepository;
        this.alertTriggerService = alertTriggerService;
    }

    @Override
    public void run(ApplicationArguments args) {
        createAdminIfNotExists();
        createCounselorIfNotExists();
        // Skip seeding test students/alerts to focus on real-time database content
        System.out.println("Data initialization complete. Focusing on real-time database data.");
        
        evaluateExistingStudentsForAlerts();
    }

    private void createAdminIfNotExists() {
        String adminEmail = "admin@university.edu";
        if (userRepository.existsByEmail(adminEmail)) return;

        User admin = User.builder()
                .name("Admin User")
                .email(adminEmail)
                .password(passwordEncoder.encode("AdminPass123!"))
                .department("Administration")
                .role(Role.ADMIN)
                .isActive(true)
                .build();

        admin = userRepository.save(admin);
        createConsent(admin, true, false);
        System.out.println("Created admin account: admin@university.edu");
    }

    private void createCounselorIfNotExists() {
        String counselorEmail = "counselor@university.edu";
        if (userRepository.existsByEmail(counselorEmail)) return;

        User counselor = User.builder()
                .name("Counselor User")
                .email(counselorEmail)
                .password(passwordEncoder.encode("CounselorPass123!"))
                .department("Student Services")
                .role(Role.COUNSELOR)
                .isActive(true)
                .build();

        counselor = userRepository.save(counselor);
        createConsent(counselor, true, false);
        System.out.println("Created counselor account: counselor@university.edu");
    }

    private void evaluateExistingStudentsForAlerts() {
        System.out.println("Performing retroactive alert evaluation for all students...");
        userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.STUDENT)
                .forEach(u -> alertTriggerService.evaluateAndTriggerAlert(u.getId()));
        System.out.println("Retroactive evaluation complete.");
    }

    private void createConsent(User user, boolean hasConsented, boolean anonymizeData) {
        ConsentRecord consent = ConsentRecord.builder()
                .user(user)
                .hasConsented(hasConsented)
                .anonymizeData(anonymizeData)
                .build();
        consent.setConsentedAt(LocalDateTime.now());
        consentRepository.save(consent);
    }
}

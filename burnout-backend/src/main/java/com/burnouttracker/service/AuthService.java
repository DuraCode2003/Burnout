package com.burnouttracker.service;
 
import lombok.extern.slf4j.Slf4j;

import com.burnouttracker.dto.request.ConsentRequest;
import com.burnouttracker.dto.request.LoginRequest;
import com.burnouttracker.dto.request.RegisterRequest;
import com.burnouttracker.dto.response.AuthResponse;
import com.burnouttracker.model.ConsentRecord;
import com.burnouttracker.model.User;
import com.burnouttracker.model.enums.Role;
import com.burnouttracker.repository.ConsentRepository;
import com.burnouttracker.repository.UserRepository;
import com.burnouttracker.security.JwtTokenProvider;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final ConsentRepository consentRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthService(UserRepository userRepository,
                      ConsentRepository consentRepository,
                      PasswordEncoder passwordEncoder,
                      AuthenticationManager authenticationManager,
                      JwtTokenProvider jwtTokenProvider) {
        this.userRepository = userRepository;
        this.consentRepository = consentRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already registered: " + request.getEmail());
        }

        User user = User.builder()
            .name(request.getName())
            .email(request.getEmail())
            .password(passwordEncoder.encode(request.getPassword()))
            .department(request.getDepartment())
            .role(Role.STUDENT)
            .isActive(true)
            .build();

        user = userRepository.save(user);

        ConsentRecord consentRecord = ConsentRecord.builder()
            .user(user)
            .hasConsented(false)
            .anonymizeData(true)
            .build();

        consentRepository.save(consentRecord);

        var authentication = new UsernamePasswordAuthenticationToken(
            user.getEmail(),
            request.getPassword()
        );

        Authentication authenticated = authenticationManager.authenticate(authentication);
        String token = jwtTokenProvider.generateToken(authenticated);

        return AuthResponse.builder()
            .token(token)
            .userId(user.getId())
            .name(user.getName())
            .role(user.getRole())
            .consentRequired(true)
            .hasConsented(false)
            .anonymizeData(true)
            .build();
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        var authentication = new UsernamePasswordAuthenticationToken(
            request.getEmail(),
            request.getPassword()
        );

        Authentication authenticated = authenticationManager.authenticate(authentication);

        User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

        String token = jwtTokenProvider.generateToken(authenticated);

        Optional<ConsentRecord> consentRecordOpt = consentRepository.findByUserId(user.getId());

        return AuthResponse.builder()
            .token(token)
            .userId(user.getId())
            .name(user.getName())
            .role(user.getRole())
            .consentRequired(consentRecordOpt.isEmpty() || consentRecordOpt.get().getConsentedAt() == null)
            .hasConsented(consentRecordOpt.map(ConsentRecord::getHasConsented).orElse(false))
            .anonymizeData(consentRecordOpt.map(ConsentRecord::getAnonymizeData).orElse(true))
            .build();
    }

    @Transactional
    public AuthResponse updateConsent(UUID userId, ConsentRequest request) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        ConsentRecord consentRecord = consentRepository.findByUserId(userId)
            .orElseThrow(() -> new IllegalArgumentException("Consent record not found for user: " + userId));

        consentRecord.setHasConsented(request.getHasConsented());
        consentRecord.setAnonymizeData(request.getAnonymizeData());

        consentRecord.setConsentedAt(LocalDateTime.now());

        consentRepository.save(consentRecord);

        return AuthResponse.builder()
            .userId(user.getId())
            .name(user.getName())
            .email(user.getEmail())
            .role(user.getRole())
            .hasConsented(request.getHasConsented())
            .anonymizeData(request.getAnonymizeData())
            .build();
    }

    @Transactional(readOnly = true)
    public AuthResponse getAuthResponseByEmail(String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new IllegalArgumentException("User not found: " + email));

        Optional<ConsentRecord> consentRecordOpt = consentRepository.findByUserId(user.getId());
        log.info("Retrieved auth response for user {}: hasConsented={}", user.getId(), 
            consentRecordOpt.map(ConsentRecord::getHasConsented).orElse(false));

        return AuthResponse.builder()
            .userId(user.getId())
            .name(user.getName())
            .email(user.getEmail())
            .role(user.getRole())
            .consentRequired(consentRecordOpt.isEmpty() || consentRecordOpt.get().getConsentedAt() == null)
            .hasConsented(consentRecordOpt.map(ConsentRecord::getHasConsented).orElse(false))
            .anonymizeData(consentRecordOpt.map(ConsentRecord::getAnonymizeData).orElse(true))
            .build();
    }

    @Transactional(readOnly = true)
    public User getCurrentUser(String email) {
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new IllegalArgumentException("User not found: " + email));
    }
}

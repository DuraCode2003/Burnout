package com.burnouttracker.dto.response;

import com.burnouttracker.model.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {

    private String token;
    private UUID userId;
    private String name;
    private String email;
    private Role role;
    private Boolean consentRequired;
    private Boolean hasConsented;
    private Boolean anonymizeData;
}

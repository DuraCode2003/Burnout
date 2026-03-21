package com.burnouttracker.dto.response;

import com.burnouttracker.model.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileResponse {

    private UUID id;
    private String name;
    private String email;
    private Role role;
    private String department;
    private Boolean hasConsented;
    private Boolean anonymizeData;
    private LocalDateTime createdAt;
}

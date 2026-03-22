package com.burnouttracker.dto.response;

import com.burnouttracker.model.enums.Role;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class UserManagementDTO {
    private UUID id;
    private String name;
    private String email;
    private Role role;
    private String department;
    private Boolean isActive;
    private LocalDateTime createdAt;
}

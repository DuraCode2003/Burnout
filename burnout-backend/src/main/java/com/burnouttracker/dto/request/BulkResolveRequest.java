package com.burnouttracker.dto.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class BulkResolveRequest {
    
    @NotEmpty(message = "Alert IDs list cannot be empty")
    private List<UUID> alertIds;
    
    @NotNull(message = "Resolution notes cannot be null")
    private String resolutionNotes;
}

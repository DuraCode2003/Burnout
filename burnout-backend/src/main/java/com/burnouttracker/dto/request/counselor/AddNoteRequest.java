package com.burnouttracker.dto.request.counselor;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AddNoteRequest {

    @NotBlank(message = "Note content is required")
    @Size(min = 1, max = 2000, message = "Note must be between 1 and 2000 characters")
    private String note;

    @Builder.Default
    private Boolean isInternal = false;
}

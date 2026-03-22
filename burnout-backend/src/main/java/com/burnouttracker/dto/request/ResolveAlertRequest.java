package com.burnouttracker.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

/**
 * Request to resolve an alert
 * Note is required to document how the alert was resolved
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResolveAlertRequest implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * Resolution note explaining how the alert was resolved
     * Required field — counselor must document the intervention
     */
    @JsonProperty("resolutionNotes")
    @NotBlank(message = "Resolution note is required")
    private String resolutionNotes;

    private boolean followUpRequired;
    private String followUpDate;
}

package com.burnouttracker.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

/**
 * Request to add a counselor note to an alert
 * Notes are internal only — students never see them
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AddNoteRequest implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * Note content (internal counselor notes)
     * Max 1000 characters
     */
    @NotBlank(message = "Note content is required")
    @Size(max = 1000, message = "Note must not exceed 1000 characters")
    private String note;

    @JsonProperty("isInternal")
    private boolean isInternal;
}

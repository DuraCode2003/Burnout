package com.burnouttracker.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConsentRequest {

    @NotNull(message = "Consent decision is required")
    private Boolean hasConsented;

    @NotNull(message = "Anonymize data preference is required")
    private Boolean anonymizeData;
}

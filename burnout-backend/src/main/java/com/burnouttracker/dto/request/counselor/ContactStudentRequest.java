package com.burnouttracker.dto.request.counselor;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContactStudentRequest {

    @NotBlank(message = "Contact method is required")
    private String contactMethod; // EMAIL, PHONE, MESSAGE, IN_PERSON

    private String notes;
}

package com.example.demo.DTO;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class UserDTO {
    private long id;

    @NotBlank(message = "name is required")
    @Size(min = 2, max = 50, message = "Name should have min 2 and max 50 characters")
    private String name;

    @NotBlank(message = "email should not be empty")
    @Email(message = "email must be in a proper format example@domain.com")
    private String email;

    @NotBlank(message = "password should not be empty")
    @Size(min=8, message = "password must be at least 8 characters")
    @Pattern(regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#&()–[{}]:;',?/*~$^+=<>]).{8,}$",
            message = "Password must contain at least one digit, one lowercase letter, one uppercase letter, and one special character")
    private String password;

    @NotNull
    @Positive
    @Min(value = 10)
    private long mobile;

    private String role = "USER";
}
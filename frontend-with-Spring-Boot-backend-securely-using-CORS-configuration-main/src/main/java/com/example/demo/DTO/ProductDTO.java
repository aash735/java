package com.example.demo.DTO;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class ProductDTO {
    private long productId;
    @NotBlank @Size(min = 3) private String productName;
    @NotBlank @Size(min = 20) private String productDescription;
    @NotBlank private String productSKU;
    @Positive private long productPrice;
    @PositiveOrZero @Max(100) private long productDiscount;
    private Long userId;
    private String userName;
}
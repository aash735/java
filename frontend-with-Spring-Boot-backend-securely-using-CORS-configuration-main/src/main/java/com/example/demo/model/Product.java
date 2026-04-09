package com.example.demo.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Data;

@Entity
@Table(name = "product_table")
@Data
public class Product {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long productId;

    @Column(nullable = false) private String productName;
    @Column(unique = true, nullable = false) private String productSKU;
    @Column(nullable = false) private String productDescription;
    @Column(nullable = false) private long productPrice;
    @Column(nullable = false) private long productDiscount;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
}
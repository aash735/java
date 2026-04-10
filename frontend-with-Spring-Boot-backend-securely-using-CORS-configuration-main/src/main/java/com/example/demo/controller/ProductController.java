package com.example.demo.controller;

import com.example.demo.DTO.ProductDTO;
import com.example.demo.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController @RequestMapping("/api/product") @CrossOrigin("*")
public class ProductController {
    @Autowired private ProductService productService;

    @PostMapping("/register")
    public ResponseEntity<ProductDTO> registerProduct(@Valid @RequestBody ProductDTO dto,
                                                      @RequestHeader("Authorization") String token) {
        return ResponseEntity.status(HttpStatus.CREATED).body(productService.createProduct(dto, token));
    }

    @GetMapping("/all")
    public ResponseEntity<List<ProductDTO>> getAllProducts() {
        return ResponseEntity.ok(productService.getAllProducts());
    }

    @GetMapping("/my-products")
    public ResponseEntity<List<ProductDTO>> getMyProducts(@RequestHeader("Authorization") String token) {
        return ResponseEntity.ok(productService.getProductsByUser(token));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductDTO> getProduct(@PathVariable long id) {
        return productService.getProductById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/delete/{id}")
    @PreAuthorize("hasRole('ADMIN') or @productService.isOwner(#id, authentication.name)")
    public ResponseEntity<Void> deleteProduct(@PathVariable long id, @RequestHeader("Authorization") String token) {
        try {
            return productService.deleteProduct(id, token) ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
        } catch (RuntimeException e) { return ResponseEntity.status(HttpStatus.FORBIDDEN).build(); }
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<ProductDTO> updateProduct(@PathVariable long id, @Valid @RequestBody ProductDTO dto,
                                                    @RequestHeader("Authorization") String token) {
        try {
            return productService.updateProduct(id, dto, token).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
        } catch (RuntimeException e) { return ResponseEntity.status(HttpStatus.FORBIDDEN).build(); }
    }

    @GetMapping("/all-paginated")
    public ResponseEntity<Page<ProductDTO>> getAllProductsPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) {
        return ResponseEntity.ok(productService.getAllProductsPaginated(page, size));
    }
}
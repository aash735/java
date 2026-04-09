package com.example.demo.service;

import com.example.demo.DTO.ProductDTO;
import com.example.demo.model.Product;
import com.example.demo.model.User;
import com.example.demo.repository.ProductRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ProductService {
    @Autowired private ProductRepository productRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private JwtUtil jwtUtil;

    public ProductDTO createProduct(ProductDTO dto, String token) {
        String email = jwtUtil.extractEmail(token.replace("Bearer ", ""));
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        Product p = mapToEntity(dto); p.setUser(user);
        return mapToDTO(productRepository.save(p));
    }

    public List<ProductDTO> getAllProducts() {
        return productRepository.findAll().stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public Optional<ProductDTO> getProductById(long id) {
        return productRepository.findById(id).map(this::mapToDTO);
    }

    public boolean deleteProduct(long id, String token) {
        String clean = token.replace("Bearer ", "");
        String email = jwtUtil.extractEmail(clean), role = jwtUtil.extractRole(clean);
        Product p = productRepository.findById(id).orElseThrow(() -> new RuntimeException("Not found"));
        if ("ADMIN".equals(role) || email.equals(p.getUser().getEmail())) {
            productRepository.deleteById(id); return true;
        }
        throw new RuntimeException("Access denied");
    }

    public Optional<ProductDTO> updateProduct(long id, ProductDTO dto, String token) {
        String clean = token.replace("Bearer ", "");
        String email = jwtUtil.extractEmail(clean), role = jwtUtil.extractRole(clean);
        return productRepository.findById(id).map(existing -> {
            if (!"ADMIN".equals(role) && !email.equals(existing.getUser().getEmail()))
                throw new RuntimeException("Access denied");
            existing.setProductName(dto.getProductName()); existing.setProductSKU(dto.getProductSKU());
            existing.setProductDescription(dto.getProductDescription());
            existing.setProductPrice(dto.getProductPrice()); existing.setProductDiscount(dto.getProductDiscount());
            return mapToDTO(productRepository.save(existing));
        });
    }

    public List<ProductDTO> getProductsByUser(String token) {
        String email = jwtUtil.extractEmail(token.replace("Bearer ", ""));
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        return productRepository.findByUser(user).stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public boolean isOwner(long productId, String email) {
        Product p = productRepository.findById(productId).orElse(null);
        return p != null && p.getUser().getEmail().equals(email);
    }

    public Page<ProductDTO> getAllProductsPaginated(int page, int size) {
        Pageable pg = PageRequest.of(page, size);
        return productRepository.findAll(pg).map(this::mapToDTO);
    }

    private Product mapToEntity(ProductDTO dto) {
        Product p = new Product();
        p.setProductName(dto.getProductName()); p.setProductSKU(dto.getProductSKU());
        p.setProductDescription(dto.getProductDescription());
        p.setProductPrice(dto.getProductPrice()); p.setProductDiscount(dto.getProductDiscount());
        return p;
    }

    private ProductDTO mapToDTO(Product p) {
        ProductDTO dto = new ProductDTO();
        dto.setProductId(p.getProductId()); dto.setProductName(p.getProductName());
        dto.setProductSKU(p.getProductSKU()); dto.setProductDescription(p.getProductDescription());
        dto.setProductPrice(p.getProductPrice()); dto.setProductDiscount(p.getProductDiscount());
        if (p.getUser() != null) { dto.setUserId(p.getUser().getId()); dto.setUserName(p.getUser().getName()); }
        return dto;
    }
}
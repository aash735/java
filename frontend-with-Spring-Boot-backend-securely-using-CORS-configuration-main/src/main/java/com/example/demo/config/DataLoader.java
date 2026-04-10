package com.example.demo.config;

import com.example.demo.model.Product;
import com.example.demo.model.Role;
import com.example.demo.model.User;
import com.example.demo.repository.ProductRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataLoader implements CommandLineRunner {

    @Autowired private UserRepository userRepository;
    @Autowired private ProductRepository productRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() == 0) {
            User admin = createUser("admin@example.com", "Admin123!", "System Administrator", Role.ADMIN);
            User user = createUser("user@example.com", "User123!", "Sample User", Role.USER);
            createProducts(admin, user);
            System.out.println("Data seeding completed!");
        }
    }

    private User createUser(String email, String pass, String name, Role role) {
        User u = new User();
        u.setEmail(email); u.setPassword(passwordEncoder.encode(pass));
        u.setName(name); u.setMobile(email.contains("admin") ? 1234567890L : 9876543210L);
        u.setRole(role);
        return userRepository.save(u);
    }

    private void createProducts(User admin, User user) {
        saveProd("Premium Laptop", "LAPTOP-001", "High-performance laptop", 120000L, 10L, admin);
        saveProd("Wireless Mouse", "MOUSE-001", "Ergonomic wireless mouse", 2500L, 5L, admin);
        saveProd("USB-C Hub", "HUB-001", "Multi-port USB-C hub", 3500L, 15L, user);
        saveProd("Mechanical Keyboard", "KEYBOARD-001", "RGB mechanical keyboard", 6500L, 20L, user);
    }

    private void saveProd(String name, String sku, String desc, long price, long disc, User owner) {
        Product p = new Product();
        p.setProductName(name); p.setProductSKU(sku); p.setProductDescription(desc);
        p.setProductPrice(price); p.setProductDiscount(disc); p.setUser(owner);
        productRepository.save(p);
    }
}
package com.example.demo.controller;

import com.example.demo.DTO.*;
import com.example.demo.security.JwtUtil;
import com.example.demo.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController @RequestMapping("/api/user") @CrossOrigin("*")
public class UserController {
    @Autowired private UserService userService;
    @Autowired private JwtUtil jwtUtil;

    @PostMapping("/register")
    public ResponseEntity<UserDTO> registerUser(@Valid @RequestBody UserDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.registerUser(dto));
    }

    @PostMapping("/register-admin")
    public ResponseEntity<UserDTO> registerAdmin(@Valid @RequestBody UserDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.createAdminUser(dto));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest req) {
        String token = userService.login(req.getEmail(), req.getPassword(), jwtUtil);
        String refresh = jwtUtil.generateRefreshToken(req.getEmail());
        return ResponseEntity.ok(new TokenResponse("Bearer " + token, refresh));
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<?> refreshToken(@RequestBody RefreshTokenRequest req) {
        try {
            String email = jwtUtil.extractEmail(req.getRefreshToken());
            if (!jwtUtil.isTokenExpired(req.getRefreshToken())) {
                String newAcc = jwtUtil.generateToken(email);
                String newRef = jwtUtil.generateRefreshToken(email);
                return ResponseEntity.ok(new TokenResponse("Bearer " + newAcc, newRef));
            }
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Refresh token expired");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid refresh token");
        }
    }

    @GetMapping("/all") @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserDTO>> getAllUsers(@RequestHeader("Authorization") String token) {
        try {
            String role = jwtUtil.extractRole(token.replace("Bearer ", ""));
            if (!"ADMIN".equals(role)) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            return ResponseEntity.ok(userService.getAllUsers());
        } catch (Exception e) { return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build(); }
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> getUser(@PathVariable long id) {
        return userService.getUserById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/delete/{id}") @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable long id, @RequestHeader("Authorization") String token) {
        try {
            String role = jwtUtil.extractRole(token.replace("Bearer ", ""));
            if (!"ADMIN".equals(role)) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            return userService.deleteUser(id) ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
        } catch (Exception e) { return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build(); }
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<UserDTO> updateUser(@PathVariable long id, @Valid @RequestBody UserDTO dto) {
        return userService.updateUser(id, dto).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }
}
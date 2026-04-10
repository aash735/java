package com.example.demo.service;

import com.example.demo.DTO.UserDTO;
import com.example.demo.model.Role;
import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import com.example.demo.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class UserService {
    final private PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    @Autowired private UserRepository userRepository;

    public UserDTO registerUser(UserDTO userDTO) {
        User user = mapToEntity(userDTO);
        user.setPassword(passwordEncoder.encode(userDTO.getPassword()));
        user.setRole(userDTO.getRole() != null && userDTO.getRole().equalsIgnoreCase("ADMIN") ? Role.ADMIN : Role.USER);
        return mapToDTO(userRepository.save(user));
    }

    public UserDTO createAdminUser(UserDTO userDTO) {
        userDTO.setRole("ADMIN");
        return registerUser(userDTO);
    }

    public String login(String email, String password, JwtUtil jwtUtil) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("Invalid email"));
        if (!passwordEncoder.matches(password, user.getPassword())) throw new RuntimeException("Invalid password");
        return jwtUtil.generateToken(email, user.getRole().name());  // ← Include role
    }

    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public Optional<UserDTO> getUserById(long id) {
        return userRepository.findById(id).map(this::mapToDTO);
    }

    public boolean deleteUser(long id) {
        if (userRepository.existsById(id)) { userRepository.deleteById(id); return true; }
        return false;
    }

    public Optional<UserDTO> updateUser(long id, UserDTO userDTO) {
        return userRepository.findById(id).map(existing -> {
            existing.setName(userDTO.getName()); existing.setEmail(userDTO.getEmail());
            existing.setPassword(passwordEncoder.encode(userDTO.getPassword()));
            existing.setMobile(userDTO.getMobile());
            return mapToDTO(userRepository.save(existing));
        });
    }

    private User mapToEntity(UserDTO dto) {
        User u = new User();
        u.setName(dto.getName()); u.setEmail(dto.getEmail()); u.setPassword(dto.getPassword());
        u.setMobile(dto.getMobile());
        u.setRole(dto.getRole() != null && dto.getRole().equalsIgnoreCase("ADMIN") ? Role.ADMIN : Role.USER);
        return u;
    }

    private UserDTO mapToDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId()); dto.setName(user.getName()); dto.setEmail(user.getEmail());
        dto.setMobile(user.getMobile()); dto.setRole(user.getRole().name());
        return dto;
    }
}
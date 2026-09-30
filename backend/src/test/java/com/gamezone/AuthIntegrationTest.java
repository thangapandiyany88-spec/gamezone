package com.gamezone;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gamezone.dto.LoginRequest;
import com.gamezone.dto.RegisterRequest;
import com.gamezone.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class AuthIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
    }

    @Test
    @DisplayName("Should successfully register a new user")
    void testRegisterSuccess() throws Exception {
        RegisterRequest request = new RegisterRequest("Test Gamer", "gamer@example.com", "password123");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.email").value("gamer@example.com"))
                .andExpect(jsonPath("$.fullName").value("Test Gamer"));
    }

    @Test
    @DisplayName("Should reject registration with duplicate email")
    void testRegisterDuplicateEmail() throws Exception {
        RegisterRequest request1 = new RegisterRequest("Player One", "player@example.com", "password123");
        userRepository.save(new com.gamezone.entity.User("Player One", "player@example.com", "$2a$10$abcdefghijklmnopqrstuu"));

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request1)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("An account with email player@example.com already exists."));
    }

    @Test
    @DisplayName("Should authenticate user with valid credentials")
    void testLoginSuccess() throws Exception {
        RegisterRequest reg = new RegisterRequest("Player One", "login@example.com", "secretpass");
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(reg)));

        LoginRequest loginReq = new LoginRequest("login@example.com", "secretpass");
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("login@example.com"));
    }

    @Test
    @DisplayName("Should reject login with invalid password")
    void testLoginFailure() throws Exception {
        RegisterRequest reg = new RegisterRequest("Player One", "user@example.com", "correctpass");
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(reg)));

        LoginRequest loginReq = new LoginRequest("user@example.com", "wrongpass");
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Should block unauthenticated requests to protected endpoints")
    void testUnauthorizedAccess() throws Exception {
        mockMvc.perform(get("/api/users/me"))
                .andExpect(status().isUnauthorized());
    }
}

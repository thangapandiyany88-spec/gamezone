package com.gamezone;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gamezone.dto.LoginRequest;
import com.gamezone.dto.RegisterRequest;
import com.gamezone.dto.ScoreSubmitRequest;
import com.gamezone.dto.SessionStartResponse;
import com.gamezone.entity.Game;
import com.gamezone.repository.GameRepository;
import com.gamezone.repository.GameSessionRepository;
import com.gamezone.repository.ScoreRepository;
import com.gamezone.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class GameAndScoreTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private GameRepository gameRepository;

    @Autowired
    private GameSessionRepository gameSessionRepository;

    @Autowired
    private ScoreRepository scoreRepository;

    @BeforeEach
    void setUp() {
        scoreRepository.deleteAll();
        gameSessionRepository.deleteAll();
        userRepository.deleteAll();

        if (gameRepository.findBySlug("snake").isEmpty()) {
            gameRepository.save(new Game("Snake Game", "snake", "Classic Snake", true));
        }
    }

    private MockHttpSession loginUser(String email, String password, String name) throws Exception {
        RegisterRequest reg = new RegisterRequest(name, email, password);
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(reg)));

        LoginRequest login = new LoginRequest(email, password);
        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isOk())
                .andReturn();

        return (MockHttpSession) result.getRequest().getSession();
    }

    @Test
    @DisplayName("Should create game session and complete with valid score")
    void testStartAndCompleteSessionSuccess() throws Exception {
        MockHttpSession session = loginUser("player1@example.com", "pass1234", "Player One");

        // Start session
        MvcResult sessionResult = mockMvc.perform(post("/api/games/snake/sessions")
                        .session(session))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.sessionId").exists())
                .andReturn();

        SessionStartResponse startResp = objectMapper.readValue(
                sessionResult.getResponse().getContentAsString(), SessionStartResponse.class);

        // Submit valid score
        ScoreSubmitRequest scoreReq = new ScoreSubmitRequest(120, 45);
        mockMvc.perform(post("/api/games/snake/sessions/" + startResp.getSessionId() + "/complete")
                        .session(session)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(scoreReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.score").value(120))
                .andExpect(jsonPath("$.personalBest").value(true));
    }

    @Test
    @DisplayName("Should prevent duplicate score submission for the same completed game session")
    void testPreventDuplicateScoreSubmission() throws Exception {
        MockHttpSession session = loginUser("player2@example.com", "pass1234", "Player Two");

        MvcResult sessionResult = mockMvc.perform(post("/api/games/snake/sessions").session(session))
                .andExpect(status().isCreated()).andReturn();
        SessionStartResponse startResp = objectMapper.readValue(sessionResult.getResponse().getContentAsString(), SessionStartResponse.class);

        ScoreSubmitRequest scoreReq = new ScoreSubmitRequest(50, 20);
        // First submission
        mockMvc.perform(post("/api/games/snake/sessions/" + startResp.getSessionId() + "/complete")
                        .session(session)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(scoreReq)))
                .andExpect(status().isOk());

        // Second submission attempt must fail
        mockMvc.perform(post("/api/games/snake/sessions/" + startResp.getSessionId() + "/complete")
                        .session(session)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(scoreReq)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("This game session has already been completed or closed."));
    }

    @Test
    @DisplayName("Should reject invalid or cheat scores exceeding theoretical game limits")
    void testRejectInvalidScore() throws Exception {
        MockHttpSession session = loginUser("cheater@example.com", "pass1234", "Cheater Player");

        MvcResult sessionResult = mockMvc.perform(post("/api/games/snake/sessions").session(session)).andReturn();
        SessionStartResponse startResp = objectMapper.readValue(sessionResult.getResponse().getContentAsString(), SessionStartResponse.class);

        // Score 99999 exceeds limits
        ScoreSubmitRequest scoreReq = new ScoreSubmitRequest(99999, 10);
        mockMvc.perform(post("/api/games/snake/sessions/" + startResp.getSessionId() + "/complete")
                        .session(session)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(scoreReq)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Invalid score calculation for Snake Game."));
    }

    @Test
    @DisplayName("Should return valid leaderboard rankings")
    void testLeaderboardCalculation() throws Exception {
        MockHttpSession session1 = loginUser("userA@example.com", "pass1234", "User A");
        MvcResult s1 = mockMvc.perform(post("/api/games/snake/sessions").session(session1)).andReturn();
        SessionStartResponse resp1 = objectMapper.readValue(s1.getResponse().getContentAsString(), SessionStartResponse.class);
        mockMvc.perform(post("/api/games/snake/sessions/" + resp1.getSessionId() + "/complete").session(session1).contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(new ScoreSubmitRequest(100, 30))));

        mockMvc.perform(get("/api/leaderboard/snake"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].fullName").value("User A"))
                .andExpect(jsonPath("$.content[0].bestScore").value(100));
    }
}

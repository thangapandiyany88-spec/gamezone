package com.gamezone.service;

import com.gamezone.dto.*;
import com.gamezone.entity.Game;
import com.gamezone.entity.GameSession;
import com.gamezone.entity.Score;
import com.gamezone.entity.User;
import com.gamezone.exception.BadRequestException;
import com.gamezone.exception.ResourceNotFoundException;
import com.gamezone.repository.GameRepository;
import com.gamezone.repository.GameSessionRepository;
import com.gamezone.repository.ScoreRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class GameService {

    private final GameRepository gameRepository;
    private final GameSessionRepository gameSessionRepository;
    private final ScoreRepository scoreRepository;
    private final AuthService authService;

    public GameService(GameRepository gameRepository, GameSessionRepository gameSessionRepository, ScoreRepository scoreRepository, AuthService authService) {
        this.gameRepository = gameRepository;
        this.gameSessionRepository = gameSessionRepository;
        this.scoreRepository = scoreRepository;
        this.authService = authService;
    }

    public List<GameDto> getAllActiveGames() {
        return gameRepository.findByActiveTrue().stream()
                .map(g -> new GameDto(g.getId(), g.getName(), g.getSlug(), g.getDescription(), g.isActive()))
                .collect(Collectors.toList());
    }

    public GameDto getGameBySlug(String slug) {
        Game g = gameRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Game not found with slug: " + slug));
        return new GameDto(g.getId(), g.getName(), g.getSlug(), g.getDescription(), g.isActive());
    }

    @Transactional
    public SessionStartResponse startSession(String gameSlug) {
        User currentUser = authService.getCurrentAuthenticatedUser();
        Game game = gameRepository.findBySlug(gameSlug)
                .orElseThrow(() -> new ResourceNotFoundException("Game not found with slug: " + gameSlug));

        String sessionToken = "GZS-" + UUID.randomUUID().toString();
        GameSession session = new GameSession(currentUser, game, sessionToken);
        GameSession saved = gameSessionRepository.save(session);

        return new SessionStartResponse(saved.getSessionToken(), game.getSlug(), saved.getStartedAt());
    }

    @Transactional
    public ScoreSubmitResponse completeSession(String gameSlug, String sessionToken, ScoreSubmitRequest request) {
        User currentUser = authService.getCurrentAuthenticatedUser();
        GameSession session = gameSessionRepository.findBySessionToken(sessionToken)
                .orElseThrow(() -> new ResourceNotFoundException("Game session not found: " + sessionToken));

        // 1. Security Check: Session user must match authenticated user
        if (!session.getUser().getId().equals(currentUser.getId())) {
            throw new BadRequestException("Unauthorized: This game session belongs to another player.");
        }

        // 2. Duplicate Check: Session must be IN_PROGRESS
        if (session.getStatus() != GameSession.SessionStatus.IN_PROGRESS) {
            throw new BadRequestException("This game session has already been completed or closed.");
        }

        if (scoreRepository.existsByGameSessionId(session.getId())) {
            throw new BadRequestException("Score has already been submitted for this session.");
        }

        // 3. Game-specific score limits and sanity validation
        validateGameScore(session.getGame().getSlug(), request.getScore(), request.getDurationSeconds());

        // Update Session
        session.setStatus(GameSession.SessionStatus.COMPLETED);
        session.setCompletedAt(LocalDateTime.now());
        gameSessionRepository.save(session);

        // Check if personal best
        Integer previousMax = scoreRepository.findMaxScoreByUserIdAndGameId(currentUser.getId(), session.getGame().getId());
        boolean isPersonalBest = (previousMax == null || request.getScore() > previousMax);

        // Save Score
        Score scoreObj = new Score(currentUser, session.getGame(), session, request.getScore(), request.getDurationSeconds());
        Score savedScore = scoreRepository.save(scoreObj);

        return new ScoreSubmitResponse(
                savedScore.getId(),
                savedScore.getScore(),
                isPersonalBest,
                isPersonalBest ? "New personal best score recorded!" : "Session score recorded successfully."
        );
    }

    private void validateGameScore(String slug, int score, int durationSeconds) {
        // Enforce maximum reasonable upper bounds per game to prevent falsified score payloads
        switch (slug) {
            case "snake":
                if (score > 10000 || score % 10 != 0) {
                    throw new BadRequestException("Invalid score calculation for Snake Game.");
                }
                break;
            case "car-racing":
                if (score > 50000) {
                    throw new BadRequestException("Exceeded maximum theoretical score for 2D Car Racing.");
                }
                break;
            case "tic-tac-toe":
                if (score > 100) {
                    throw new BadRequestException("Tic-Tac-Toe maximum match points exceeded.");
                }
                break;
            case "memory-match":
                if (score > 500) {
                    throw new BadRequestException("Memory Match maximum score exceeded.");
                }
                break;
            case "rock-paper-scissors":
                if (score > 150) {
                    throw new BadRequestException("Rock-Paper-Scissors maximum points exceeded.");
                }
                break;
            default:
                if (score > 100000) {
                    throw new BadRequestException("Unreasonable score submitted.");
                }
        }
    }
}

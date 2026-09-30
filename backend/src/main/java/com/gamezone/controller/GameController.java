package com.gamezone.controller;

import com.gamezone.dto.*;
import com.gamezone.service.GameService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/games")
public class GameController {

    private final GameService gameService;

    public GameController(GameService gameService) {
        this.gameService = gameService;
    }

    @GetMapping
    public ResponseEntity<List<GameDto>> getAllGames() {
        return ResponseEntity.ok(gameService.getAllActiveGames());
    }

    @GetMapping("/{slug}")
    public ResponseEntity<GameDto> getGameBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(gameService.getGameBySlug(slug));
    }

    @PostMapping("/{slug}/sessions")
    public ResponseEntity<SessionStartResponse> startSession(@PathVariable String slug) {
        SessionStartResponse sessionResponse = gameService.startSession(slug);
        return ResponseEntity.status(HttpStatus.CREATED).body(sessionResponse);
    }

    @PostMapping("/{slug}/sessions/{sessionId}/complete")
    public ResponseEntity<ScoreSubmitResponse> completeSession(
            @PathVariable String slug,
            @PathVariable String sessionId,
            @Valid @RequestBody ScoreSubmitRequest request
    ) {
        ScoreSubmitResponse response = gameService.completeSession(slug, sessionId, request);
        return ResponseEntity.ok(response);
    }
}

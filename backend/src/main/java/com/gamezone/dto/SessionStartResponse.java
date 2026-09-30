package com.gamezone.dto;

import java.time.LocalDateTime;

public class SessionStartResponse {
    private String sessionId;
    private String gameSlug;
    private LocalDateTime startedAt;

    public SessionStartResponse() {
    }

    public SessionStartResponse(String sessionId, String gameSlug, LocalDateTime startedAt) {
        this.sessionId = sessionId;
        this.gameSlug = gameSlug;
        this.startedAt = startedAt;
    }

    public String getSessionId() { return sessionId; }
    public void setSessionId(String sessionId) { this.sessionId = sessionId; }

    public String getGameSlug() { return gameSlug; }
    public void setGameSlug(String gameSlug) { this.gameSlug = gameSlug; }

    public LocalDateTime getStartedAt() { return startedAt; }
    public void setStartedAt(LocalDateTime startedAt) { this.startedAt = startedAt; }
}

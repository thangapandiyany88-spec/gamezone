package com.gamezone.dto;

import java.time.LocalDateTime;

public class GameSessionHistoryDto {
    private Long id;
    private String gameName;
    private String gameSlug;
    private Integer score;
    private Integer durationSeconds;
    private LocalDateTime achievedAt;

    public GameSessionHistoryDto() {
    }

    public GameSessionHistoryDto(Long id, String gameName, String gameSlug, Integer score, Integer durationSeconds, LocalDateTime achievedAt) {
        this.id = id;
        this.gameName = gameName;
        this.gameSlug = gameSlug;
        this.score = score;
        this.durationSeconds = durationSeconds;
        this.achievedAt = achievedAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getGameName() { return gameName; }
    public void setGameName(String gameName) { this.gameName = gameName; }

    public String getGameSlug() { return gameSlug; }
    public void setGameSlug(String gameSlug) { this.gameSlug = gameSlug; }

    public Integer getScore() { return score; }
    public void setScore(Integer score) { this.score = score; }

    public Integer getDurationSeconds() { return durationSeconds; }
    public void setDurationSeconds(Integer durationSeconds) { this.durationSeconds = durationSeconds; }

    public LocalDateTime getAchievedAt() { return achievedAt; }
    public void setAchievedAt(LocalDateTime achievedAt) { this.achievedAt = achievedAt; }
}

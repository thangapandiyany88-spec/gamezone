package com.gamezone.dto;

import java.time.LocalDateTime;

public class LeaderboardEntryDto {
    private Integer rank;
    private Long userId;
    private String fullName;
    private Integer totalPoints;
    private Integer bestScore;
    private Integer gamesPlayed;
    private LocalDateTime achievedAt;

    public LeaderboardEntryDto() {
    }

    public LeaderboardEntryDto(Integer rank, Long userId, String fullName, Integer totalPoints, Integer bestScore, Integer gamesPlayed, LocalDateTime achievedAt) {
        this.rank = rank;
        this.userId = userId;
        this.fullName = fullName;
        this.totalPoints = totalPoints;
        this.bestScore = bestScore;
        this.gamesPlayed = gamesPlayed;
        this.achievedAt = achievedAt;
    }

    public Integer getRank() { return rank; }
    public void setRank(Integer rank) { this.rank = rank; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public Integer getTotalPoints() { return totalPoints; }
    public void setTotalPoints(Integer totalPoints) { this.totalPoints = totalPoints; }

    public Integer getBestScore() { return bestScore; }
    public void setBestScore(Integer bestScore) { this.bestScore = bestScore; }

    public Integer getGamesPlayed() { return gamesPlayed; }
    public void setGamesPlayed(Integer gamesPlayed) { this.gamesPlayed = gamesPlayed; }

    public LocalDateTime getAchievedAt() { return achievedAt; }
    public void setAchievedAt(LocalDateTime achievedAt) { this.achievedAt = achievedAt; }
}

package com.gamezone.dto;

import java.util.List;

public class UserStatsDto {
    private Long totalGamesPlayed;
    private Integer totalPoints;
    private Integer highestScore;
    private Integer overallRank;
    private List<GameBestDto> gameBests;

    public UserStatsDto() {
    }

    public UserStatsDto(Long totalGamesPlayed, Integer totalPoints, Integer highestScore, Integer overallRank, List<GameBestDto> gameBests) {
        this.totalGamesPlayed = totalGamesPlayed;
        this.totalPoints = totalPoints;
        this.highestScore = highestScore;
        this.overallRank = overallRank;
        this.gameBests = gameBests;
    }

    public Long getTotalGamesPlayed() { return totalGamesPlayed; }
    public void setTotalGamesPlayed(Long totalGamesPlayed) { this.totalGamesPlayed = totalGamesPlayed; }

    public Integer getTotalPoints() { return totalPoints; }
    public void setTotalPoints(Integer totalPoints) { this.totalPoints = totalPoints; }

    public Integer getHighestScore() { return highestScore; }
    public void setHighestScore(Integer highestScore) { this.highestScore = highestScore; }

    public Integer getOverallRank() { return overallRank; }
    public void setOverallRank(Integer overallRank) { this.overallRank = overallRank; }

    public List<GameBestDto> getGameBests() { return gameBests; }
    public void setGameBests(List<GameBestDto> gameBests) { this.gameBests = gameBests; }
}

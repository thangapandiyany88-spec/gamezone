package com.gamezone.dto;

public class GameBestDto {
    private String gameSlug;
    private Integer bestScore;

    public GameBestDto() {
    }

    public GameBestDto(String gameSlug, Integer bestScore) {
        this.gameSlug = gameSlug;
        this.bestScore = bestScore;
    }

    public String getGameSlug() { return gameSlug; }
    public void setGameSlug(String gameSlug) { this.gameSlug = gameSlug; }

    public Integer getBestScore() { return bestScore; }
    public void setBestScore(Integer bestScore) { this.bestScore = bestScore; }
}

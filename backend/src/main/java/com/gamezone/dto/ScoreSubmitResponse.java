package com.gamezone.dto;

public class ScoreSubmitResponse {
    private Long scoreId;
    private Integer score;
    private boolean isPersonalBest;
    private String message;

    public ScoreSubmitResponse() {
    }

    public ScoreSubmitResponse(Long scoreId, Integer score, boolean isPersonalBest, String message) {
        this.scoreId = scoreId;
        this.score = score;
        this.isPersonalBest = isPersonalBest;
        this.message = message;
    }

    public Long getScoreId() { return scoreId; }
    public void setScoreId(Long scoreId) { this.scoreId = scoreId; }

    public Integer getScore() { return score; }
    public void setScore(Integer score) { this.score = score; }

    public boolean isPersonalBest() { return isPersonalBest; }
    public void setPersonalBest(boolean personalBest) { isPersonalBest = personalBest; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}

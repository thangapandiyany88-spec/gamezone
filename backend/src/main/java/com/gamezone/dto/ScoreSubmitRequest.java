package com.gamezone.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class ScoreSubmitRequest {

    @NotNull(message = "Score is required")
    @Min(value = 0, message = "Score cannot be negative")
    private Integer score;

    @NotNull(message = "Duration in seconds is required")
    @Min(value = 0, message = "Duration cannot be negative")
    private Integer durationSeconds;

    public ScoreSubmitRequest() {
    }

    public ScoreSubmitRequest(Integer score, Integer durationSeconds) {
        this.score = score;
        this.durationSeconds = durationSeconds;
    }

    public Integer getScore() { return score; }
    public void setScore(Integer score) { this.score = score; }

    public Integer getDurationSeconds() { return durationSeconds; }
    public void setDurationSeconds(Integer durationSeconds) { this.durationSeconds = durationSeconds; }
}

package com.gamezone.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "scores")
public class Score {

    public enum ValidationStatus {
        VALID,
        INVALID,
        FLAGGED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "game_id", nullable = false)
    private Game game;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "game_session_id", nullable = false, unique = true)
    private GameSession gameSession;

    @Column(nullable = false)
    private Integer score;

    @Column(name = "duration_seconds", nullable = false)
    private Integer durationSeconds = 0;

    @Column(name = "achieved_at", nullable = false)
    private LocalDateTime achievedAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "validation_status", nullable = false, length = 20)
    private ValidationStatus validationStatus = ValidationStatus.VALID;

    public Score() {
    }

    public Score(User user, Game game, GameSession gameSession, Integer score, Integer durationSeconds) {
        this.user = user;
        this.game = game;
        this.gameSession = gameSession;
        this.score = score;
        this.durationSeconds = durationSeconds;
        this.achievedAt = LocalDateTime.now();
        this.validationStatus = ValidationStatus.VALID;
    }

    @PrePersist
    protected void onCreate() {
        if (this.achievedAt == null) {
            this.achievedAt = LocalDateTime.now();
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Game getGame() {
        return game;
    }

    public void setGame(Game game) {
        this.game = game;
    }

    public GameSession getGameSession() {
        return gameSession;
    }

    public void setGameSession(GameSession gameSession) {
        this.gameSession = gameSession;
    }

    public Integer getScore() {
        return score;
    }

    public void setScore(Integer score) {
        this.score = score;
    }

    public Integer getDurationSeconds() {
        return durationSeconds;
    }

    public void setDurationSeconds(Integer durationSeconds) {
        this.durationSeconds = durationSeconds;
    }

    public LocalDateTime getAchievedAt() {
        return achievedAt;
    }

    public void setAchievedAt(LocalDateTime achievedAt) {
        this.achievedAt = achievedAt;
    }

    public ValidationStatus getValidationStatus() {
        return validationStatus;
    }

    public void setValidationStatus(ValidationStatus validationStatus) {
        this.validationStatus = validationStatus;
    }
}

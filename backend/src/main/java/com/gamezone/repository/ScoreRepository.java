package com.gamezone.repository;

import com.gamezone.entity.Score;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ScoreRepository extends JpaRepository<Score, Long> {

    boolean existsByGameSessionId(Long gameSessionId);

    Page<Score> findByUserIdOrderByAchievedAtDesc(Long userId, Pageable pageable);

    long countByUserId(Long userId);

    @Query("SELECT MAX(s.score) FROM Score s WHERE s.user.id = :userId AND s.validationStatus = 'VALID'")
    Integer findMaxScoreByUserId(@Param("userId") Long userId);

    @Query("SELECT MAX(s.score) FROM Score s WHERE s.user.id = :userId AND s.game.id = :gameId AND s.validationStatus = 'VALID'")
    Integer findMaxScoreByUserIdAndGameId(@Param("userId") Long userId, @Param("gameId") Long gameId);

    @Query("SELECT s.game.slug, MAX(s.score) FROM Score s WHERE s.user.id = :userId AND s.validationStatus = 'VALID' GROUP BY s.game.slug")
    List<Object[]> findUserBestScoresGroupedByGame(@Param("userId") Long userId);

    // Specific Game Leaderboard: Highest valid score per user for a game, tie-breaker: earliest achievedAt
    @Query(value = "SELECT u.id AS userId, u.full_name AS fullName, MAX(s.score) AS bestScore, COUNT(s.id) AS gamesPlayed, MIN(s.achieved_at) AS achievedAt " +
                   "FROM scores s " +
                   "JOIN users u ON s.user_id = u.id " +
                   "WHERE s.game_id = :gameId AND s.validation_status = 'VALID' " +
                   "GROUP BY u.id, u.full_name " +
                   "ORDER BY bestScore DESC, achievedAt ASC",
           countQuery = "SELECT COUNT(DISTINCT s.user_id) FROM scores s WHERE s.game_id = :gameId AND s.validation_status = 'VALID'",
           nativeQuery = true)
    Page<Object[]> findGameLeaderboard(@Param("gameId") Long gameId, Pageable pageable);

    // Overall Leaderboard: Sum of best score per user per game, tie-breaker: earliest achievedAt
    @Query(value = "SELECT user_id, full_name, SUM(best_score) AS totalPoints, SUM(game_count) AS gamesPlayed, MIN(first_achieved) AS achievedAt FROM (" +
                   "  SELECT s.user_id, u.full_name, s.game_id, MAX(s.score) AS best_score, COUNT(s.id) AS game_count, MIN(s.achieved_at) AS first_achieved " +
                   "  FROM scores s " +
                   "  JOIN users u ON s.user_id = u.id " +
                   "  WHERE s.validation_status = 'VALID' " +
                   "  GROUP BY s.user_id, u.full_name, s.game_id" +
                   ") best_scores " +
                   "GROUP BY user_id, full_name " +
                   "ORDER BY totalPoints DESC, achievedAt ASC",
           countQuery = "SELECT COUNT(DISTINCT user_id) FROM scores WHERE validation_status = 'VALID'",
           nativeQuery = true)
    Page<Object[]> findOverallLeaderboard(Pageable pageable);
}

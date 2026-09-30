package com.gamezone.service;

import com.gamezone.dto.LeaderboardEntryDto;
import com.gamezone.entity.Game;
import com.gamezone.entity.User;
import com.gamezone.exception.ResourceNotFoundException;
import com.gamezone.repository.GameRepository;
import com.gamezone.repository.ScoreRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class LeaderboardService {

    private final ScoreRepository scoreRepository;
    private final GameRepository gameRepository;
    private final AuthService authService;

    public LeaderboardService(ScoreRepository scoreRepository, GameRepository gameRepository, AuthService authService) {
        this.scoreRepository = scoreRepository;
        this.gameRepository = gameRepository;
        this.authService = authService;
    }

    public Page<LeaderboardEntryDto> getOverallLeaderboard(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Object[]> rawPage = scoreRepository.findOverallLeaderboard(pageable);

        List<LeaderboardEntryDto> dtos = new ArrayList<>();
        int startRank = page * size + 1;

        for (int i = 0; i < rawPage.getContent().size(); i++) {
            Object[] row = rawPage.getContent().get(i);
            Long userId = ((Number) row[0]).longValue();
            String fullName = (String) row[1];
            Integer totalPoints = row[2] != null ? ((Number) row[2]).intValue() : 0;
            Integer gamesPlayed = row[3] != null ? ((Number) row[3]).intValue() : 0;
            LocalDateTime achievedAt = convertToLocalDateTime(row[4]);

            dtos.add(new LeaderboardEntryDto(startRank + i, userId, fullName, totalPoints, totalPoints, gamesPlayed, achievedAt));
        }

        return new PageImpl<>(dtos, pageable, rawPage.getTotalElements());
    }

    public Page<LeaderboardEntryDto> getGameLeaderboard(String gameSlug, int page, int size) {
        Game game = gameRepository.findBySlug(gameSlug)
                .orElseThrow(() -> new ResourceNotFoundException("Game not found with slug: " + gameSlug));

        Pageable pageable = PageRequest.of(page, size);
        Page<Object[]> rawPage = scoreRepository.findGameLeaderboard(game.getId(), pageable);

        List<LeaderboardEntryDto> dtos = new ArrayList<>();
        int startRank = page * size + 1;

        for (int i = 0; i < rawPage.getContent().size(); i++) {
            Object[] row = rawPage.getContent().get(i);
            Long userId = ((Number) row[0]).longValue();
            String fullName = (String) row[1];
            Integer bestScore = row[2] != null ? ((Number) row[2]).intValue() : 0;
            Integer gamesPlayed = row[3] != null ? ((Number) row[3]).intValue() : 0;
            LocalDateTime achievedAt = convertToLocalDateTime(row[4]);

            dtos.add(new LeaderboardEntryDto(startRank + i, userId, fullName, bestScore, bestScore, gamesPlayed, achievedAt));
        }

        return new PageImpl<>(dtos, pageable, rawPage.getTotalElements());
    }

    public LeaderboardEntryDto getCurrentUserRank() {
        User user = authService.getCurrentAuthenticatedUser();
        Page<LeaderboardEntryDto> overall = getOverallLeaderboard(0, 1000);

        for (LeaderboardEntryDto entry : overall.getContent()) {
            if (entry.getUserId().equals(user.getId())) {
                return entry;
            }
        }

        Integer totalPoints = scoreRepository.findMaxScoreByUserId(user.getId());
        long count = scoreRepository.countByUserId(user.getId());
        return new LeaderboardEntryDto(null, user.getId(), user.getFullName(), totalPoints != null ? totalPoints : 0, totalPoints != null ? totalPoints : 0, (int) count, LocalDateTime.now());
    }

    private LocalDateTime convertToLocalDateTime(Object dateObj) {
        if (dateObj == null) return LocalDateTime.now();
        if (dateObj instanceof Timestamp) {
            return ((Timestamp) dateObj).toLocalDateTime();
        } else if (dateObj instanceof LocalDateTime) {
            return (LocalDateTime) dateObj;
        }
        return LocalDateTime.now();
    }
}

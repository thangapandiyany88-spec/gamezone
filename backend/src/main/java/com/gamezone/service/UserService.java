package com.gamezone.service;

import com.gamezone.dto.*;
import com.gamezone.entity.Score;
import com.gamezone.entity.User;
import com.gamezone.repository.ScoreRepository;
import com.gamezone.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final ScoreRepository scoreRepository;
    private final AuthService authService;
    private final LeaderboardService leaderboardService;

    public UserService(UserRepository userRepository, ScoreRepository scoreRepository, AuthService authService, LeaderboardService leaderboardService) {
        this.userRepository = userRepository;
        this.scoreRepository = scoreRepository;
        this.authService = authService;
        this.leaderboardService = leaderboardService;
    }

    public UserDto getProfile() {
        return authService.getCurrentUserDto();
    }

    @Transactional
    public UserDto updateProfile(UpdateProfileRequest request) {
        User currentUser = authService.getCurrentAuthenticatedUser();
        currentUser.setFullName(request.getFullName().trim());
        User saved = userRepository.save(currentUser);
        return new UserDto(saved.getId(), saved.getFullName(), saved.getEmail(), saved.getCreatedAt());
    }

    public UserStatsDto getUserStats() {
        User user = authService.getCurrentAuthenticatedUser();
        long totalGames = scoreRepository.countByUserId(user.getId());

        // Per game bests
        List<Object[]> rawGrouped = scoreRepository.findUserBestScoresGroupedByGame(user.getId());
        List<GameBestDto> gameBests = new ArrayList<>();
        int totalPoints = 0;
        int highestSingleScore = 0;

        for (Object[] row : rawGrouped) {
            String slug = (String) row[0];
            Integer best = row[1] != null ? ((Number) row[1]).intValue() : 0;
            gameBests.add(new GameBestDto(slug, best));
            totalPoints += best;
            if (best > highestSingleScore) {
                highestSingleScore = best;
            }
        }

        LeaderboardEntryDto rankEntry = leaderboardService.getCurrentUserRank();
        Integer rank = rankEntry != null ? rankEntry.getRank() : null;

        return new UserStatsDto(totalGames, totalPoints, highestSingleScore, rank, gameBests);
    }

    public Page<GameSessionHistoryDto> getUserHistory(int page, int size) {
        User user = authService.getCurrentAuthenticatedUser();
        Pageable pageable = PageRequest.of(page, size);
        Page<Score> scorePage = scoreRepository.findByUserIdOrderByAchievedAtDesc(user.getId(), pageable);

        List<GameSessionHistoryDto> historyDtos = scorePage.getContent().stream()
                .map(s -> new GameSessionHistoryDto(
                        s.getId(),
                        s.getGame().getName(),
                        s.getGame().getSlug(),
                        s.getScore(),
                        s.getDurationSeconds(),
                        s.getAchievedAt()
                ))
                .collect(Collectors.toList());

        return new PageImpl<>(historyDtos, pageable, scorePage.getTotalElements());
    }
}

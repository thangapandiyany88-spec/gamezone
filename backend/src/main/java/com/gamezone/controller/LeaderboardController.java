package com.gamezone.controller;

import com.gamezone.dto.LeaderboardEntryDto;
import com.gamezone.service.LeaderboardService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/leaderboard")
public class LeaderboardController {

    private final LeaderboardService leaderboardService;

    public LeaderboardController(LeaderboardService leaderboardService) {
        this.leaderboardService = leaderboardService;
    }

    @GetMapping
    public ResponseEntity<Page<LeaderboardEntryDto>> getOverallLeaderboard(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(leaderboardService.getOverallLeaderboard(page, size));
    }

    @GetMapping("/{slug}")
    public ResponseEntity<Page<LeaderboardEntryDto>> getGameLeaderboard(
            @PathVariable String slug,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(leaderboardService.getGameLeaderboard(slug, page, size));
    }

    @GetMapping("/me")
    public ResponseEntity<LeaderboardEntryDto> getCurrentUserRank() {
        return ResponseEntity.ok(leaderboardService.getCurrentUserRank());
    }
}

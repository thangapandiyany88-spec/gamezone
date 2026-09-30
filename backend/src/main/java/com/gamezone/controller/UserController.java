package com.gamezone.controller;

import com.gamezone.dto.*;
import com.gamezone.service.UserService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users/me")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<UserDto> getProfile() {
        return ResponseEntity.ok(userService.getProfile());
    }

    @PatchMapping
    public ResponseEntity<UserDto> updateProfile(@Valid @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(userService.updateProfile(request));
    }

    @GetMapping("/stats")
    public ResponseEntity<UserStatsDto> getUserStats() {
        return ResponseEntity.ok(userService.getUserStats());
    }

    @GetMapping("/history")
    public ResponseEntity<Page<GameSessionHistoryDto>> getUserHistory(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(userService.getUserHistory(page, size));
    }
}

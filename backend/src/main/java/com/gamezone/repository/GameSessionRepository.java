package com.gamezone.repository;

import com.gamezone.entity.GameSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface GameSessionRepository extends JpaRepository<GameSession, Long> {
    Optional<GameSession> findBySessionToken(String sessionToken);
}

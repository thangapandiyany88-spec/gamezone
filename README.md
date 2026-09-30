# GAMEZONE — WEB GAME HUB

GameZone is a full-stack, responsive browser gaming platform designed for college students and casual gamers. It features 5 playable browser games, real-time score tracking, verified server-side session persistence, user profiles, and global player leaderboards powered by Spring Boot, MySQL, and Vanilla Web Technologies.

---

## 🚀 Features

* **Authentication & User Management**:
  * Registration with full name, email format validation, and duplicate email prevention.
  * BCrypt password hashing and Spring Security authorization rules.
  * Server-side session management with HttpOnly, SameSite cookies.
  * Protected routes for dashboard, score submissions, and profile updates.

* **5 Interactive Browser Games**:
  1. **Snake Game**: Canvas rendering, WASD/Arrow controls, food spawning, wall/self collision detection, touch controls.
  2. **2D Car Racing**: Top-down endless speed driver, obstacle spawning, road speed progression, collision detection.
  3. **Tic-Tac-Toe**: 3x3 tactical grid, single-player vs AI computer & 2-player local mode.
  4. **Memory Match**: Card-flipping memory puzzle, move counter, timer, scoring based on speed & precision.
  5. **Rock-Paper-Scissors**: Interactive decision game, Best-of-5 match score resolution.

* **Server-Validated Scoring & Session Tracking**:
  * Every game play initializes a server session (`POST /api/games/{slug}/sessions`).
  * Completed scores are validated server-side (`POST /api/games/{slug}/sessions/{sessionId}/complete`) against theoretical bounds to prevent cheat submissions.
  * Duplicate submissions for the same completed session are blocked.

* **Global & Game Leaderboards**:
  * **Overall Leaderboard**: Calculated using the **sum of each player's best score in each game**.
  * **Game-Specific Leaderboards**: Highest valid score in that game.
  * Tie-breaking based on the earliest timestamp at which the best score was achieved.
  * Top 3 podium styling (Gold, Silver, Bronze) and current user row highlighting.

* **User Profiles & History**:
  * Personal best score breakdown for each game.
  * Full session history table with scores, duration, and timestamps.
  * Display name editing with server-side validation.

---

## 🛠️ Technology Stack

* **Frontend**: HTML5, Vanilla CSS3 (Custom Glassmorphism Arcade Theme), Vanilla JavaScript (ES6+), HTML Canvas API, Fetch API.
* **Backend**: Java 17+, Spring Boot 3.2, Spring Web, Spring Security, Spring Data JPA, Hibernate ORM, Bean Validation.
* **Database**: MySQL 8.0 (Schema migration script in `database/schema.sql`) / H2 (Embedded fallback mode).
* **Testing**: JUnit 5, Spring Boot Test, MockMvc.

---

## 📁 Project Structure

```text
gamezone/
├── frontend/
│   ├── index.html              # Landing page
│   ├── login.html              # User authentication login
│   ├── register.html           # User registration form
│   ├── dashboard.html          # Arcade dashboard
│   ├── games.html              # Games hub page
│   ├── leaderboard.html        # Leaderboards page
│   ├── profile.html            # User profile & stats
│   ├── css/
│   │   ├── style.css           # Core theme & glassmorphism system
│   │   ├── auth.css            # Form styling
│   │   ├── games.css           # Game container & canvas styles
│   │   └── leaderboard.css     # Podium & table styles
│   ├── js/
│   │   ├── api.js              # Fetch API client wrapper
│   │   ├── auth.js             # Authentication script
│   │   ├── dashboard.js        # Dashboard data loader
│   │   ├── leaderboard.js      # Leaderboard controller
│   │   ├── profile.js          # Profile controller
│   │   └── games.js            # Games arena coordinator
│   └── games/
│       ├── snake.js            # Snake canvas game
│       ├── car-racing.js       # 2D car racing canvas game
│       ├── tic-tac-toe.js      # Tic-Tac-Toe logic
│       ├── memory-match.js     # Memory match card puzzle
│       └── rock-paper-scissors.js # Rock paper scissors logic
├── backend/
│   ├── src/main/java/com/gamezone/
│   │   ├── config/
│   │   ├── controller/         # AuthController, GameController, LeaderboardController, UserController
│   │   ├── dto/                # Request/Response DTOs
│   │   ├── entity/             # User, Game, GameSession, Score
│   │   ├── repository/         # UserRepository, GameRepository, GameSessionRepository, ScoreRepository
│   │   ├── service/            # AuthService, GameService, LeaderboardService, UserService
│   │   ├── security/           # SecurityConfig, CustomUserDetailsService
│   │   └── exception/          # GlobalExceptionHandler
│   ├── src/main/resources/
│   │   ├── application.properties
│   │   ├── application-mysql.properties
│   │   ├── data.sql
│   │   └── static/             # Bundled frontend assets for single-server delivery
│   └── pom.xml                 # Maven configuration
├── database/
│   └── schema.sql              # MySQL 8.0 DDL & seeding script
├── README.md
└── .gitignore
```

---

## ⚙️ Prerequisites

1. **Java JDK 17 or higher** installed. Verify with `java -version`.
2. **Apache Maven 3.8+** installed. Verify with `mvn -version`.
3. **MySQL Server 8.0** (Optional for production MySQL mode; embedded H2 is included out-of-the-box).

---

## 🛢️ Database Setup (MySQL 8.0)

1. Start your local MySQL service.
2. Connect to MySQL CLI or Workbench and run the script in `database/schema.sql`:

```sql
SOURCE database/schema.sql;
```

This creates the database `gamezone_db`, all required tables (`users`, `games`, `game_sessions`, `scores`), indexes, and seeds the 5 default game records.

---

## 🚀 Running the Application

### Option A: Standard Launch (With Built-in Fallback Database)

1. Open a terminal in `gamezone/backend`.
2. Run Maven spring-boot plugin:

```bash
mvn spring-boot:run
```

3. Open your browser and navigate to:
   **`http://localhost:8080/`**

### Option B: Launch with Production MySQL 8.0

1. Ensure MySQL is running on port `3306` with database `gamezone_db`.
2. Set environment variables or update `application-mysql.properties`.
3. Run with active profile `mysql`:

```bash
mvn spring-boot:run -Dspring-boot.run.profiles=mysql
```

---

## 🧪 Running Automated Tests

To execute unit and integration tests (Auth, Sessions, Score Validation, Leaderboards):

```bash
cd backend
mvn clean test
```

Expected output:
```text
[INFO] Tests run: 9, Failures: 0, Errors: 0, Skipped: 0
[INFO] BUILD SUCCESS
```

---

## 📡 REST API Documentation & Postman Examples

### 1. User Registration
* **Endpoint**: `POST /api/auth/register`
* **Request Body**:
```json
{
  "fullName": "Alex Gamer",
  "email": "alex@example.com",
  "password": "securepassword123"
}
```
* **Expected Response (201 Created)**:
```json
{
  "id": 1,
  "fullName": "Alex Gamer",
  "email": "alex@example.com",
  "createdAt": "2026-09-30T18:50:00"
}
```

### 2. User Login
* **Endpoint**: `POST /api/auth/login`
* **Request Body**:
```json
{
  "email": "alex@example.com",
  "password": "securepassword123"
}
```
* **Expected Response (200 OK)**:
Returns user DTO and sets HTTP-only `GAMEZONE_JSESSIONID` session cookie.

### 3. Start Game Session
* **Endpoint**: `POST /api/games/snake/sessions`
* **Expected Response (201 Created)**:
```json
{
  "sessionId": "GZS-a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "gameSlug": "snake",
  "startedAt": "2026-09-30T18:55:00"
}
```

### 4. Complete Session & Submit Score
* **Endpoint**: `POST /api/games/snake/sessions/GZS-a1b2c3d4-e5f6-7890-abcd-ef1234567890/complete`
* **Request Body**:
```json
{
  "score": 150,
  "durationSeconds": 45
}
```
* **Expected Response (200 OK)**:
```json
{
  "scoreId": 1,
  "score": 150,
  "isPersonalBest": true,
  "message": "New personal best score recorded!"
}
```

### 5. Fetch Global Overall Leaderboard
* **Endpoint**: `GET /api/leaderboard?page=0&size=10`
* **Expected Response (200 OK)**:
```json
{
  "content": [
    {
      "rank": 1,
      "userId": 1,
      "fullName": "Alex Gamer",
      "totalPoints": 450,
      "bestScore": 450,
      "gamesPlayed": 3,
      "achievedAt": "2026-09-30T18:56:00"
    }
  ],
  "totalPages": 1,
  "totalElements": 1
}
```

---

## ❓ Troubleshooting & FAQs

* **Issue: `Java execution error or version mismatch`**
  * Solution: Ensure JDK 17+ is set in your system `JAVA_HOME` environment variable.
* **Issue: `CORS policy error when running frontend separately`**
  * Solution: `SecurityConfig.java` allows standard origins `http://localhost:8080`, `http://127.0.0.1:5500`, `http://localhost:3000`. If using another origin, update `gamezone.cors.allowed-origins` in `application.properties`.
* **Issue: `Duplicate score submission rejected`**
  * Solution: Sessions are single-use. Once completed, a new session must be created via `POST /api/games/{slug}/sessions`.

---

## 📄 License
This project is open-source and intended for educational and casual gaming platforms.

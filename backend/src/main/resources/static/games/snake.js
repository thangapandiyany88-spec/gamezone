/**
 * Game 1: Snake Game
 */

class SnakeGame {
  constructor(canvas, onScoreUpdate, onGameOver) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.onScoreUpdate = onScoreUpdate;
    this.onGameOver = onGameOver;

    this.gridSize = 20;
    this.tileCountX = canvas.width / this.gridSize;
    this.tileCountY = canvas.height / this.gridSize;

    this.snake = [];
    this.food = { x: 0, y: 0 };
    this.dx = 1;
    this.dy = 0;
    this.nextDx = 1;
    this.nextDy = 0;
    this.score = 0;
    this.speed = 120; // ms per tick
    this.gameInterval = null;
    this.isRunning = false;
    this.isPaused = false;
    this.startTime = 0;
    this.duration = 0;

    this.bindEvents();
  }

  bindEvents() {
    this.handleKey = (e) => {
      if (!this.isRunning || this.isPaused) return;
      const key = e.key.toLowerCase();
      if ((key === 'arrowup' || key === 'w') && this.dy !== 1) {
        this.nextDx = 0; this.nextDy = -1;
      } else if ((key === 'arrowdown' || key === 's') && this.dy !== -1) {
        this.nextDx = 0; this.nextDy = 1;
      } else if ((key === 'arrowleft' || key === 'a') && this.dx !== 1) {
        this.nextDx = -1; this.nextDy = 0;
      } else if ((key === 'arrowright' || key === 'd') && this.dx !== -1) {
        this.nextDx = 1; this.nextDy = 0;
      }
    };
  }

  start() {
    window.addEventListener('keydown', this.handleKey);
    this.reset();
    this.isRunning = true;
    this.isPaused = false;
    this.startTime = Date.now();
    this.gameInterval = setInterval(() => this.tick(), this.speed);
  }

  reset() {
    clearInterval(this.gameInterval);
    this.snake = [
      { x: 5, y: 10 },
      { x: 4, y: 10 },
      { x: 3, y: 10 }
    ];
    this.dx = 1; this.dy = 0;
    this.nextDx = 1; this.nextDy = 0;
    this.score = 0;
    this.spawnFood();
    this.onScoreUpdate(this.score);
    this.draw();
  }

  pause() {
    this.isPaused = true;
    clearInterval(this.gameInterval);
  }

  resume() {
    if (!this.isRunning) return;
    this.isPaused = false;
    this.gameInterval = setInterval(() => this.tick(), this.speed);
  }

  stop() {
    this.isRunning = false;
    this.isPaused = false;
    clearInterval(this.gameInterval);
    window.removeEventListener('keydown', this.handleKey);
  }

  handleMobileInput(direction) {
    if (!this.isRunning || this.isPaused) return;
    if (direction === 'up' && this.dy !== 1) { this.nextDx = 0; this.nextDy = -1; }
    if (direction === 'down' && this.dy !== -1) { this.nextDx = 0; this.nextDy = 1; }
    if (direction === 'left' && this.dx !== 1) { this.nextDx = -1; this.nextDy = 0; }
    if (direction === 'right' && this.dx !== -1) { this.nextDx = 1; this.nextDy = 0; }
  }

  spawnFood() {
    let valid = false;
    while (!valid) {
      this.food.x = Math.floor(Math.random() * this.tileCountX);
      this.food.y = Math.floor(Math.random() * this.tileCountY);
      valid = !this.snake.some(segment => segment.x === this.food.x && segment.y === this.food.y);
    }
  }

  tick() {
    this.dx = this.nextDx;
    this.dy = this.nextDy;

    const head = { x: this.snake[0].x + this.dx, y: this.snake[0].y + this.dy };

    // Wall collision
    if (head.x < 0 || head.x >= this.tileCountX || head.y < 0 || head.y >= this.tileCountY) {
      this.gameOver();
      return;
    }

    // Self collision
    if (this.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
      this.gameOver();
      return;
    }

    this.snake.unshift(head);

    // Food collision
    if (head.x === this.food.x && head.y === this.food.y) {
      this.score += 10;
      this.onScoreUpdate(this.score);
      this.spawnFood();
      // Slightly increase speed
      if (this.score % 50 === 0 && this.speed > 60) {
        this.speed -= 5;
        clearInterval(this.gameInterval);
        this.gameInterval = setInterval(() => this.tick(), this.speed);
      }
    } else {
      this.snake.pop();
    }

    this.draw();
  }

  draw() {
    // Clear background
    this.ctx.fillStyle = '#080b18';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw Grid Lines (Subtle)
    this.ctx.strokeStyle = 'rgba(0, 240, 255, 0.05)';
    for (let x = 0; x < this.canvas.width; x += this.gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.canvas.height);
      this.ctx.stroke();
    }
    for (let y = 0; y < this.canvas.height; y += this.gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.canvas.width, y);
      this.ctx.stroke();
    }

    // Draw Food
    this.ctx.fillStyle = '#00ff9d';
    this.ctx.shadowColor = '#00ff9d';
    this.ctx.shadowBlur = 12;
    this.ctx.fillRect(
      this.food.x * this.gridSize + 2,
      this.food.y * this.gridSize + 2,
      this.gridSize - 4,
      this.gridSize - 4
    );

    // Draw Snake
    this.snake.forEach((segment, index) => {
      this.ctx.fillStyle = index === 0 ? '#00f0ff' : 'rgba(0, 240, 255, 0.75)';
      this.ctx.shadowColor = '#00f0ff';
      this.ctx.shadowBlur = index === 0 ? 10 : 4;
      this.ctx.fillRect(
        segment.x * this.gridSize + 1,
        segment.y * this.gridSize + 1,
        this.gridSize - 2,
        this.gridSize - 2
      );
    });

    this.ctx.shadowBlur = 0; // Reset glow
  }

  gameOver() {
    this.stop();
    this.duration = Math.round((Date.now() - this.startTime) / 1000);
    this.onGameOver({
      score: this.score,
      duration: this.duration
    });
  }
}

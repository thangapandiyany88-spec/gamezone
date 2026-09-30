/**
 * Game 2: 2D Car Racing Game
 */

class CarRacingGame {
  constructor(canvas, onScoreUpdate, onGameOver) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.onScoreUpdate = onScoreUpdate;
    this.onGameOver = onGameOver;

    this.carWidth = 36;
    this.carHeight = 65;
    this.playerX = canvas.width / 2 - this.carWidth / 2;
    this.playerY = canvas.height - this.carHeight - 20;
    this.playerSpeed = 6;

    this.obstacles = [];
    this.roadOffset = 0;
    this.roadSpeed = 5;
    this.score = 0;
    this.distance = 0;
    this.gameInterval = null;
    this.spawnTimer = null;
    this.isRunning = false;
    this.isPaused = false;
    this.startTime = 0;

    this.keys = { left: false, right: false, up: false, down: false };
    this.bindEvents();
  }

  bindEvents() {
    this.handleKeyDown = (e) => {
      if (!this.isRunning || this.isPaused) return;
      const key = e.key.toLowerCase();
      if (key === 'arrowleft' || key === 'a') this.keys.left = true;
      if (key === 'arrowright' || key === 'd') this.keys.right = true;
      if (key === 'arrowup' || key === 'w') this.keys.up = true;
      if (key === 'arrowdown' || key === 's') this.keys.down = true;
    };

    this.handleKeyUp = (e) => {
      const key = e.key.toLowerCase();
      if (key === 'arrowleft' || key === 'a') this.keys.left = false;
      if (key === 'arrowright' || key === 'd') this.keys.right = false;
      if (key === 'arrowup' || key === 'w') this.keys.up = false;
      if (key === 'arrowdown' || key === 's') this.keys.down = false;
    };
  }

  start() {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    this.reset();
    this.isRunning = true;
    this.isPaused = false;
    this.startTime = Date.now();
    this.gameInterval = setInterval(() => this.tick(), 1000 / 60); // 60 FPS
  }

  reset() {
    clearInterval(this.gameInterval);
    this.playerX = this.canvas.width / 2 - this.carWidth / 2;
    this.playerY = this.canvas.height - this.carHeight - 20;
    this.obstacles = [];
    this.roadSpeed = 5;
    this.score = 0;
    this.distance = 0;
    this.keys = { left: false, right: false, up: false, down: false };
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
    this.gameInterval = setInterval(() => this.tick(), 1000 / 60);
  }

  stop() {
    this.isRunning = false;
    this.isPaused = false;
    clearInterval(this.gameInterval);
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
  }

  handleMobileInput(direction) {
    if (!this.isRunning || this.isPaused) return;
    if (direction === 'left') {
      this.playerX = Math.max(60, this.playerX - 25);
    } else if (direction === 'right') {
      this.playerX = Math.min(this.canvas.width - 60 - this.carWidth, this.playerX + 25);
    }
  }

  spawnObstacle() {
    const roadLeft = 60;
    const roadRight = this.canvas.width - 60 - this.carWidth;
    const x = Math.floor(Math.random() * (roadRight - roadLeft)) + roadLeft;
    const color = ['#ff3366', '#b026ff', '#ffd700'][Math.floor(Math.random() * 3)];
    this.obstacles.push({
      x: x,
      y: -this.carHeight,
      width: this.carWidth,
      height: this.carHeight,
      speed: this.roadSpeed + Math.random() * 2,
      color: color
    });
  }

  tick() {
    // Move player
    if (this.keys.left && this.playerX > 60) this.playerX -= this.playerSpeed;
    if (this.keys.right && this.playerX < this.canvas.width - 60 - this.carWidth) this.playerX += this.playerSpeed;
    if (this.keys.up && this.playerY > 50) this.playerY -= this.playerSpeed * 0.5;
    if (this.keys.down && this.playerY < this.canvas.height - this.carHeight - 10) this.playerY += this.playerSpeed * 0.5;

    // Road animation
    this.roadOffset = (this.roadOffset + this.roadSpeed) % 40;

    // Update Distance & Score
    this.distance += this.roadSpeed * 0.1;
    this.score = Math.floor(this.distance * 5);
    this.onScoreUpdate(this.score);

    // Speed progression
    this.roadSpeed = 5 + Math.floor(this.score / 150) * 0.5;

    // Spawn obstacles periodically
    if (Math.random() < 0.025) {
      if (this.obstacles.length === 0 || this.obstacles[this.obstacles.length - 1].y > 150) {
        this.spawnObstacle();
      }
    }

    // Move obstacles & Collision Detection
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];
      obs.y += obs.speed;

      // Check collision
      if (
        this.playerX < obs.x + obs.width &&
        this.playerX + this.carWidth > obs.x &&
        this.playerY < obs.y + obs.height &&
        this.playerY + this.carHeight > obs.y
      ) {
        this.gameOver();
        return;
      }

      // Remove off-screen obstacles
      if (obs.y > this.canvas.height) {
        this.obstacles.splice(i, 1);
      }
    }

    this.draw();
  }

  draw() {
    const w = this.canvas.width;
    const h = this.canvas.height;

    // Grass borders
    this.ctx.fillStyle = '#0a1d12';
    this.ctx.fillRect(0, 0, w, h);

    // Road track
    const roadX = 50;
    const roadW = w - 100;
    this.ctx.fillStyle = '#121526';
    this.ctx.fillRect(roadX, 0, roadW, h);

    // Road side boundary lines
    this.ctx.fillStyle = '#00f0ff';
    this.ctx.fillRect(roadX - 4, 0, 4, h);
    this.ctx.fillRect(roadX + roadW, 0, 4, h);

    // Center dashed lines
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    this.ctx.lineWidth = 4;
    this.ctx.setLineDash([20, 20]);
    this.ctx.lineDashOffset = -this.roadOffset;
    this.ctx.beginPath();
    this.ctx.moveTo(w / 2, 0);
    this.ctx.lineTo(w / 2, h);
    this.ctx.stroke();
    this.ctx.setLineDash([]); // Reset line dash

    // Draw Player Car
    this.drawCar(this.playerX, this.playerY, this.carWidth, this.carHeight, '#00f0ff', true);

    // Draw Obstacle Cars
    this.obstacles.forEach(obs => {
      this.drawCar(obs.x, obs.y, obs.width, obs.height, obs.color, false);
    });
  }

  drawCar(x, y, width, height, color, isPlayer) {
    this.ctx.fillStyle = color;
    this.ctx.shadowColor = color;
    this.ctx.shadowBlur = isPlayer ? 15 : 6;

    // Car Body
    this.ctx.fillRect(x, y, width, height);

    // Windshield
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(x + 4, isPlayer ? y + 12 : y + height - 22, width - 8, 10);

    // Headlights / Taillights
    this.ctx.fillStyle = isPlayer ? '#ffd700' : '#ff3366';
    this.ctx.fillRect(x + 2, isPlayer ? y + 2 : y + height - 4, 6, 4);
    this.ctx.fillRect(x + width - 8, isPlayer ? y + 2 : y + height - 4, 6, 4);

    this.ctx.shadowBlur = 0;
  }

  gameOver() {
    this.stop();
    const duration = Math.round((Date.now() - this.startTime) / 1000);
    this.onGameOver({
      score: this.score,
      duration: duration
    });
  }
}

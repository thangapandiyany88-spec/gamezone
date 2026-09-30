/**
 * Game 3: Tic-Tac-Toe Game
 */

class TicTacToeGame {
  constructor(container, onScoreUpdate, onGameOver) {
    this.container = container;
    this.onScoreUpdate = onScoreUpdate;
    this.onGameOver = onGameOver;

    this.board = Array(9).fill(null);
    this.currentPlayer = 'X'; // User is X
    this.vsAI = true;
    this.gameActive = false;
    this.score = 0;
    this.startTime = 0;
  }

  start() {
    this.board = Array(9).fill(null);
    this.currentPlayer = 'X';
    this.gameActive = true;
    this.score = 0;
    this.startTime = Date.now();
    this.onScoreUpdate(this.score);
    this.render();
  }

  reset() {
    this.start();
  }

  pause() {}
  resume() {}
  stop() {
    this.gameActive = false;
  }

  render() {
    this.container.innerHTML = `
      <div style="display: flex; justify-content: center; gap: 1rem; margin-bottom: 1rem;">
        <button id="modeAiBtn" class="btn ${this.vsAI ? 'btn-primary' : 'btn-outline'} btn-sm">VS AI Computer</button>
        <button id="modeLocalBtn" class="btn ${!this.vsAI ? 'btn-primary' : 'btn-outline'} btn-sm">VS 2-Player Local</button>
      </div>

      <div class="ttt-board">
        ${this.board.map((cell, idx) => `
          <div class="ttt-cell ${cell ? cell.toLowerCase() : ''} ${!this.gameActive || cell ? 'disabled' : ''}" data-index="${idx}">
            ${cell || ''}
          </div>
        `).join('')}
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    const aiBtn = this.container.querySelector('#modeAiBtn');
    const localBtn = this.container.querySelector('#modeLocalBtn');

    if (aiBtn) aiBtn.onclick = () => { this.vsAI = true; this.start(); };
    if (localBtn) localBtn.onclick = () => { this.vsAI = false; this.start(); };

    const cells = this.container.querySelectorAll('.ttt-cell');
    cells.forEach(cell => {
      cell.onclick = () => {
        const idx = parseInt(cell.dataset.index);
        this.makeMove(idx);
      };
    });
  }

  makeMove(index) {
    if (!this.gameActive || this.board[index]) return;

    this.board[index] = this.currentPlayer;
    this.render();

    if (this.checkWin(this.currentPlayer)) {
      this.endGame(this.currentPlayer === 'X' ? 100 : 50, `Player ${this.currentPlayer} Wins!`);
      return;
    }

    if (this.board.every(cell => cell !== null)) {
      this.endGame(25, "Match Ended in a Draw!");
      return;
    }

    // Switch player
    this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';

    if (this.vsAI && this.currentPlayer === 'O' && this.gameActive) {
      setTimeout(() => this.makeAiMove(), 400);
    }
  }

  makeAiMove() {
    const emptyIndices = this.board.map((val, idx) => val === null ? idx : null).filter(val => val !== null);
    if (emptyIndices.length === 0 || !this.gameActive) return;

    // Check if AI can win immediately
    for (let idx of emptyIndices) {
      this.board[idx] = 'O';
      if (this.checkWin('O')) {
        this.render();
        this.endGame(0, "AI Computer Wins!");
        return;
      }
      this.board[idx] = null;
    }

    // Check if AI needs to block player X win
    for (let idx of emptyIndices) {
      this.board[idx] = 'X';
      if (this.checkWin('X')) {
        this.board[idx] = 'O';
        this.render();
        this.checkMatchStatusAfterAiMove();
        return;
      }
      this.board[idx] = null;
    }

    // Random move
    const randomChoice = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
    this.board[randomChoice] = 'O';
    this.render();
    this.checkMatchStatusAfterAiMove();
  }

  checkMatchStatusAfterAiMove() {
    if (this.checkWin('O')) {
      this.endGame(0, "AI Computer Wins!");
    } else if (this.board.every(cell => cell !== null)) {
      this.endGame(25, "Match Ended in a Draw!");
    } else {
      this.currentPlayer = 'X';
    }
  }

  checkWin(player) {
    const winPatterns = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
      [0, 4, 8], [2, 4, 6]             // Diagonals
    ];
    return winPatterns.some(pattern => pattern.every(idx => this.board[idx] === player));
  }

  endGame(awardPoints, outcomeText) {
    this.gameActive = false;
    this.score = awardPoints;
    this.onScoreUpdate(this.score);
    const duration = Math.round((Date.now() - this.startTime) / 1000);
    
    setTimeout(() => {
      this.onGameOver({
        score: this.score,
        duration: duration,
        outcomeText: outcomeText
      });
    }, 400);
  }
}

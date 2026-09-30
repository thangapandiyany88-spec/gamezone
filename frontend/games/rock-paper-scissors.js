/**
 * Game 5: Rock-Paper-Scissors Game
 */

class RockPaperScissorsGame {
  constructor(container, onScoreUpdate, onGameOver) {
    this.container = container;
    this.onScoreUpdate = onScoreUpdate;
    this.onGameOver = onGameOver;

    this.playerScore = 0;
    this.computerScore = 0;
    this.targetWins = 3; // Best of 5 (first to 3)
    this.gameActive = false;
    this.score = 0;
    this.startTime = 0;
    this.lastResultText = "First player to win 3 rounds wins the match!";
    this.playerChoice = null;
    this.computerChoice = null;
  }

  start() {
    this.playerScore = 0;
    this.computerScore = 0;
    this.score = 0;
    this.gameActive = true;
    this.startTime = Date.now();
    this.lastResultText = "First to win 3 rounds wins the match!";
    this.playerChoice = null;
    this.computerChoice = null;
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
    const iconMap = {
      rock: '✊',
      paper: '✋',
      scissors: '✌️'
    };

    this.container.innerHTML = `
      <div style="display: flex; justify-content: space-around; font-size: 1.1rem; margin-bottom: 1.5rem;">
        <div><strong>Player (You):</strong> <span style="color: var(--primary-cyan); font-family: var(--font-heading);">${this.playerScore}</span></div>
        <div><strong>Target:</strong> 3 Wins</div>
        <div><strong>Computer:</strong> <span style="color: var(--secondary-purple); font-family: var(--font-heading);">${this.computerScore}</span></div>
      </div>

      <div class="rps-arena">
        <div class="rps-player-box">
          <div class="rps-choice-icon">${this.playerChoice ? iconMap[this.playerChoice] : '❓'}</div>
          <span style="font-weight: 700; color: var(--primary-cyan);">YOU</span>
        </div>

        <div style="font-family: var(--font-heading); font-size: 1.5rem; color: var(--text-muted);">VS</div>

        <div class="rps-player-box">
          <div class="rps-choice-icon" style="border-color: var(--secondary-purple);">${this.computerChoice ? iconMap[this.computerChoice] : '❓'}</div>
          <span style="font-weight: 700; color: var(--secondary-purple);">COMPUTER</span>
        </div>
      </div>

      <div style="font-size: 1.1rem; color: #fff; margin-bottom: 1.5rem;" id="rpsStatusText">
        ${this.lastResultText}
      </div>

      <div class="rps-options">
        <button class="rps-btn" data-choice="rock" ${!this.gameActive ? 'disabled' : ''}>✊</button>
        <button class="rps-btn" data-choice="paper" ${!this.gameActive ? 'disabled' : ''}>✋</button>
        <button class="rps-btn" data-choice="scissors" ${!this.gameActive ? 'disabled' : ''}>✌️</button>
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    const btns = this.container.querySelectorAll('.rps-btn');
    btns.forEach(btn => {
      btn.onclick = () => {
        const choice = btn.dataset.choice;
        this.playRound(choice);
      };
    });
  }

  playRound(pChoice) {
    if (!this.gameActive) return;

    const choices = ['rock', 'paper', 'scissors'];
    const cChoice = choices[Math.floor(Math.random() * choices.length)];

    this.playerChoice = pChoice;
    this.computerChoice = cChoice;

    let result = '';
    if (pChoice === cChoice) {
      result = "Round Draw!";
    } else if (
      (pChoice === 'rock' && cChoice === 'scissors') ||
      (pChoice === 'paper' && cChoice === 'rock') ||
      (pChoice === 'scissors' && cChoice === 'paper')
    ) {
      this.playerScore++;
      result = `Round Win! ${pChoice.toUpperCase()} beats ${cChoice.toUpperCase()}`;
    } else {
      this.computerScore++;
      result = `Round Loss! ${cChoice.toUpperCase()} beats ${pChoice.toUpperCase()}`;
    }

    this.lastResultText = result;
    this.render();

    if (this.playerScore >= this.targetWins) {
      this.endGame(true);
    } else if (this.computerScore >= this.targetWins) {
      this.endGame(false);
    }
  }

  endGame(playerWon) {
    this.gameActive = false;
    const duration = Math.round((Date.now() - this.startTime) / 1000);
    this.score = playerWon ? 150 : 30;

    this.onScoreUpdate(this.score);

    setTimeout(() => {
      this.onGameOver({
        score: this.score,
        duration: duration,
        outcomeText: playerWon ? `VICTORY! You won the Best-of-5 match ${this.playerScore}-${this.computerScore}!` : `DEFEAT! Computer won ${this.computerScore}-${this.playerScore}`
      });
    }, 600);
  }
}

/**
 * Game 4: Memory Match Puzzle Game
 */

class MemoryMatchGame {
  constructor(container, onScoreUpdate, onGameOver) {
    this.container = container;
    this.onScoreUpdate = onScoreUpdate;
    this.onGameOver = onGameOver;

    this.symbols = ['⚡', '🔥', '💎', '🚀', '👑', '👾', '🎯', '🔮'];
    this.cards = [];
    this.flippedCards = [];
    this.matchedPairs = 0;
    this.moves = 0;
    this.gameActive = false;
    this.startTime = 0;
    this.score = 0;
  }

  start() {
    this.moves = 0;
    this.matchedPairs = 0;
    this.score = 0;
    this.flippedCards = [];
    this.gameActive = true;
    this.startTime = Date.now();
    this.onScoreUpdate(this.score);

    // Create 8 pairs = 16 cards
    const cardSymbols = [...this.symbols, ...this.symbols];
    this.shuffle(cardSymbols);

    this.cards = cardSymbols.map((sym, id) => ({
      id: id,
      symbol: sym,
      flipped: false,
      matched: false
    }));

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

  shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  render() {
    this.container.innerHTML = `
      <div style="display: flex; justify-content: center; gap: 2rem; margin-bottom: 1rem; font-size: 1rem;">
        <div><strong>Moves:</strong> <span id="memMovesVal">${this.moves}</span></div>
        <div><strong>Pairs Matched:</strong> <span id="memMatchedVal">${this.matchedPairs} / ${this.symbols.length}</span></div>
      </div>

      <div class="memory-board">
        ${this.cards.map(card => `
          <div class="memory-card ${card.flipped ? 'flipped' : ''} ${card.matched ? 'matched' : ''}" data-id="${card.id}">
            <div class="memory-card-inner">
              <div class="memory-front">?</div>
              <div class="memory-back">${card.symbol}</div>
            </div>
          </div>
        `).join('')}
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    const cardEls = this.container.querySelectorAll('.memory-card');
    cardEls.forEach(el => {
      el.onclick = () => {
        const id = parseInt(el.dataset.id);
        this.flipCard(id);
      };
    });
  }

  flipCard(id) {
    if (!this.gameActive) return;

    const card = this.cards.find(c => c.id === id);
    if (!card || card.flipped || card.matched || this.flippedCards.length >= 2) return;

    card.flipped = true;
    this.flippedCards.push(card);
    this.render();

    if (this.flippedCards.length === 2) {
      this.moves++;
      const movesValEl = this.container.querySelector('#memMovesVal');
      if (movesValEl) movesValEl.textContent = this.moves;

      const [c1, c2] = this.flippedCards;
      if (c1.symbol === c2.symbol) {
        // Match!
        c1.matched = true;
        c2.matched = true;
        this.matchedPairs++;
        this.flippedCards = [];
        this.render();

        if (this.matchedPairs === this.symbols.length) {
          this.endGame();
        }
      } else {
        // Flip back after delay
        setTimeout(() => {
          c1.flipped = false;
          c2.flipped = false;
          this.flippedCards = [];
          this.render();
        }, 800);
      }
    }
  }

  endGame() {
    this.gameActive = false;
    const duration = Math.round((Date.now() - this.startTime) / 1000);
    // Score Formula: Max 500 minus deductions for extra moves & time
    const movePenalty = (this.moves - this.symbols.length) * 15;
    const timePenalty = duration * 3;
    this.score = Math.max(50, 500 - movePenalty - timePenalty);

    this.onScoreUpdate(this.score);

    setTimeout(() => {
      this.onGameOver({
        score: this.score,
        duration: duration,
        outcomeText: `Completed in ${this.moves} moves (${duration}s)!`
      });
    }, 500);
  }
}

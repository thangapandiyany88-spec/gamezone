/**
 * Master Games Arena Controller
 */

let currentGameSlug = 'snake';
let activeGameInstance = null;
let currentSessionId = null;
let sessionSubmitted = false;
let personalBestScore = 0;

const gameMetadata = {
  'snake': {
    name: 'Snake Game',
    isCanvas: true,
    controls: 'Use Arrow keys or WASD to control the snake movement. Collect green food items to gain points and grow. Don\'t hit walls or your own tail!'
  },
  'car-racing': {
    name: '2D Car Racing',
    isCanvas: true,
    controls: 'Use Left/Right Arrow keys or A/D to steer your car. Dodge oncoming cars and obstacles. Score increases with distance driven!'
  },
  'tic-tac-toe': {
    name: 'Tic-Tac-Toe',
    isCanvas: false,
    controls: 'Click any empty cell to place your X. Get 3 in a row vertically, horizontally, or diagonally to win. Play against AI or a local friend!'
  },
  'memory-match': {
    name: 'Memory Match',
    isCanvas: false,
    controls: 'Click cards to flip them and uncover hidden symbols. Match all 8 pairs with as few moves and as quickly as possible!'
  },
  'rock-paper-scissors': {
    name: 'Rock-Paper-Scissors',
    isCanvas: false,
    controls: 'Click Rock, Paper, or Scissors to make your choice each round. Win 3 rounds first to win the Best-of-5 match!'
  }
};

document.addEventListener('DOMContentLoaded', () => {
  if (window.location.pathname.endsWith('games.html')) {
    // Read optional query param e.g. ?play=car-racing
    const urlParams = new URLSearchParams(window.location.search);
    const playParam = urlParams.get('play');
    if (playParam && gameMetadata[playParam]) {
      currentGameSlug = playParam;
    }

    initGameTabs();
    initControls();
    switchGame(currentGameSlug);
  }
});

function initGameTabs() {
  const tabs = document.querySelectorAll('#gameSelectorTabs .tab-btn');
  tabs.forEach(tab => {
    if (tab.dataset.game === currentGameSlug) {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
    }

    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      switchGame(tab.dataset.game);
    });
  });
}

function initControls() {
  const btnStartPause = document.getElementById('btnStartPause');
  const btnRestart = document.getElementById('btnRestart');
  const overlayActionBtn = document.getElementById('overlayActionBtn');

  if (btnStartPause) {
    btnStartPause.addEventListener('click', togglePlayPause);
  }
  if (btnRestart) {
    btnRestart.addEventListener('click', restartGame);
  }
  if (overlayActionBtn) {
    overlayActionBtn.addEventListener('click', startNewGameSession);
  }

  // Mobile D-Pad Buttons
  ['Up', 'Down', 'Left', 'Right'].forEach(dir => {
    const btn = document.getElementById(`btn${dir}`);
    if (btn) {
      btn.addEventListener('click', () => {
        if (activeGameInstance && activeGameInstance.handleMobileInput) {
          activeGameInstance.handleMobileInput(dir.toLowerCase());
        }
      });
    }
  });
}

async function switchGame(slug) {
  // Stop existing game if active
  if (activeGameInstance) {
    activeGameInstance.stop();
    activeGameInstance = null;
  }

  currentGameSlug = slug;
  currentSessionId = null;
  sessionSubmitted = false;
  const meta = gameMetadata[slug];

  // Update HUD Header & Guide Text
  document.getElementById('hudGameName').textContent = meta.name;
  document.getElementById('hudScore').textContent = '0';
  document.getElementById('controlsText').textContent = meta.controls;

  // Toggle Canvas vs HTML board container
  const canvas = document.getElementById('gameCanvas');
  const htmlContainer = document.getElementById('htmlBoardContainer');

  if (meta.isCanvas) {
    canvas.style.display = 'block';
    htmlContainer.style.display = 'none';
  } else {
    canvas.style.display = 'none';
    htmlContainer.style.display = 'block';
  }

  // Fetch personal best for this game if logged in
  loadPersonalBest(slug);

  // Reset Overlay to Start state
  showOverlay('READY TO PLAY?', `Press Start to begin your ${meta.name} session`, false);

  // Instantiate game class
  const onScoreUpdate = (s) => {
    document.getElementById('hudScore').textContent = s;
  };

  const onGameOver = (result) => {
    handleGameOver(result);
  };

  if (slug === 'snake') {
    activeGameInstance = new SnakeGame(canvas, onScoreUpdate, onGameOver);
  } else if (slug === 'car-racing') {
    activeGameInstance = new CarRacingGame(canvas, onScoreUpdate, onGameOver);
  } else if (slug === 'tic-tac-toe') {
    activeGameInstance = new TicTacToeGame(htmlContainer, onScoreUpdate, onGameOver);
  } else if (slug === 'memory-match') {
    activeGameInstance = new MemoryMatchGame(htmlContainer, onScoreUpdate, onGameOver);
  } else if (slug === 'rock-paper-scissors') {
    activeGameInstance = new RockPaperScissorsGame(htmlContainer, onScoreUpdate, onGameOver);
  }
}

async function loadPersonalBest(slug) {
  try {
    const stats = await API.user.getStats();
    const bests = stats.gameBests || [];
    const found = bests.find(b => b.gameSlug === slug);
    personalBestScore = found ? found.bestScore : 0;
    document.getElementById('hudPersonalBest').textContent = personalBestScore;
  } catch (e) {
    personalBestScore = 0;
    document.getElementById('hudPersonalBest').textContent = '0';
  }
}

async function startNewGameSession() {
  hideOverlay();
  sessionSubmitted = false;

  // Attempt backend session creation
  try {
    const sessionRes = await API.games.startSession(currentGameSlug);
    currentSessionId = sessionRes.sessionId;
  } catch (err) {
    console.warn('Game session started in guest mode (or offline):', err.message);
    currentSessionId = null;
  }

  document.getElementById('btnStartPause').innerHTML = '<i class="fa-solid fa-pause"></i> Pause';
  if (activeGameInstance) {
    activeGameInstance.start();
  }
}

function togglePlayPause() {
  if (!activeGameInstance) return;

  if (activeGameInstance.isRunning && !activeGameInstance.isPaused) {
    activeGameInstance.pause();
    document.getElementById('btnStartPause').innerHTML = '<i class="fa-solid fa-play"></i> Resume';
    showOverlay('GAME PAUSED', 'Press Resume to continue playing', false);
  } else if (activeGameInstance.isPaused) {
    activeGameInstance.resume();
    document.getElementById('btnStartPause').innerHTML = '<i class="fa-solid fa-pause"></i> Pause';
    hideOverlay();
  } else {
    startNewGameSession();
  }
}

function restartGame() {
  if (activeGameInstance) {
    startNewGameSession();
  }
}

async function handleGameOver(result) {
  document.getElementById('btnStartPause').innerHTML = '<i class="fa-solid fa-play"></i> Start';
  
  const finalScore = result.score || 0;
  const duration = result.duration || 0;
  const subtitle = result.outcomeText || `Game Over! You scored ${finalScore} points.`;

  // Submit score to backend if session exists and not already submitted
  let statusText = '';
  if (currentSessionId && !sessionSubmitted) {
    sessionSubmitted = true;
    try {
      const resp = await API.games.completeSession(currentGameSlug, currentSessionId, {
        score: finalScore,
        durationSeconds: duration
      });
      statusText = resp.isPersonalBest ? '🔥 NEW PERSONAL BEST Persisted to DB!' : '✓ Score persisted to database leaderboard';
      loadPersonalBest(currentGameSlug);
    } catch (err) {
      statusText = `⚠️ Score save: ${err.message}`;
    }
  } else if (!currentSessionId) {
    statusText = '💡 Log in to submit scores to the global leaderboard!';
  }

  const scoreBox = document.getElementById('overlayScoreBox');
  document.getElementById('overlayScoreVal').textContent = finalScore;
  document.getElementById('overlayScoreStatus').textContent = statusText;
  scoreBox.classList.remove('hidden');

  showOverlay('GAME OVER', subtitle, true);
}

function showOverlay(title, subtitle, isGameOver) {
  const overlay = document.getElementById('gameOverlay');
  document.getElementById('overlayTitle').textContent = title;
  document.getElementById('overlaySubtitle').textContent = subtitle;

  const overlayActionBtn = document.getElementById('overlayActionBtn');
  if (isGameOver) {
    overlayActionBtn.innerHTML = '<i class="fa-solid fa-rotate-right"></i> PLAY AGAIN';
  } else if (title === 'GAME PAUSED') {
    overlayActionBtn.innerHTML = '<i class="fa-solid fa-play"></i> RESUME GAME';
  } else {
    overlayActionBtn.innerHTML = '<i class="fa-solid fa-play"></i> START GAME';
    document.getElementById('overlayScoreBox').classList.add('hidden');
  }

  overlay.classList.remove('hidden');
}

function hideOverlay() {
  document.getElementById('gameOverlay').classList.add('hidden');
}

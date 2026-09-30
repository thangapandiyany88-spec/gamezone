/**
 * Dashboard JavaScript Controller
 */

document.addEventListener('DOMContentLoaded', () => {
  if (window.location.pathname.endsWith('dashboard.html')) {
    loadDashboardData();
  }
});

async function loadDashboardData() {
  try {
    // 1. Load User Info
    const user = await API.auth.getCurrentUser();
    document.getElementById('userWelcomeName').textContent = user.fullName.toUpperCase();
    document.getElementById('dashUsername').textContent = user.fullName;
    document.getElementById('dashAvatar').textContent = user.fullName.charAt(0).toUpperCase();

    // 2. Load Stats
    const stats = await API.user.getStats();
    document.getElementById('statTotalGames').textContent = stats.totalGamesPlayed || 0;
    document.getElementById('statTotalPoints').textContent = stats.totalPoints || 0;
    document.getElementById('statPersonalBest').textContent = stats.highestScore || 0;
    document.getElementById('statOverallRank').textContent = stats.overallRank ? `#${stats.overallRank}` : '#--';

    // 3. Load Recent History
    const history = await API.user.getHistory(0, 5);
    renderRecentHistory(history.content || []);
  } catch (err) {
    console.error('Failed to load dashboard statistics:', err);
  }
}

function renderRecentHistory(sessions) {
  const container = document.getElementById('recentHistoryList');
  if (!container) return;

  if (sessions.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 2rem; color: var(--text-muted);">
        <i class="fa-solid fa-gamepad" style="font-size: 2.5rem; margin-bottom: 0.5rem; display: block;"></i>
        <p>No game sessions played yet. Launch a game from the menu!</p>
      </div>
    `;
    return;
  }

  let html = '<div style="display: flex; flex-direction: column; gap: 0.75rem;">';
  sessions.forEach(s => {
    const dateStr = new Date(s.achievedAt || s.completedAt).toLocaleString();
    html += `
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 1rem; background: rgba(10, 13, 28, 0.6); border: 1px solid var(--border-glass); border-radius: var(--radius-sm);">
        <div style="display: flex; align-items: center; gap: 0.85rem;">
          <div style="width: 36px; height: 36px; border-radius: 50%; background: rgba(0, 240, 255, 0.15); display: flex; align-items: center; justify-content: center; color: var(--primary-cyan);">
            <i class="fa-solid ${getGameIcon(s.gameSlug)}"></i>
          </div>
          <div>
            <h4 style="font-size: 0.95rem; color: var(--text-main); font-weight: 600;">${s.gameName}</h4>
            <span style="font-size: 0.75rem; color: var(--text-muted);">${dateStr}</span>
          </div>
        </div>
        <div style="text-align: right;">
          <div style="font-family: var(--font-heading); font-size: 1.1rem; font-weight: 800; color: var(--accent-green);">+${s.score} pts</div>
          <span style="font-size: 0.75rem; color: var(--text-muted);">${s.durationSeconds || 0}s duration</span>
        </div>
      </div>
    `;
  });
  html += '</div>';
  container.innerHTML = html;
}

function getGameIcon(slug) {
  switch (slug) {
    case 'snake': return 'fa-worm';
    case 'car-racing': return 'fa-car';
    case 'tic-tac-toe': return 'fa-xmark';
    case 'memory-match': return 'fa-clone';
    case 'rock-paper-scissors': return 'fa-hand-back-fist';
    default: return 'fa-gamepad';
  }
}

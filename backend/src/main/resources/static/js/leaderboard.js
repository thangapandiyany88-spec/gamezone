/**
 * Leaderboard Controller (Global & Game Specific)
 */

let currentCategory = 'overall';
let currentPage = 0;
const pageSize = 10;
let currentUserId = null;

document.addEventListener('DOMContentLoaded', async () => {
  if (window.location.pathname.endsWith('leaderboard.html')) {
    // Try get logged-in user id for highlighting
    try {
      const user = await API.auth.getCurrentUser();
      if (user) currentUserId = user.id;
    } catch (e) {
      currentUserId = null;
    }

    initLeaderboardTabs();
    initPaginationButtons();
    loadLeaderboardData();
  }
});

function initLeaderboardTabs() {
  const tabs = document.querySelectorAll('#leaderboardTabs .tab-btn');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentCategory = tab.dataset.category;
      currentPage = 0;
      loadLeaderboardData();
    });
  });
}

function initPaginationButtons() {
  const prevBtn = document.getElementById('prevPageBtn');
  const nextBtn = document.getElementById('nextPageBtn');

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (currentPage > 0) {
        currentPage--;
        loadLeaderboardData();
      }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      currentPage++;
      loadLeaderboardData();
    });
  }
}

async function loadLeaderboardData() {
  const tbody = document.getElementById('leaderboardBody');
  const scoreColHeader = document.getElementById('scoreColumnHeader');
  
  if (scoreColHeader) {
    scoreColHeader.textContent = currentCategory === 'overall' ? 'Total Points' : 'Best Score';
  }

  try {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 2rem; color: var(--text-muted);"><i class="fa-solid fa-spinner fa-spin"></i> Loading standings...</td></tr>`;

    let response;
    if (currentCategory === 'overall') {
      response = await API.leaderboard.getOverall(currentPage, pageSize);
    } else {
      response = await API.leaderboard.getByGame(currentCategory, currentPage, pageSize);
    }

    const items = response.content || [];
    const totalPages = response.totalPages || 1;

    renderPodium(items);
    renderTable(items, currentPage * pageSize);
    updatePaginationUI(totalPages);
  } catch (err) {
    console.error('Failed to load leaderboard:', err);
    tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 2rem; color: var(--accent-red);"><i class="fa-solid fa-triangle-exclamation"></i> Error loading rankings: ${err.message}</td></tr>`;
  }
}

function renderPodium(items) {
  const podiumContainer = document.getElementById('podiumContainer');
  if (!podiumContainer) return;

  if (currentPage > 0 || items.length === 0) {
    podiumContainer.style.display = 'none';
    return;
  }

  podiumContainer.style.display = 'flex';
  const top3 = items.slice(0, 3);
  let html = '';

  top3.forEach((item, index) => {
    const rank = index + 1;
    const crownIcons = ['fa-crown', 'fa-award', 'fa-medal'];
    const initials = (item.fullName || item.displayName || 'P').charAt(0).toUpperCase();
    const scoreVal = currentCategory === 'overall' ? item.totalPoints : item.bestScore;

    html += `
      <div class="podium-card rank-${rank}">
        <span class="podium-rank-badge">#${rank}</span>
        <i class="fa-solid ${crownIcons[index]} podium-crown"></i>
        <div class="podium-avatar">${initials}</div>
        <div class="podium-name">${item.fullName || item.displayName}</div>
        <div class="podium-score">${scoreVal || 0} pts</div>
        <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.2rem;">${item.gamesPlayed || 0} games</div>
      </div>
    `;
  });

  podiumContainer.innerHTML = html;
}

function renderTable(items, startRank) {
  const tbody = document.getElementById('leaderboardBody');
  if (!tbody) return;

  if (items.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 2rem; color: var(--text-muted);">No entries found for this leaderboard category yet.</td></tr>`;
    return;
  }

  let html = '';
  items.forEach((item, index) => {
    const rank = startRank + index + 1;
    const isCurrentUser = currentUserId && item.userId === currentUserId;
    const rankClass = rank === 1 ? 'gold' : rank === 2 ? 'silver' : rank === 3 ? 'bronze' : '';
    const scoreVal = currentCategory === 'overall' ? item.totalPoints : item.bestScore;
    const dateStr = item.achievedAt ? new Date(item.achievedAt).toLocaleDateString() : 'N/A';

    html += `
      <tr class="${isCurrentUser ? 'current-user-row' : ''}">
        <td><span class="rank-pill ${rankClass}">#${rank}</span></td>
        <td>
          <div class="player-info-cell">
            <div class="avatar" style="width:28px; height:28px; font-size: 0.75rem;">${(item.fullName || item.displayName || 'P').charAt(0).toUpperCase()}</div>
            <span style="font-weight: 600; color: ${isCurrentUser ? 'var(--primary-cyan)' : 'var(--text-main)'}">
              ${item.fullName || item.displayName} ${isCurrentUser ? '(You)' : ''}
            </span>
          </div>
        </td>
        <td style="font-family: var(--font-heading); font-weight: 800; color: var(--accent-green);">${scoreVal || 0}</td>
        <td>${item.gamesPlayed || 0}</td>
        <td style="color: var(--text-muted); font-size: 0.85rem;">${dateStr}</td>
      </tr>
    `;
  });

  tbody.innerHTML = html;
}

function updatePaginationUI(totalPages) {
  const prevBtn = document.getElementById('prevPageBtn');
  const nextBtn = document.getElementById('nextPageBtn');
  const pageInfo = document.getElementById('pageInfo');

  if (pageInfo) pageInfo.textContent = `Page ${currentPage + 1} of ${totalPages}`;
  if (prevBtn) prevBtn.disabled = currentPage === 0;
  if (nextBtn) nextBtn.disabled = currentPage >= totalPages - 1;
}

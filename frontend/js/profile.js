/**
 * User Profile & History Page Controller
 */

document.addEventListener('DOMContentLoaded', () => {
  if (window.location.pathname.endsWith('profile.html')) {
    loadProfileDetails();
    initEditProfile();
  }
});

async function loadProfileDetails() {
  try {
    // 1. Load User account info
    const user = await API.user.getProfile();
    document.getElementById('profileFullName').textContent = user.fullName;
    document.getElementById('profileEmail').textContent = user.email;
    document.getElementById('profileAvatar').textContent = user.fullName.charAt(0).toUpperCase();
    if (user.createdAt) {
      const d = new Date(user.createdAt);
      document.getElementById('profileJoinedDate').textContent = `${d.toLocaleString('default', { month: 'short' })} ${d.getFullYear()}`;
    }

    // Populate edit form default value
    document.getElementById('newFullName').value = user.fullName;

    // 2. Load User Stats
    const stats = await API.user.getStats();
    document.getElementById('profileGamesPlayed').textContent = stats.totalGamesPlayed || 0;
    document.getElementById('profileTotalPoints').textContent = stats.totalPoints || 0;
    document.getElementById('profileHighestScore').textContent = stats.highestScore || 0;
    document.getElementById('profileRank').textContent = stats.overallRank ? `#${stats.overallRank}` : '#--';

    // Personal Bests Grid
    renderPersonalBests(stats.gameBests || []);

    // 3. Load Full Session History
    const history = await API.user.getHistory(0, 20);
    renderFullHistory(history.content || []);
  } catch (err) {
    console.error('Error loading profile page:', err);
  }
}

function renderPersonalBests(bests) {
  const container = document.getElementById('gameBestsGrid');
  if (!container) return;

  const games = [
    { slug: 'snake', name: 'Snake', icon: 'fa-worm' },
    { slug: 'car-racing', name: '2D Car Racing', icon: 'fa-car' },
    { slug: 'tic-tac-toe', name: 'Tic-Tac-Toe', icon: 'fa-xmark' },
    { slug: 'memory-match', name: 'Memory Match', icon: 'fa-clone' },
    { slug: 'rock-paper-scissors', name: 'Rock-Paper-Scissors', icon: 'fa-hand-back-fist' }
  ];

  let html = '';
  games.forEach(g => {
    const found = bests.find(b => b.gameSlug === g.slug);
    const score = found ? found.bestScore : 0;

    html += `
      <div style="background: rgba(10, 13, 28, 0.7); border: 1px solid var(--border-glass); padding: 0.85rem; border-radius: var(--radius-sm); display: flex; align-items: center; gap: 0.75rem;">
        <i class="fa-solid ${g.icon}" style="font-size: 1.4rem; color: var(--primary-cyan);"></i>
        <div>
          <div style="font-size: 0.8rem; color: var(--text-muted);">${g.name}</div>
          <div style="font-family: var(--font-heading); font-size: 1.1rem; font-weight: 800; color: var(--accent-green);">${score} pts</div>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

function renderFullHistory(sessions) {
  const tbody = document.getElementById('fullHistoryBody');
  if (!tbody) return;

  if (sessions.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; padding: 1.5rem; color: var(--text-muted);">No game session history yet. Go play some games!</td></tr>`;
    return;
  }

  let html = '';
  sessions.forEach(s => {
    const dateStr = new Date(s.achievedAt || s.completedAt).toLocaleString();
    html += `
      <tr>
        <td style="font-weight: 600; color: var(--text-main);"><i class="fa-solid ${getGameIcon(s.gameSlug)}" style="color: var(--primary-cyan); margin-right: 0.4rem;"></i> ${s.gameName}</td>
        <td style="font-family: var(--font-heading); font-weight: 800; color: var(--accent-green);">${s.score}</td>
        <td>${s.durationSeconds || 0}s</td>
        <td style="color: var(--text-muted);">${dateStr}</td>
      </tr>
    `;
  });

  tbody.innerHTML = html;
}

function initEditProfile() {
  const btnEdit = document.getElementById('btnEditProfile');
  const editCard = document.getElementById('editProfileCard');
  const btnCancel = document.getElementById('btnCancelEdit');
  const form = document.getElementById('editProfileForm');

  if (btnEdit && editCard) {
    btnEdit.addEventListener('click', () => {
      editCard.style.display = 'block';
    });
  }

  if (btnCancel && editCard) {
    btnCancel.addEventListener('click', () => {
      editCard.style.display = 'none';
    });
  }

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const newFullName = document.getElementById('newFullName').value.trim();
      const alertBox = document.getElementById('profileAlert');

      if (!newFullName || newFullName.length < 2) {
        alertBox.innerHTML = `<div class="alert alert-danger">Display name must be at least 2 characters</div>`;
        return;
      }

      try {
        const updated = await API.user.updateProfile({ fullName: newFullName });
        alertBox.innerHTML = `<div class="alert alert-success">Profile updated successfully!</div>`;
        
        // Update UI
        document.getElementById('profileFullName').textContent = updated.fullName;
        document.getElementById('profileAvatar').textContent = updated.fullName.charAt(0).toUpperCase();
        document.getElementById('navUsername').textContent = updated.fullName;
        document.getElementById('navAvatar').textContent = updated.fullName.charAt(0).toUpperCase();

        setTimeout(() => {
          editCard.style.display = 'none';
          alertBox.innerHTML = '';
        }, 1200);
      } catch (err) {
        alertBox.innerHTML = `<div class="alert alert-danger">${err.message || 'Update failed'}</div>`;
      }
    });
  }
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

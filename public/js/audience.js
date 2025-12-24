// The Floor: Christmas Edition - Audience View

const socket = io();

// State
let roomCode = null;
let gameState = null;

// Character emoji mapping
const CHARACTER_EMOJIS = {
    'santa': '🎅', 'elf': '🧝', 'reindeer': '🦌', 'snowman': '⛄', 'gingerbread': '🍪',
    'angel': '👼', 'penguin': '🐧', 'polar-bear': '🐻‍❄️', 'nutcracker': '🪖', 'mrs-claus': '🤶',
    'candy-cane': '🍬', 'christmas-tree': '🎄', 'star': '⭐', 'present': '🎁', 'stocking': '🧦',
    'wreath': '🎀', 'bell': '🔔', 'candle': '🕯️', 'sleigh': '🛷', 'igloo': '🏠',
    'grinch': '👹', 'rudolph': '🔴', 'frosty': '☃️', 'jack-frost': '❄️'
};

// Get room code from URL
const urlParams = new URLSearchParams(window.location.search);
roomCode = urlParams.get('room');

// DOM Elements
const screens = {
    join: document.getElementById('join-screen'),
    watching: document.getElementById('watching-screen'),
    victory: document.getElementById('victory-screen')
};

// Show specific screen
function showScreen(name) {
    Object.values(screens).forEach(screen => screen.classList.remove('active'));
    if (screens[name]) {
        screens[name].classList.add('active');
    }
}

// Get character emoji
function getCharacterEmoji(character) {
    return CHARACTER_EMOJIS[character] || '❓';
}

// Player colors
function getPlayerColor(index) {
    const colors = [
        '#c41e3a', '#2e8b57', '#ffd700', '#4169e1',
        '#ff6b35', '#9932cc', '#00ced1', '#ff69b4',
        '#32cd32', '#ff4500', '#1e90ff', '#ffa500'
    ];
    return colors[index % colors.length];
}

// Join button
document.getElementById('join-btn').addEventListener('click', () => {
    const name = document.getElementById('name-input').value.trim() || 'Spectator';

    if (!roomCode) {
        showError('No room code provided');
        return;
    }

    socket.emit('join-room', { roomCode, playerName: name }, (response) => {
        if (response.success) {
            showScreen('watching');
        } else {
            showError(response.error);
        }
    });
});

// Show error
function showError(message) {
    const errorEl = document.getElementById('join-error');
    errorEl.textContent = message;
    errorEl.classList.remove('hidden');
}

// Render mini floor grid
function renderMiniGrid(grid, gridSize, players) {
    const container = document.getElementById('mini-grid');
    container.style.gridTemplateColumns = `repeat(${gridSize.cols}, 1fr)`;
    container.innerHTML = '';

    for (let row = 0; row < gridSize.rows; row++) {
        for (let col = 0; col < gridSize.cols; col++) {
            const tile = grid[row][col];
            const playerIndex = players.findIndex(p => p.id === tile.ownerId);

            const tileEl = document.createElement('div');
            tileEl.className = 'mini-tile';
            tileEl.style.background = playerIndex >= 0 ? getPlayerColor(playerIndex) : '#333';
            tileEl.textContent = getCharacterEmoji(tile.character);

            container.appendChild(tileEl);
        }
    }
}

// Add answer to feed
function addAnswerToFeed(playerName, answer, correct = null) {
    const feed = document.getElementById('answer-feed');
    const item = document.createElement('div');
    item.className = 'answer-item';

    let resultHtml = '';
    if (correct !== null) {
        resultHtml = `<div class="answer-result ${correct ? 'correct' : 'incorrect'}">${correct ? '✓ Correct' : '✗ Wrong'}</div>`;
    }

    item.innerHTML = `
        <span class="answer-player">${playerName}:</span>
        <span class="answer-text">"${answer}"</span>
        ${resultHtml}
    `;

    feed.insertBefore(item, feed.firstChild);

    // Keep only last 20 answers
    while (feed.children.length > 20) {
        feed.removeChild(feed.lastChild);
    }
}

// Socket Events

socket.on('game-started', (data) => {
    gameState = data;
    renderMiniGrid(data.grid, data.gridSize, data.players);
    document.getElementById('battle-status-text').textContent = 'Game started! Waiting for first battle...';
});

socket.on('battle-start', ({ challenger, defender, category }) => {
    document.getElementById('battle-status-text').textContent = `Battle: ${category}`;
    document.getElementById('battle-players').innerHTML = `
        <div class="battle-player-mini">
            <div class="avatar">${getCharacterEmoji(challenger.character)}</div>
            <div>${challenger.name}</div>
        </div>
        <div>⚔️</div>
        <div class="battle-player-mini">
            <div class="avatar">${getCharacterEmoji(defender.character)}</div>
            <div>${defender.name}</div>
        </div>
    `;
});

socket.on('buzz-received', ({ playerName, answer }) => {
    addAnswerToFeed(playerName, answer);
});

socket.on('answer-confirmed', ({ correct }) => {
    // Update the most recent answer
    const feed = document.getElementById('answer-feed');
    const firstItem = feed.firstChild;
    if (firstItem) {
        const existingResult = firstItem.querySelector('.answer-result');
        if (!existingResult) {
            const resultEl = document.createElement('div');
            resultEl.className = `answer-result ${correct ? 'correct' : 'incorrect'}`;
            resultEl.textContent = correct ? '✓ Correct' : '✗ Wrong';
            firstItem.appendChild(resultEl);
        }
    }
});

socket.on('battle-end', ({ winnerId, winnerName, loserName, grid, players, gameOver }) => {
    if (gameState) {
        gameState.grid = grid;
        gameState.players = players;
        renderMiniGrid(grid, gameState.gridSize, players);
    }

    if (gameOver) {
        document.getElementById('winner-name').textContent = winnerName;
        showScreen('victory');
    } else {
        document.getElementById('battle-status-text').textContent = `${winnerName} defeated ${loserName}!`;
        document.getElementById('battle-players').innerHTML = '';
    }
});

socket.on('game-over', ({ winner }) => {
    document.getElementById('winner-name').textContent = winner.name;
    showScreen('victory');
});

socket.on('host-disconnected', () => {
    alert('Host disconnected! The game has ended.');
    window.location.href = '/';
});

// Initialize
console.log('Audience view initialized, room:', roomCode);

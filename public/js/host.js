// The Floor: Christmas Edition - Host Display (TV Screen)

const socket = io();

// Handle socket reconnection - rejoin room if we were in one
socket.on('connect', () => {
    console.log('Display socket connected');
    if (roomCode) {
        console.log('Rejoining room after reconnect:', roomCode);
        socket.emit('join-as-display', { roomCode }, (response) => {
            if (response.success) {
                console.log('Rejoined room as display');
            } else {
                console.error('Failed to rejoin room:', response.error);
            }
        });
    }
});

// Character emoji mapping (placeholder until custom images)
const CHARACTER_EMOJIS = {
    'santa': '🎅', 'elf': '🧝', 'reindeer': '🦌', 'snowman': '⛄', 'gingerbread': '🍪',
    'angel': '👼', 'penguin': '🐧', 'polar-bear': '🐻‍❄️', 'nutcracker': '🪖', 'mrs-claus': '🤶',
    'candy-cane': '🍬', 'christmas-tree': '🎄', 'star': '⭐', 'present': '🎁', 'stocking': '🧦',
    'wreath': '🎀', 'bell': '🔔', 'candle': '🕯️', 'sleigh': '🛷', 'igloo': '🏠',
    'grinch': '👹', 'rudolph': '🔴', 'frosty': '☃️', 'jack-frost': '❄️'
};

// State
let roomCode = null;
let players = [];
let gameState = null;
let questionUpdateTimeout = null; // Track pending question updates to cancel on new battle

// DOM Elements
const screens = {
    waiting: document.getElementById('waiting-screen'),
    lobby: document.getElementById('lobby-screen'),
    game: document.getElementById('game-screen'),
    battle: document.getElementById('battle-screen'),
    victory: document.getElementById('victory-screen')
};

// Get room code from URL
const urlParams = new URLSearchParams(window.location.search);
roomCode = urlParams.get('room');

if (roomCode) {
    document.getElementById('room-code').textContent = roomCode;
    document.getElementById('join-url').textContent = window.location.origin;
    showScreen('lobby');

    // Join the room as a display so we receive updates
    socket.emit('join-as-display', { roomCode }, (response) => {
        if (response.success) {
            console.log('Joined room as display');
            // Sync existing players
            if (response.players) {
                players = response.players;
                updatePlayerCount(players.length);
                renderLobbyPlayers();
            }
            // Sync game state if game already started
            if (response.gameState) {
                gameState = response.gameState;
                players = response.gameState.players;
                showScreen('game');
                renderFloorGrid(response.gameState.grid, response.gameState.gridSize);
            }
        } else {
            console.error('Failed to join room:', response.error);
        }
    });
}

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

// Update player count
function updatePlayerCount(count) {
    document.getElementById('player-count').textContent = `${count} Player${count !== 1 ? 's' : ''}`;
}

// Render lobby players
function renderLobbyPlayers() {
    const container = document.getElementById('lobby-players');
    container.innerHTML = players.map(player => `
        <div class="lobby-player ${player.ready ? '' : 'waiting'}">
            <div class="lobby-player-avatar">${getCharacterEmoji(player.character)}</div>
            <div class="lobby-player-name">${player.name}</div>
            <div class="lobby-player-category">${player.ready ? (player.categoryName || player.category) : 'Choosing...'}</div>
        </div>
    `).join('');
}

// Render floor grid
function renderFloorGrid(grid, gridSize, highlightedTiles = []) {
    const container = document.getElementById('floor-grid');
    container.style.gridTemplateColumns = `repeat(${gridSize.cols}, 1fr)`;
    container.innerHTML = '';

    for (let row = 0; row < gridSize.rows; row++) {
        for (let col = 0; col < gridSize.cols; col++) {
            const tile = grid[row][col];
            const player = gameState?.players?.find(p => p.id === tile.ownerId);
            const isHighlighted = highlightedTiles.some(t => t.row === row && t.col === col);

            const tileEl = document.createElement('div');
            tileEl.className = `floor-tile ${isHighlighted ? 'highlighted' : ''}`;
            tileEl.style.background = player ? getPlayerColor(gameState.players.indexOf(player)) : '#333';

            tileEl.innerHTML = `
                <div class="tile-character">${getCharacterEmoji(tile.character)}</div>
                <div class="tile-category">${tile.category}</div>
            `;

            container.appendChild(tileEl);
        }
    }
}

// Get player color
function getPlayerColor(index) {
    const colors = [
        '#c41e3a', '#2e8b57', '#ffd700', '#4169e1',
        '#ff6b35', '#9932cc', '#00ced1', '#ff69b4',
        '#32cd32', '#ff4500', '#1e90ff', '#ffa500'
    ];
    return colors[index % colors.length];
}

// Check if a string is an image URL
function isImageUrl(str) {
    if (!str) return false;
    const lowerStr = str.toLowerCase();
    return (lowerStr.startsWith('http://') || lowerStr.startsWith('https://')) &&
           (lowerStr.endsWith('.jpg') || lowerStr.endsWith('.jpeg') ||
            lowerStr.endsWith('.png') || lowerStr.endsWith('.gif') ||
            lowerStr.endsWith('.webp'));
}

// Format question as text or image
function formatQuestion(question) {
    if (isImageUrl(question)) {
        return `<img src="${question}" class="slide-image" alt="Question image">`;
    }
    return question;
}

// Show buzz notification
function showBuzzNotification(playerName, answer) {
    const notification = document.getElementById('buzz-notification');
    notification.innerHTML = `<div>${playerName}</div><div style="font-size: 1rem; margin-top: 0.5rem;">"${answer}"</div>`;
    notification.classList.remove('hidden');

    setTimeout(() => {
        notification.classList.add('hidden');
    }, 2000);
}

// Update battle timers
function updateBattleTimers(challengerTime, defenderTime, activePlayer, battle) {
    const challengerPercent = (challengerTime / 45000) * 100;
    const defenderPercent = (defenderTime / 45000) * 100;

    document.getElementById('challenger-timer-fill').style.width = `${challengerPercent}%`;
    document.getElementById('defender-timer-fill').style.width = `${defenderPercent}%`;

    document.getElementById('challenger-timer-label').textContent =
        `${battle.challengerName}: ${(challengerTime / 1000).toFixed(1)}s`;
    document.getElementById('defender-timer-label').textContent =
        `${battle.defenderName}: ${(defenderTime / 1000).toFixed(1)}s`;

    // Highlight active player
    const challengerWrapper = document.getElementById('challenger-timer-wrapper');
    const defenderWrapper = document.getElementById('defender-timer-wrapper');

    if (activePlayer === battle.challengerId) {
        challengerWrapper.classList.add('active');
        defenderWrapper.classList.remove('active');
        document.getElementById('challenger-display').classList.add('active');
        document.getElementById('defender-display').classList.remove('active');
    } else {
        defenderWrapper.classList.add('active');
        challengerWrapper.classList.remove('active');
        document.getElementById('defender-display').classList.add('active');
        document.getElementById('challenger-display').classList.remove('active');
    }
}

// Create confetti
function createConfetti() {
    const container = document.getElementById('confetti');
    container.innerHTML = '';

    const colors = ['#c41e3a', '#2e8b57', '#ffd700', '#fff', '#ff6b35'];

    for (let i = 0; i < 100; i++) {
        const piece = document.createElement('div');
        piece.className = 'confetti-piece';
        piece.style.left = `${Math.random() * 100}%`;
        piece.style.background = colors[Math.floor(Math.random() * colors.length)];
        piece.style.animationDelay = `${Math.random() * 2}s`;
        piece.style.animationDuration = `${2 + Math.random() * 2}s`;
        container.appendChild(piece);
    }
}

// Socket Events

socket.on('room-created', ({ roomCode: code }) => {
    roomCode = code;
    document.getElementById('room-code').textContent = code;
    document.getElementById('join-url').textContent = window.location.origin;
    showScreen('lobby');
});

socket.on('player-joined', ({ player, playerCount }) => {
    players.push(player);
    updatePlayerCount(playerCount);
    renderLobbyPlayers();
});

socket.on('character-selected', ({ playerId, character }) => {
    const player = players.find(p => p.id === playerId);
    if (player) {
        player.character = character;
        renderLobbyPlayers();
    }
});

socket.on('player-ready', ({ playerId, playerName, category, readyCount, totalPlayers }) => {
    const player = players.find(p => p.id === playerId);
    if (player) {
        player.category = category;
        player.ready = true;
        renderLobbyPlayers();
    }
});

socket.on('player-disconnected', ({ playerId, playerName }) => {
    players = players.filter(p => p.id !== playerId);
    updatePlayerCount(players.length);
    renderLobbyPlayers();
});

socket.on('game-started', (data) => {
    gameState = data;
    players = data.players;
    showScreen('game');
    renderFloorGrid(data.grid, data.gridSize);
    document.getElementById('game-status').textContent =
        `${data.challengerName} is selecting an opponent...`;
});

socket.on('select-opponent', ({ challengerName, availableOpponents }) => {
    document.getElementById('game-status').textContent =
        `${challengerName} is selecting an opponent to challenge...`;
});

socket.on('new-challenger', ({ challengerName }) => {
    document.getElementById('game-status').textContent =
        `New challenger: ${challengerName} - Selecting opponent...`;
});

socket.on('battle-start', ({ challenger, defender, category, categoryIcon, question, questionNumber, totalQuestions }) => {
    // Clear any pending question update from previous battle
    if (questionUpdateTimeout) {
        clearTimeout(questionUpdateTimeout);
        questionUpdateTimeout = null;
    }

    showScreen('battle');

    document.getElementById('challenger-avatar').textContent = getCharacterEmoji(challenger.character);
    document.getElementById('challenger-name').textContent = challenger.name;
    document.getElementById('defender-avatar').textContent = getCharacterEmoji(defender.character);
    document.getElementById('defender-name').textContent = defender.name;
    document.getElementById('battle-category').textContent = `${categoryIcon} ${category}`;

    // Show the first question
    document.getElementById('slide-content').innerHTML = `
        <div class="question-number">Question ${questionNumber} of ${totalQuestions}</div>
        <div class="question-text">${formatQuestion(question)}</div>
    `;

    // Reset timers
    document.getElementById('challenger-timer-fill').style.width = '100%';
    document.getElementById('defender-timer-fill').style.width = '100%';

    // Store battle info for timer updates
    gameState.currentBattle = { challengerId: challenger.id, defenderId: defender.id,
        challengerName: challenger.name, defenderName: defender.name };
});

socket.on('timer-update', ({ challengerTime, defenderTime, activePlayer }) => {
    if (gameState.currentBattle) {
        updateBattleTimers(challengerTime, defenderTime, activePlayer, gameState.currentBattle);
    }
});

socket.on('buzz-received', ({ playerName, answer }) => {
    console.log('Buzz received on display:', playerName, answer);
    showBuzzNotification(playerName, answer);
});

socket.on('answer-confirmed', ({ correct, playerId, newTime, question, questionNumber, totalQuestions }) => {
    if (!correct && question) {
        // Wrong answer - show "WRONG!" briefly, then new question
        document.getElementById('slide-content').innerHTML =
            `<div style="color: #e74c3c; font-size: 3rem;">WRONG!</div><div style="font-size: 1.2rem; margin-top: 1rem;">New question coming...</div>`;

        // Clear any previous timeout and track this one (so it can be cancelled if battle ends)
        if (questionUpdateTimeout) clearTimeout(questionUpdateTimeout);
        questionUpdateTimeout = setTimeout(() => {
            document.getElementById('slide-content').innerHTML = `
                <div class="question-number">Question ${questionNumber} of ${totalQuestions}</div>
                <div class="question-text">${formatQuestion(question)}</div>
            `;
            questionUpdateTimeout = null;
        }, 1500);
    }
});

socket.on('turn-switched', ({ activePlayer, slideNumber, question, questionNumber, totalQuestions }) => {
    document.getElementById('slide-content').innerHTML = `
        <div class="question-number">Question ${questionNumber} of ${totalQuestions}</div>
        <div class="question-text">${formatQuestion(question)}</div>
    `;
});

socket.on('player-passed', ({ passCount, challengerTime, defenderTime, question, questionNumber, totalQuestions }) => {
    // Show PASS notification briefly
    document.getElementById('slide-content').innerHTML =
        `<div>PASS!</div><div style="font-size: 1rem; margin-top: 1rem;">-3 seconds penalty</div>`;

    // Update timer displays immediately
    if (gameState.currentBattle) {
        updateBattleTimers(challengerTime, defenderTime, gameState.currentBattle.challengerId, gameState.currentBattle);
    }

    // Clear any previous timeout and track this one (so it can be cancelled if battle ends)
    if (questionUpdateTimeout) clearTimeout(questionUpdateTimeout);
    questionUpdateTimeout = setTimeout(() => {
        document.getElementById('slide-content').innerHTML = `
            <div class="question-number">Question ${questionNumber} of ${totalQuestions}</div>
            <div class="question-text">${formatQuestion(question)}</div>
        `;
        questionUpdateTimeout = null;
    }, 1500);
});

socket.on('slide-advanced', ({ slideNumber, question, questionNumber, totalQuestions }) => {
    document.getElementById('slide-content').innerHTML = `
        <div class="question-number">Question ${questionNumber} of ${totalQuestions}</div>
        <div class="question-text">${formatQuestion(question)}</div>
    `;
});

socket.on('battle-end', ({ winnerId, winnerName, loserName, grid, players: updatedPlayers, gameOver }) => {
    gameState.players = updatedPlayers;
    gameState.grid = grid;

    if (gameOver) {
        document.getElementById('winner-display').textContent = winnerName;
        showScreen('victory');
        createConfetti();
    } else {
        showScreen('game');
        renderFloorGrid(grid, gameState.gridSize);
        document.getElementById('game-status').innerHTML =
            `<strong>${winnerName}</strong> defeated <strong>${loserName}</strong>! Waiting for next move...`;
    }
});

socket.on('game-over', ({ winner }) => {
    document.getElementById('winner-display').textContent = winner.name;
    showScreen('victory');
    createConfetti();
});

socket.on('host-disconnected', () => {
    alert('Host disconnected! The game has ended.');
    window.location.href = '/';
});

// Initialize
console.log('Host display initialized');

// The Floor: Christmas Edition - Host Controller

const socket = io();

// State
let roomCode = null;

// Handle socket reconnection - rejoin room if we were in one
socket.on('connect', () => {
    console.log('Socket connected');
    if (roomCode) {
        console.log('Rejoining room after reconnect:', roomCode);
        socket.emit('rejoin-as-host', { roomCode }, (response) => {
            if (response.success) {
                console.log('Rejoined room as host');
            } else {
                console.error('Failed to rejoin room:', response.error);
            }
        });
    }
});
let players = [];
let currentBattle = null;
let lastWinnerId = null;

// DOM Elements
const screens = {
    create: document.getElementById('create-screen'),
    lobby: document.getElementById('lobby-screen'),
    game: document.getElementById('game-screen'),
    battle: document.getElementById('battle-screen'),
    postBattle: document.getElementById('post-battle-screen'),
    victory: document.getElementById('victory-screen')
};

// Show specific screen
function showScreen(name) {
    Object.values(screens).forEach(screen => screen.classList.remove('active'));
    if (screens[name]) {
        screens[name].classList.add('active');
    }
}

// Create room
document.getElementById('create-room-btn').addEventListener('click', () => {
    socket.emit('create-room', (response) => {
        if (response.success) {
            roomCode = response.roomCode;
            document.getElementById('room-code').textContent = roomCode;

            const tvLink = `${window.location.origin}/host?room=${roomCode}`;
            const tvLinkEl = document.getElementById('tv-link');
            tvLinkEl.href = tvLink;
            tvLinkEl.textContent = tvLink;

            showScreen('lobby');
        } else {
            alert('Failed to create room: ' + response.error);
        }
    });
});

// Start game
document.getElementById('start-game-btn').addEventListener('click', () => {
    socket.emit('start-game', (response) => {
        if (!response.success) {
            const errorEl = document.getElementById('start-error');
            errorEl.textContent = response.error;
            errorEl.classList.remove('hidden');
        }
    });
});

// Battle controls
document.getElementById('correct-btn').addEventListener('click', () => {
    socket.emit('confirm-answer', { correct: true });
    document.getElementById('waiting-for-buzz').classList.remove('hidden');
    document.getElementById('waiting-for-buzz').textContent = 'Answer confirmed! Player can hit timer...';
    document.getElementById('current-answer').textContent = 'Waiting for buzz...';
});

document.getElementById('incorrect-btn').addEventListener('click', () => {
    socket.emit('confirm-answer', { correct: false });
    document.getElementById('waiting-for-buzz').classList.remove('hidden');
    document.getElementById('waiting-for-buzz').textContent = 'Wrong! New question...';
    document.getElementById('current-answer').textContent = 'Waiting for buzz...';
});

document.getElementById('next-slide-btn').addEventListener('click', () => {
    socket.emit('next-slide');
});

// Post-battle controls
document.getElementById('challenge-again-btn').addEventListener('click', () => {
    socket.emit('challenge-decision', { challengeAgain: true, winnerId: lastWinnerId });
    showScreen('game');
});

document.getElementById('pass-turn-btn').addEventListener('click', () => {
    socket.emit('challenge-decision', { challengeAgain: false, winnerId: lastWinnerId });
    showScreen('game');
});

// New game
document.getElementById('new-game-btn').addEventListener('click', () => {
    window.location.reload();
});

// Render player list
function renderPlayerList() {
    const list = document.getElementById('player-list');
    const readyCount = players.filter(p => p.ready).length;

    document.getElementById('ready-count').textContent = `${readyCount}/${players.length} Ready`;

    list.innerHTML = players.map(player => `
        <li class="player-item">
            <div class="player-avatar">${getCharacterEmoji(player.character)}</div>
            <div class="player-name">${player.name}</div>
            <div class="player-status ${player.ready ? 'ready' : ''}">${player.ready ? '✓ Ready' : 'Choosing...'}</div>
        </li>
    `).join('');

    // Enable start button if at least 2 players ready
    document.getElementById('start-game-btn').disabled = readyCount < 2;
}

// Character emoji mapping
function getCharacterEmoji(character) {
    const emojis = {
        'santa': '🎅', 'elf': '🧝', 'reindeer': '🦌', 'snowman': '⛄', 'gingerbread': '🍪',
        'angel': '👼', 'penguin': '🐧', 'polar-bear': '🐻‍❄️', 'nutcracker': '🪖', 'mrs-claus': '🤶',
        'candy-cane': '🍬', 'christmas-tree': '🎄', 'star': '⭐', 'present': '🎁', 'stocking': '🧦',
        'wreath': '🎀', 'bell': '🔔', 'candle': '🕯️', 'sleigh': '🛷', 'igloo': '🏠',
        'grinch': '👹', 'rudolph': '🔴', 'frosty': '☃️', 'jack-frost': '❄️'
    };
    return emojis[character] || '❓';
}

// Socket Events

socket.on('player-joined', ({ player, playerCount }) => {
    players.push({ ...player, character: null, category: null, ready: false });
    renderPlayerList();
});

socket.on('character-selected', ({ playerId, character }) => {
    const player = players.find(p => p.id === playerId);
    if (player) {
        player.character = character;
        renderPlayerList();
    }
});

socket.on('player-ready', ({ playerId, category }) => {
    const player = players.find(p => p.id === playerId);
    if (player) {
        player.category = category;
        player.ready = true;
        renderPlayerList();
    }
});

socket.on('player-disconnected', ({ playerId }) => {
    players = players.filter(p => p.id !== playerId);
    renderPlayerList();
});

socket.on('game-started', ({ challengerName }) => {
    showScreen('game');
    document.getElementById('turn-status').textContent = `${challengerName} is selecting an opponent...`;
});

socket.on('select-opponent', ({ challengerName }) => {
    document.getElementById('turn-status').textContent = `${challengerName} is selecting an opponent...`;
});

socket.on('new-challenger', ({ challengerName }) => {
    document.getElementById('turn-status').textContent = `New challenger: ${challengerName}`;
});

socket.on('battle-start', ({ challenger, defender, category, correctAnswer }) => {
    currentBattle = { challenger, defender, category };

    document.getElementById('battle-challenger').textContent = challenger.name;
    document.getElementById('battle-defender').textContent = defender.name;
    document.getElementById('battle-category-display').textContent = category;

    document.getElementById('timer-challenger-name').textContent = challenger.name;
    document.getElementById('timer-defender-name').textContent = defender.name;

    // Show correct answer immediately, but indicate waiting for player's answer
    document.getElementById('waiting-for-buzz').classList.remove('hidden');
    document.getElementById('waiting-for-buzz').textContent = 'Waiting for player to buzz in...';
    document.getElementById('answer-section').classList.remove('hidden');
    document.getElementById('current-answer').textContent = 'Waiting for buzz...';
    document.getElementById('correct-answer-text').textContent = correctAnswer;

    showScreen('battle');
});

socket.on('timer-update', ({ challengerTime, defenderTime, activePlayer }) => {
    document.getElementById('timer-challenger-value').textContent = (challengerTime / 1000).toFixed(1);
    document.getElementById('timer-defender-value').textContent = (defenderTime / 1000).toFixed(1);

    const challengerEl = document.getElementById('timer-challenger');
    const defenderEl = document.getElementById('timer-defender');

    if (currentBattle) {
        if (activePlayer === currentBattle.challenger.id) {
            challengerEl.classList.add('active');
            defenderEl.classList.remove('active');
        } else {
            defenderEl.classList.add('active');
            challengerEl.classList.remove('active');
        }
    }
});

socket.on('buzz-received', ({ playerName, answer, correctAnswer }) => {
    console.log('Buzz received:', playerName, answer, 'Correct:', correctAnswer);
    document.getElementById('waiting-for-buzz').classList.add('hidden');
    document.getElementById('answer-section').classList.remove('hidden');
    document.getElementById('current-answer').textContent = `${playerName}: "${answer}"`;
    document.getElementById('correct-answer-text').textContent = correctAnswer;
});

socket.on('turn-switched', ({ correctAnswer }) => {
    document.getElementById('waiting-for-buzz').classList.remove('hidden');
    document.getElementById('waiting-for-buzz').textContent = 'Turn switched! Waiting for next buzz...';
    document.getElementById('current-answer').textContent = 'Waiting for buzz...';
    document.getElementById('correct-answer-text').textContent = correctAnswer;
});

socket.on('player-passed', ({ passCount, challengerTime, defenderTime, question, questionNumber, totalQuestions, correctAnswer }) => {
    document.getElementById('waiting-for-buzz').textContent = 'Player passed! -3 seconds penalty, new question...';

    // Update timer displays immediately
    document.getElementById('timer-challenger-value').textContent = (challengerTime / 1000).toFixed(1);
    document.getElementById('timer-defender-value').textContent = (defenderTime / 1000).toFixed(1);

    // Update correct answer for new question
    document.getElementById('current-answer').textContent = 'Waiting for buzz...';
    document.getElementById('correct-answer-text').textContent = correctAnswer;
});

socket.on('answer-confirmed', ({ correct, correctAnswer }) => {
    // When answer is incorrect, update to show new question's correct answer
    if (!correct && correctAnswer) {
        document.getElementById('current-answer').textContent = 'Waiting for buzz...';
        document.getElementById('correct-answer-text').textContent = correctAnswer;
    }
});

socket.on('slide-advanced', ({ correctAnswer }) => {
    // Update correct answer when host manually advances slide
    document.getElementById('current-answer').textContent = 'Waiting for buzz...';
    document.getElementById('correct-answer-text').textContent = correctAnswer;
});

socket.on('battle-end', ({ winnerId, winnerName, loserName, gameOver }) => {
    lastWinnerId = winnerId;

    if (gameOver) {
        document.getElementById('winner-name').textContent = winnerName;
        showScreen('victory');
    } else {
        document.getElementById('battle-result-title').textContent = `${winnerName} Wins!`;
        document.getElementById('battle-result-message').textContent =
            `${winnerName} defeated ${loserName} and takes their territory!`;
        showScreen('postBattle');
    }
});

socket.on('game-over', ({ winner }) => {
    document.getElementById('winner-name').textContent = winner.name;
    showScreen('victory');
});

// Initialize
console.log('Host controller initialized');

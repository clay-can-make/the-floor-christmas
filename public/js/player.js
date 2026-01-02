// The Floor: Christmas Edition - Player View

const socket = io();

// Generate or retrieve a persistent device ID
function getDeviceId() {
    let deviceId = localStorage.getItem('floor_device_id');
    if (!deviceId) {
        deviceId = 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('floor_device_id', deviceId);
    }
    return deviceId;
}

const deviceId = getDeviceId();

// Save player state to localStorage
function savePlayerState() {
    if (!roomCode) return;
    const state = {
        roomCode,
        playerName,
        selectedCharacter,
        selectedCategory,
        timestamp: Date.now()
    };
    localStorage.setItem('floor_player_state_' + roomCode, JSON.stringify(state));
}

// Load player state from localStorage
function loadPlayerState(code) {
    const stored = localStorage.getItem('floor_player_state_' + code);
    if (!stored) return null;
    try {
        const state = JSON.parse(stored);
        // Expire after 4 hours
        if (Date.now() - state.timestamp > 4 * 60 * 60 * 1000) {
            localStorage.removeItem('floor_player_state_' + code);
            return null;
        }
        return state;
    } catch (e) {
        return null;
    }
}

// Clear player state
function clearPlayerState(code) {
    localStorage.removeItem('floor_player_state_' + code);
}

// State
let roomCode = null;
let playerId = null;
let playerName = null;
let selectedCharacter = null;
let selectedCategory = null;
let myTerritories = 0;
let isMyTurn = false;
let inBattle = false;
let iAmChallenger = false;
let availableCategories = [];
let takenCategories = [];
let currentGrid = null;
let currentGridSize = null;
let currentPlayers = [];
let isRoomLeader = false;
let readyPlayerCount = 0;
let totalPlayerCount = 0;

// Player colors (matching host.js)
const PLAYER_COLORS = [
    '#c41e3a', '#2e8b57', '#ffd700', '#4169e1',
    '#ff6b35', '#9932cc', '#00ced1', '#ff69b4',
    '#32cd32', '#ff4500', '#1e90ff', '#ffa500'
];

// Character emoji mapping
const CHARACTER_EMOJIS = {
    'santa': '🎅', 'elf': '🧝', 'reindeer': '🦌', 'snowman': '⛄', 'gingerbread': '🍪',
    'angel': '👼', 'penguin': '🐧', 'polar-bear': '🐻‍❄️', 'nutcracker': '🪖', 'mrs-claus': '🤶',
    'candy-cane': '🍬', 'christmas-tree': '🎄', 'star': '⭐', 'present': '🎁', 'stocking': '🧦',
    'wreath': '🎀', 'bell': '🔔', 'candle': '🕯️', 'sleigh': '🛷', 'igloo': '🏠',
    'grinch': '👹', 'rudolph': '🔴', 'frosty': '☃️', 'jack-frost': '❄️'
};

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
        return `<img src="${question}" class="question-image" alt="Question image" style="max-width: 100%; max-height: 200px; border-radius: 8px;">`;
    }
    return question;
}

// Get room code from URL
const urlParams = new URLSearchParams(window.location.search);
roomCode = urlParams.get('room');

// DOM Elements
const screens = {
    join: document.getElementById('join-screen'),
    character: document.getElementById('character-screen'),
    category: document.getElementById('category-screen'),
    waiting: document.getElementById('waiting-screen'),
    game: document.getElementById('game-screen'),
    battle: document.getElementById('battle-screen'),
    eliminated: document.getElementById('eliminated-screen'),
    victory: document.getElementById('victory-screen'),
    audience: document.getElementById('audience-screen')
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

// Get player color by index
function getPlayerColor(playerIndex) {
    return PLAYER_COLORS[playerIndex % PLAYER_COLORS.length];
}

// Render the floor grid for opponent selection
function renderOpponentGrid(grid, gridSize, players, availableOpponents) {
    const container = document.getElementById('player-floor-grid');
    container.style.gridTemplateColumns = `repeat(${gridSize.cols}, 1fr)`;
    container.innerHTML = '';

    const opponentIds = availableOpponents.map(o => o.id);

    for (let row = 0; row < gridSize.rows; row++) {
        for (let col = 0; col < gridSize.cols; col++) {
            const tile = grid[row][col];
            const playerIndex = players.findIndex(p => p.id === tile.ownerId);
            const isMe = tile.ownerId === playerId;
            const isOpponent = opponentIds.includes(tile.ownerId);

            const tileEl = document.createElement('div');
            tileEl.className = 'player-floor-tile';
            if (isMe) tileEl.classList.add('is-me');
            if (isOpponent) tileEl.classList.add('is-opponent');

            tileEl.style.background = playerIndex >= 0 ? getPlayerColor(playerIndex) : '#333';

            // Get the owner's name
            const owner = players.find(p => p.id === tile.ownerId);
            const ownerName = owner ? owner.name : tile.ownerName;

            tileEl.innerHTML = `
                <div class="player-tile-character">${getCharacterEmoji(tile.character)}</div>
                <div class="player-tile-name">${ownerName}</div>
            `;

            // Add click handler for opponents
            if (isOpponent) {
                tileEl.dataset.opponentId = tile.ownerId;
                tileEl.addEventListener('click', () => {
                    socket.emit('select-challenge', { opponentId: tile.ownerId }, (response) => {
                        if (!response.success) {
                            alert(response.error);
                        }
                    });
                });
            }

            container.appendChild(tileEl);
        }
    }
}

// Render the floor view grid (non-interactive, shows all territories)
function renderFloorView(grid, gridSize, players) {
    const container = document.getElementById('floor-view-grid');
    if (!container || !grid || !gridSize) return;

    container.style.gridTemplateColumns = `repeat(${gridSize.cols}, 1fr)`;
    container.innerHTML = '';

    for (let row = 0; row < gridSize.rows; row++) {
        for (let col = 0; col < gridSize.cols; col++) {
            const tile = grid[row][col];
            const owner = players.find(p => p.id === tile.ownerId);
            const playerIndex = players.findIndex(p => p.id === tile.ownerId);
            const isMe = tile.ownerId === playerId;
            const isEliminated = owner && owner.eliminated;

            const tileEl = document.createElement('div');
            tileEl.className = 'floor-view-tile';
            if (isMe) tileEl.classList.add('is-me');
            if (isEliminated) tileEl.classList.add('is-eliminated');

            tileEl.style.background = playerIndex >= 0 ? getPlayerColor(playerIndex) : '#333';

            const ownerName = owner ? owner.name : tile.ownerName;

            tileEl.innerHTML = `
                <span>${getCharacterEmoji(tile.character)}</span>
                <span class="floor-view-tile-name">${ownerName}</span>
            `;

            container.appendChild(tileEl);
        }
    }
}

// Update the challenge area message
function setChallengeMessage(message, type = 'normal') {
    const el = document.getElementById('challenge-message');
    if (!el) return;

    if (type === 'battle') {
        el.innerHTML = `<span class="battle-notification">${message}</span>`;
    } else if (type === 'waiting') {
        el.innerHTML = `<span class="waiting-text">${message}</span>`;
    } else {
        el.innerHTML = message;
    }
}

// Update the battle question display
function setBattleQuestion(question) {
    const el = document.getElementById('battle-question');
    if (!el) return;
    el.innerHTML = `<span class="battle-notification">${formatQuestion(question)}</span>`;
}

// Join button
document.getElementById('join-btn').addEventListener('click', () => {
    playerName = document.getElementById('name-input').value.trim();
    if (!playerName) {
        showError('Please enter your name');
        return;
    }

    if (!roomCode) {
        showError('No room code provided');
        return;
    }

    socket.emit('join-room', { roomCode, playerName, deviceId }, (response) => {
        if (response.success) {
            playerId = response.playerId;

            if (response.role === 'audience') {
                showScreen('audience');
            } else {
                // Store categories for later use
                availableCategories = response.categories || [];
                // Track if this player is the room leader
                isRoomLeader = response.isRoomLeader || false;
                // Save initial state
                savePlayerState();
                // Render character selection
                renderCharacterGrid(response.availableCharacters);
                showScreen('character');
            }
        } else {
            showError(response.error);
        }
    });
});

// Enter key to join
document.getElementById('name-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        document.getElementById('join-btn').click();
    }
});

// Render character grid
function renderCharacterGrid(availableCharacters) {
    const grid = document.getElementById('character-grid');
    grid.innerHTML = Object.keys(CHARACTER_EMOJIS).map(char => {
        const available = availableCharacters.includes(char);
        return `
            <div class="character-option ${available ? '' : 'taken'}"
                 data-character="${char}"
                 ${available ? '' : 'title="Already taken"'}>
                ${CHARACTER_EMOJIS[char]}
            </div>
        `;
    }).join('');

    // Add click handlers
    grid.querySelectorAll('.character-option:not(.taken)').forEach(el => {
        el.addEventListener('click', () => {
            grid.querySelectorAll('.character-option').forEach(c => c.classList.remove('selected'));
            el.classList.add('selected');
            selectedCharacter = el.dataset.character;
            document.getElementById('confirm-character-btn').disabled = false;
        });
    });
}

// Confirm character
document.getElementById('confirm-character-btn').addEventListener('click', () => {
    if (!selectedCharacter) return;

    socket.emit('select-character', { character: selectedCharacter }, (response) => {
        if (response.success) {
            document.getElementById('my-character-display').textContent = getCharacterEmoji(selectedCharacter);
            document.getElementById('my-name-display').textContent = playerName;
            // Save state after character selection
            savePlayerState();
            // Render the category list before showing the screen
            renderCategoryList(availableCategories, takenCategories);
            showScreen('category');
        } else {
            alert(response.error);
            // Refresh available characters
        }
    });
});

// Category selection
socket.on('connect', () => {
    // Will receive categories after joining
});

function renderCategoryList(categories, takenCategories = []) {
    const list = document.getElementById('category-list');
    list.innerHTML = categories.map(cat => {
        const taken = takenCategories.includes(cat.id);
        return `
            <div class="category-option ${taken ? 'taken' : ''}"
                 data-category="${cat.id}"
                 ${taken ? 'title="Already taken"' : ''}>
                <div class="category-icon">${cat.icon}</div>
                <div class="category-name">${cat.name}</div>
            </div>
        `;
    }).join('');

    // Add click handlers
    list.querySelectorAll('.category-option:not(.taken)').forEach(el => {
        el.addEventListener('click', () => {
            selectCategory(el.dataset.category);
        });
    });
}

// Random category button
document.getElementById('random-category-btn').addEventListener('click', () => {
    selectCategory('random');
});

function selectCategory(categoryId) {
    socket.emit('select-category', { category: categoryId }, (response) => {
        if (response.success) {
            selectedCategory = response.category;
            // Save state after category selection
            savePlayerState();

            document.getElementById('waiting-character').textContent = getCharacterEmoji(selectedCharacter);
            document.getElementById('waiting-name').textContent = playerName;
            // Find the category name from the list
            const categoryObj = availableCategories.find(c => c.id === selectedCategory);
            const categoryName = categoryObj ? categoryObj.name : selectedCategory;
            document.getElementById('waiting-category').textContent = categoryName;

            // Update ready count from response
            if (response.readyCount !== undefined) {
                readyPlayerCount = response.readyCount;
                totalPlayerCount = response.totalPlayers || readyPlayerCount;
            }

            // Show/hide start game section based on room leader status
            updateStartGameButton();

            showScreen('waiting');
        } else {
            alert(response.error);
        }
    });
}

// Update start game button visibility and state
function updateStartGameButton() {
    const startSection = document.getElementById('start-game-section');
    const startBtn = document.getElementById('start-game-btn');
    const readyInfo = document.getElementById('ready-player-info');

    if (!startSection) return;

    if (isRoomLeader) {
        startSection.classList.remove('hidden');
        // Need at least 2 ready players to start
        const canStart = readyPlayerCount >= 2;
        startBtn.disabled = !canStart;

        if (readyInfo) {
            readyInfo.textContent = `${readyPlayerCount} player${readyPlayerCount !== 1 ? 's' : ''} ready`;
        }
    } else {
        startSection.classList.add('hidden');
    }
}

// Show error
function showError(message) {
    const errorEl = document.getElementById('join-error');
    errorEl.textContent = message;
    errorEl.classList.remove('hidden');
}

// Battle controls
document.getElementById('buzz-btn').addEventListener('click', () => {
    const answer = document.getElementById('answer-input').value.trim();
    socket.emit('buzz', { answer });
    document.getElementById('buzzer-section').classList.add('hidden');
    document.getElementById('waiting-confirmation').classList.remove('hidden');
});

document.getElementById('pass-btn').addEventListener('click', () => {
    socket.emit('pass');
});

// Start game button (for room leader)
const startGameBtn = document.getElementById('start-game-btn');
if (startGameBtn) {
    startGameBtn.addEventListener('click', () => {
        startGameBtn.disabled = true;
        startGameBtn.textContent = 'Starting...';

        socket.emit('start-game', (response) => {
            if (!response.success) {
                alert(response.error);
                startGameBtn.disabled = false;
                startGameBtn.textContent = 'Start Game';
            }
            // If successful, game-started event will handle the transition
        });
    });
}


// Socket Events

socket.on('character-selected', ({ playerId: pid, character }) => {
    // Another player took a character - update grid if still on that screen
    if (screens.character.classList.contains('active')) {
        const charEl = document.querySelector(`.character-option[data-character="${character}"]`);
        if (charEl && pid !== playerId) {
            charEl.classList.add('taken');
            charEl.classList.remove('selected');
        }
    }
});

// Listen for when other players select categories
socket.on('player-ready', ({ playerId: pid, category, readyCount, totalPlayers }) => {
    if (pid !== playerId) {
        // Add to taken categories and re-render if on category screen
        if (!takenCategories.includes(category)) {
            takenCategories.push(category);
        }
        if (screens.category.classList.contains('active')) {
            renderCategoryList(availableCategories, takenCategories);
        }
    }

    // Update ready count for start game button
    if (readyCount !== undefined) {
        readyPlayerCount = readyCount;
        totalPlayerCount = totalPlayers || readyPlayerCount;
        updateStartGameButton();
    }
});

socket.on('game-started', ({ grid, gridSize, players, currentChallenger }) => {
    // Store grid data for later use
    currentGrid = grid;
    currentGridSize = gridSize;
    currentPlayers = players;

    // Find my territories
    const me = players.find(p => p.id === playerId);
    if (me) {
        myTerritories = me.territories;
        document.getElementById('my-territories').textContent = myTerritories;
    }

    document.getElementById('game-character').textContent = getCharacterEmoji(selectedCharacter);
    document.getElementById('game-name').textContent = playerName;

    isMyTurn = currentChallenger === playerId;

    if (isMyTurn) {
        setChallengeMessage("It's your turn! Select an opponent to challenge.", 'battle');
    } else {
        setChallengeMessage("Waiting for your turn...", 'waiting');
    }

    // Render the floor view
    renderFloorView(grid, gridSize, players);

    showScreen('game');
});

socket.on('select-opponent', ({ challengerId, availableOpponents, grid, gridSize, players }) => {
    // Update stored grid data if provided
    if (grid) currentGrid = grid;
    if (gridSize) currentGridSize = gridSize;
    if (players) currentPlayers = players;

    // Update floor view
    renderFloorView(currentGrid, currentGridSize, currentPlayers);

    if (challengerId === playerId) {
        isMyTurn = true;
        setChallengeMessage("It's your turn! Select an opponent below.", 'battle');
        document.getElementById('opponent-selection').classList.remove('hidden');

        // Render the floor grid with clickable opponents
        renderOpponentGrid(currentGrid, currentGridSize, currentPlayers, availableOpponents);
    } else {
        isMyTurn = false;
        document.getElementById('opponent-selection').classList.add('hidden');
        setChallengeMessage("Another player is selecting their opponent...", 'waiting');
    }
});

socket.on('new-challenger', ({ challengerId, availableOpponents, grid, gridSize, players }) => {
    // Update stored grid data if provided
    if (grid) currentGrid = grid;
    if (gridSize) currentGridSize = gridSize;
    if (players) currentPlayers = players;

    // Update floor view
    renderFloorView(currentGrid, currentGridSize, currentPlayers);

    if (challengerId === playerId) {
        isMyTurn = true;
        setChallengeMessage("It's your turn! Select an opponent below.", 'battle');
        document.getElementById('opponent-selection').classList.remove('hidden');

        // Render the floor grid with clickable opponents
        if (availableOpponents) {
            renderOpponentGrid(currentGrid, currentGridSize, currentPlayers, availableOpponents);
        }
    } else {
        document.getElementById('opponent-selection').classList.add('hidden');
        setChallengeMessage("New challenger is selecting an opponent...", 'waiting');
    }
});

socket.on('battle-start', ({ challenger, defender, question }) => {
    inBattle = challenger.id === playerId || defender.id === playerId;

    if (inBattle) {
        iAmChallenger = challenger.id === playerId;
        document.getElementById('battle-role').textContent =
            iAmChallenger ? "You are the CHALLENGER!" : "You are DEFENDING!";

        // Reset battle UI
        document.getElementById('buzzer-section').classList.remove('hidden');
        document.getElementById('waiting-confirmation').classList.add('hidden');
        document.getElementById('correct-answer-section').classList.add('hidden');
        document.getElementById('wrong-answer-section').classList.add('hidden');
        document.getElementById('answer-input').value = '';

        // Always set the question (use placeholder if somehow missing)
        setBattleQuestion(question || 'Question loading...');

        // Disable if not active player (challenger goes first)
        if (!iAmChallenger) {
            document.getElementById('buzz-btn').disabled = true;
            document.getElementById('pass-btn').disabled = true;
        }

        showScreen('battle');
    } else {
        // Spectating the battle
        document.getElementById('opponent-selection').classList.add('hidden');
        setChallengeMessage(`${challenger.name} vs ${defender.name}!`, 'battle');
    }
});

socket.on('timer-update', ({ challengerTime, defenderTime, activePlayer }) => {
    if (inBattle) {
        const myTime = iAmChallenger ? challengerTime : defenderTime;
        const oppTime = iAmChallenger ? defenderTime : challengerTime;

        document.getElementById('your-time').textContent = (myTime / 1000).toFixed(1);
        document.getElementById('opponent-time').textContent = (oppTime / 1000).toFixed(1);

        // Enable/disable controls based on active player
        const isMyTurnInBattle = activePlayer === playerId;
        document.getElementById('buzz-btn').disabled = !isMyTurnInBattle;
        document.getElementById('pass-btn').disabled = !isMyTurnInBattle;
    }
});

socket.on('answer-confirmed', ({ correct, playerId: pid, newTime, question }) => {
    // Update the question for all players in battle when wrong answer
    if (inBattle && !correct && question) {
        setBattleQuestion(question);
    }

    if (pid === playerId) {
        document.getElementById('waiting-confirmation').classList.add('hidden');

        if (correct) {
            // Show brief correct message - turn will auto-switch
            document.getElementById('correct-answer-section').classList.remove('hidden');
            setTimeout(() => {
                document.getElementById('correct-answer-section').classList.add('hidden');
            }, 1500);
        } else {
            // Wrong answer - timer was reset and new question given
            // Update displayed time with the reset value
            if (newTime !== undefined) {
                document.getElementById('your-time').textContent = (newTime / 1000).toFixed(1);
            }

            document.getElementById('wrong-answer-section').classList.remove('hidden');
            document.getElementById('buzzer-section').classList.remove('hidden');
            document.getElementById('answer-input').value = '';

            setTimeout(() => {
                document.getElementById('wrong-answer-section').classList.add('hidden');
            }, 2000);
        }
    }
});

socket.on('turn-switched', ({ activePlayer, question }) => {
    if (inBattle) {
        document.getElementById('buzzer-section').classList.remove('hidden');
        document.getElementById('correct-answer-section').classList.add('hidden');
        document.getElementById('answer-input').value = '';

        // Show the new question
        if (question) {
            setBattleQuestion(question);
        }

        const isMyTurnInBattle = activePlayer === playerId;
        document.getElementById('buzz-btn').disabled = !isMyTurnInBattle;
        document.getElementById('pass-btn').disabled = !isMyTurnInBattle;
    }
});

socket.on('player-passed', ({ playerId: passedPlayerId, challengerTime, defenderTime, question }) => {
    if (inBattle) {
        // Update displayed times immediately after pass penalty
        const myTime = iAmChallenger ? challengerTime : defenderTime;
        const oppTime = iAmChallenger ? defenderTime : challengerTime;

        document.getElementById('your-time').textContent = (myTime / 1000).toFixed(1);
        document.getElementById('opponent-time').textContent = (oppTime / 1000).toFixed(1);

        // Show the new question
        if (question) {
            setBattleQuestion(question);
        }

        // Re-enable buzzer section for the player who passed (new question)
        if (passedPlayerId === playerId) {
            document.getElementById('buzzer-section').classList.remove('hidden');
            document.getElementById('answer-input').value = '';
        }
    }
});

socket.on('slide-advanced', ({ question }) => {
    if (inBattle && question) {
        setBattleQuestion(question);
    }
});

socket.on('battle-end', ({ winnerId, winnerName, loserName, players, grid, gameOver }) => {
    inBattle = false;

    // Update stored grid and players data
    if (grid) currentGrid = grid;
    if (players) currentPlayers = players;

    // Check if I was eliminated
    const me = players.find(p => p.id === playerId);

    if (gameOver && winnerId === playerId) {
        showScreen('victory');
    } else if (me && me.eliminated) {
        showScreen('eliminated');
    } else if (me) {
        myTerritories = me.territories;
        document.getElementById('my-territories').textContent = myTerritories;
        showScreen('game');
        document.getElementById('opponent-selection').classList.add('hidden');

        // Show defeat notification in challenge area
        setChallengeMessage(`${winnerName} defeated ${loserName}!<br><span class="waiting-text">Waiting for next turn...</span>`, 'battle');

        // Update the floor view to show territory changes
        renderFloorView(currentGrid, currentGridSize, currentPlayers);
    }
});

socket.on('game-over', ({ winner }) => {
    if (winner.id === playerId) {
        showScreen('victory');
    } else {
        setChallengeMessage(`${winner.name} has conquered The Floor!`, 'battle');
        // Update floor view one last time
        renderFloorView(currentGrid, currentGridSize, currentPlayers);
    }
});

socket.on('host-disconnected', () => {
    alert('Host disconnected! The game has ended.');
    clearPlayerState(roomCode);
    window.location.href = '/';
});

// Handle successful rejoin
socket.on('rejoin-success', (data) => {
    playerId = data.playerId;
    playerName = data.playerName;
    selectedCharacter = data.character;
    selectedCategory = data.category;
    availableCategories = data.categories || [];
    isRoomLeader = data.isRoomLeader || false;
    readyPlayerCount = data.readyCount || 0;
    totalPlayerCount = data.totalPlayers || 0;

    // Update stored grid data
    if (data.grid) currentGrid = data.grid;
    if (data.gridSize) currentGridSize = data.gridSize;
    if (data.players) currentPlayers = data.players;

    // Find my territories
    if (data.players) {
        const me = data.players.find(p => p.id === playerId);
        if (me) {
            myTerritories = me.territories;
        }
    }

    // Show appropriate screen based on game state
    if (data.gamePhase === 'battle' && data.inBattle) {
        // Player is in an active battle
        inBattle = true;
        iAmChallenger = data.iAmChallenger;

        document.getElementById('battle-role').textContent =
            iAmChallenger ? "You are the CHALLENGER!" : "You are DEFENDING!";

        // Set up battle UI
        document.getElementById('buzzer-section').classList.remove('hidden');
        document.getElementById('waiting-confirmation').classList.add('hidden');
        document.getElementById('correct-answer-section').classList.add('hidden');
        document.getElementById('wrong-answer-section').classList.add('hidden');
        document.getElementById('answer-input').value = '';

        if (data.question) {
            setBattleQuestion(data.question);
        }

        // Set button states based on active player
        const isMyTurnInBattle = data.activePlayer === playerId;
        document.getElementById('buzz-btn').disabled = !isMyTurnInBattle;
        document.getElementById('pass-btn').disabled = !isMyTurnInBattle;

        showScreen('battle');
    } else if (data.gameStarted) {
        // Game is in progress but not in battle
        document.getElementById('game-character').textContent = getCharacterEmoji(selectedCharacter);
        document.getElementById('game-name').textContent = playerName;
        document.getElementById('my-territories').textContent = myTerritories;

        // Render floor view
        if (currentGrid && currentGridSize && currentPlayers) {
            renderFloorView(currentGrid, currentGridSize, currentPlayers);
        }

        // Check if it's my turn to select opponent
        if (data.currentChallenger === playerId) {
            isMyTurn = true;
            setChallengeMessage("It's your turn! Select an opponent below.", 'battle');
            document.getElementById('opponent-selection').classList.remove('hidden');
            if (data.availableOpponents) {
                renderOpponentGrid(currentGrid, currentGridSize, currentPlayers, data.availableOpponents);
            }
        } else {
            setChallengeMessage("Waiting for your turn...", 'waiting');
            document.getElementById('opponent-selection').classList.add('hidden');
        }

        showScreen('game');
    } else if (selectedCategory) {
        // Waiting for game to start
        document.getElementById('waiting-character').textContent = getCharacterEmoji(selectedCharacter);
        document.getElementById('waiting-name').textContent = playerName;
        const categoryObj = availableCategories.find(c => c.id === selectedCategory);
        const categoryName = categoryObj ? categoryObj.name : selectedCategory;
        document.getElementById('waiting-category').textContent = categoryName;
        updateStartGameButton();
        showScreen('waiting');
    } else if (selectedCharacter) {
        // Need to select category
        document.getElementById('my-character-display').textContent = getCharacterEmoji(selectedCharacter);
        document.getElementById('my-name-display').textContent = playerName;
        renderCategoryList(availableCategories, data.takenCategories || []);
        showScreen('category');
    } else {
        // Need to select character
        renderCharacterGrid(data.availableCharacters || []);
        showScreen('character');
    }

    console.log('Successfully rejoined game');
});

// Attempt to rejoin if we have stored state
function attemptRejoin() {
    if (!roomCode) return;

    const savedState = loadPlayerState(roomCode);
    if (savedState && savedState.playerName) {
        // Pre-fill name
        document.getElementById('name-input').value = savedState.playerName;

        // Try to rejoin with stored data
        socket.emit('rejoin-as-player', {
            roomCode,
            deviceId,
            playerName: savedState.playerName
        }, (response) => {
            if (!response.success) {
                // Rejoin failed, show normal join screen
                console.log('Rejoin failed:', response.error);
                // Name is still pre-filled for convenience
            }
            // If successful, rejoin-success event will handle the UI
        });
    }
}

// Initialize
document.getElementById('name-input').focus();
console.log('Player view initialized, room:', roomCode);

// Attempt rejoin after socket connects
socket.on('connect', () => {
    attemptRejoin();
});

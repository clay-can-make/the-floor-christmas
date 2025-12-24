// The Floor: Christmas Edition - Game Logic

// Player colors (festive palette)
const PLAYER_COLORS = [
    '#c41e3a', // Christmas Red
    '#2e8b57', // Sea Green
    '#ffd700', // Gold
    '#4169e1', // Royal Blue
    '#ff6b35', // Orange Red
    '#9932cc'  // Purple
];

// Game state
let gameState = {
    players: [],
    currentPlayerIndex: 0,
    grid: [],
    gridSize: { rows: 0, cols: 0 },
    selectedTile: null,
    usedQuestions: [],
    battleInProgress: false,
    gameOver: false
};

// Canvas setup
let canvas, ctx;
const TILE_SIZE = 80;
const TILE_GAP = 4;

// DOM Elements
const screens = {
    title: document.getElementById('title-screen'),
    setup: document.getElementById('setup-screen'),
    game: document.getElementById('game-screen'),
    battle: document.getElementById('battle-screen'),
    result: document.getElementById('result-screen'),
    victory: document.getElementById('victory-screen')
};

// Initialize game
document.addEventListener('DOMContentLoaded', () => {
    canvas = document.getElementById('floor-canvas');
    ctx = canvas.getContext('2d');

    // Button event listeners
    document.getElementById('btn-2players').addEventListener('click', () => startSetup(2));
    document.getElementById('btn-4players').addEventListener('click', () => startSetup(4));
    document.getElementById('btn-6players').addEventListener('click', () => startSetup(6));
    document.getElementById('btn-start-game').addEventListener('click', startGame);
    document.getElementById('btn-continue').addEventListener('click', continueGame);
    document.getElementById('btn-play-again').addEventListener('click', resetGame);

    // Canvas click handler
    canvas.addEventListener('click', handleCanvasClick);
});

// Show specific screen
function showScreen(screenName) {
    Object.values(screens).forEach(screen => screen.classList.remove('active'));
    screens[screenName].classList.add('active');
}

// Start player setup
function startSetup(numPlayers) {
    const inputsContainer = document.getElementById('player-inputs');
    inputsContainer.innerHTML = '';

    for (let i = 0; i < numPlayers; i++) {
        const group = document.createElement('div');
        group.className = 'player-input-group';
        group.innerHTML = `
            <label>
                <span class="player-color" style="background: ${PLAYER_COLORS[i]}"></span>
                Player ${i + 1}
            </label>
            <input type="text" id="player-name-${i}" placeholder="Enter name..." maxlength="12">
        `;
        inputsContainer.appendChild(group);
    }

    showScreen('setup');

    // Focus first input
    document.getElementById('player-name-0').focus();
}

// Start the game
function startGame() {
    // Collect player names
    const inputs = document.querySelectorAll('#player-inputs input');
    gameState.players = [];

    inputs.forEach((input, index) => {
        const name = input.value.trim() || `Player ${index + 1}`;
        gameState.players.push({
            name: name,
            color: PLAYER_COLORS[index],
            territories: 0,
            eliminated: false
        });
    });

    // Setup grid based on player count
    setupGrid(gameState.players.length);

    // Reset game state
    gameState.currentPlayerIndex = 0;
    gameState.usedQuestions = [];
    gameState.battleInProgress = false;
    gameState.gameOver = false;
    gameState.selectedTile = null;

    // Initialize canvas
    initCanvas();
    drawGrid();
    updateUI();

    showScreen('game');
}

// Setup grid with territories
function setupGrid(numPlayers) {
    // Grid configurations based on player count
    const configs = {
        2: { rows: 3, cols: 4 },
        4: { rows: 4, cols: 5 },
        6: { rows: 4, cols: 6 }
    };

    const config = configs[numPlayers];
    gameState.gridSize = config;
    gameState.grid = [];

    // Create tiles
    const totalTiles = config.rows * config.cols;
    const tilesPerPlayer = Math.floor(totalTiles / numPlayers);

    // Create array of player assignments
    let assignments = [];
    for (let p = 0; p < numPlayers; p++) {
        for (let t = 0; t < tilesPerPlayer; t++) {
            assignments.push(p);
        }
    }

    // Fill remaining tiles (if any) with random players
    while (assignments.length < totalTiles) {
        assignments.push(Math.floor(Math.random() * numPlayers));
    }

    // Shuffle assignments
    for (let i = assignments.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [assignments[i], assignments[j]] = [assignments[j], assignments[i]];
    }

    // Create grid
    let assignIndex = 0;
    for (let row = 0; row < config.rows; row++) {
        gameState.grid[row] = [];
        for (let col = 0; col < config.cols; col++) {
            gameState.grid[row][col] = {
                owner: assignments[assignIndex],
                row: row,
                col: col,
                highlighted: false
            };
            assignIndex++;
        }
    }

    // Count territories
    countTerritories();
}

// Count each player's territories
function countTerritories() {
    gameState.players.forEach(player => player.territories = 0);

    for (let row = 0; row < gameState.gridSize.rows; row++) {
        for (let col = 0; col < gameState.gridSize.cols; col++) {
            const owner = gameState.grid[row][col].owner;
            if (owner !== null) {
                gameState.players[owner].territories++;
            }
        }
    }
}

// Initialize canvas size
function initCanvas() {
    const { rows, cols } = gameState.gridSize;
    canvas.width = cols * (TILE_SIZE + TILE_GAP) + TILE_GAP;
    canvas.height = rows * (TILE_SIZE + TILE_GAP) + TILE_GAP;
}

// Draw the grid
function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const { rows, cols } = gameState.gridSize;

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const tile = gameState.grid[row][col];
            const x = col * (TILE_SIZE + TILE_GAP) + TILE_GAP;
            const y = row * (TILE_SIZE + TILE_GAP) + TILE_GAP;

            // Draw tile
            drawTile(x, y, tile);
        }
    }
}

// Draw a single tile
function drawTile(x, y, tile) {
    const owner = tile.owner;
    const player = owner !== null ? gameState.players[owner] : null;
    const baseColor = player ? player.color : '#333';

    // Tile background
    ctx.fillStyle = baseColor;
    ctx.beginPath();
    ctx.roundRect(x, y, TILE_SIZE, TILE_SIZE, 8);
    ctx.fill();

    // Gradient overlay for depth
    const gradient = ctx.createLinearGradient(x, y, x, y + TILE_SIZE);
    gradient.addColorStop(0, 'rgba(255,255,255,0.2)');
    gradient.addColorStop(0.5, 'rgba(255,255,255,0)');
    gradient.addColorStop(1, 'rgba(0,0,0,0.2)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.roundRect(x, y, TILE_SIZE, TILE_SIZE, 8);
    ctx.fill();

    // Highlight if adjacent to current player and attackable
    if (tile.highlighted) {
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.roundRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4, 6);
        ctx.stroke();

        // Pulsing effect
        ctx.fillStyle = 'rgba(255, 215, 0, 0.2)';
        ctx.beginPath();
        ctx.roundRect(x, y, TILE_SIZE, TILE_SIZE, 8);
        ctx.fill();
    }

    // Draw player initial or icon
    if (player) {
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.font = 'bold 24px Poppins';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Draw Christmas emoji based on player index
        const icons = ['🎅', '🎄', '⭐', '🎁', '❄️', '🦌'];
        ctx.font = '32px serif';
        ctx.fillText(icons[owner], x + TILE_SIZE / 2, y + TILE_SIZE / 2);
    }
}

// Handle canvas click
function handleCanvasClick(event) {
    if (gameState.battleInProgress || gameState.gameOver) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const clickX = (event.clientX - rect.left) * scaleX;
    const clickY = (event.clientY - rect.top) * scaleY;

    // Find clicked tile
    const col = Math.floor((clickX - TILE_GAP) / (TILE_SIZE + TILE_GAP));
    const row = Math.floor((clickY - TILE_GAP) / (TILE_SIZE + TILE_GAP));

    if (row >= 0 && row < gameState.gridSize.rows &&
        col >= 0 && col < gameState.gridSize.cols) {

        const tile = gameState.grid[row][col];

        // Check if this is a valid attack target
        if (tile.highlighted && tile.owner !== gameState.currentPlayerIndex) {
            startBattle(tile);
        }
    }
}

// Get adjacent tiles for a player
function getAdjacentEnemyTiles(playerIndex) {
    const adjacentEnemies = [];
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];

    for (let row = 0; row < gameState.gridSize.rows; row++) {
        for (let col = 0; col < gameState.gridSize.cols; col++) {
            if (gameState.grid[row][col].owner === playerIndex) {
                // Check all adjacent tiles
                for (const [dr, dc] of directions) {
                    const newRow = row + dr;
                    const newCol = col + dc;

                    if (newRow >= 0 && newRow < gameState.gridSize.rows &&
                        newCol >= 0 && newCol < gameState.gridSize.cols) {

                        const adjTile = gameState.grid[newRow][newCol];
                        if (adjTile.owner !== playerIndex && adjTile.owner !== null) {
                            // Check if not already in list
                            if (!adjacentEnemies.some(t => t.row === newRow && t.col === newCol)) {
                                adjacentEnemies.push(adjTile);
                            }
                        }
                    }
                }
            }
        }
    }

    return adjacentEnemies;
}

// Highlight attackable tiles
function highlightAttackableTiles() {
    // Clear all highlights
    for (let row = 0; row < gameState.gridSize.rows; row++) {
        for (let col = 0; col < gameState.gridSize.cols; col++) {
            gameState.grid[row][col].highlighted = false;
        }
    }

    // Get and highlight adjacent enemy tiles
    const attackable = getAdjacentEnemyTiles(gameState.currentPlayerIndex);
    attackable.forEach(tile => {
        gameState.grid[tile.row][tile.col].highlighted = true;
    });

    drawGrid();
}

// Update UI elements
function updateUI() {
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];

    // Update turn display
    document.getElementById('current-turn').innerHTML = `
        <span class="player-name" style="color: ${currentPlayer.color}">${currentPlayer.name}</span>'s Turn
    `;

    // Update score display
    const scoreDisplay = document.getElementById('score-display');
    scoreDisplay.innerHTML = gameState.players
        .filter(p => !p.eliminated)
        .map(p => `
            <div class="score-item">
                <span class="score-color" style="background: ${p.color}"></span>
                ${p.name}: ${p.territories}
            </div>
        `).join('');

    // Highlight attackable tiles
    highlightAttackableTiles();
}

// Start a battle
function startBattle(targetTile) {
    gameState.battleInProgress = true;
    gameState.selectedTile = targetTile;

    const challenger = gameState.players[gameState.currentPlayerIndex];
    const defender = gameState.players[targetTile.owner];

    // Setup battle UI
    document.getElementById('challenger-info').innerHTML = `
        <span style="color: ${challenger.color}">${challenger.name}</span>
    `;
    document.getElementById('challenger-info').style.background = challenger.color + '40';
    document.getElementById('challenger-info').style.borderLeft = `4px solid ${challenger.color}`;

    document.getElementById('defender-info').innerHTML = `
        <span style="color: ${defender.color}">${defender.name}</span>
    `;
    document.getElementById('defender-info').style.background = defender.color + '40';
    document.getElementById('defender-info').style.borderRight = `4px solid ${defender.color}`;

    document.getElementById('battle-status').textContent = '';

    // Get question
    const question = getRandomQuestion(gameState.usedQuestions);
    gameState.usedQuestions.push(question.originalIndex);
    gameState.currentQuestion = question;

    // Display question
    document.getElementById('question-category').textContent = question.category;
    document.getElementById('question-text').textContent = question.question;

    // Display answer options
    const optionsContainer = document.getElementById('answer-options');
    optionsContainer.innerHTML = '';

    question.answers.forEach((answer, index) => {
        const btn = document.createElement('button');
        btn.className = 'answer-btn';
        btn.textContent = answer;
        btn.addEventListener('click', () => handleAnswer(index));
        optionsContainer.appendChild(btn);
    });

    // Start timer
    startTimer();

    showScreen('battle');
}

// Timer variables
let timerInterval;
let timeLeft;

function startTimer() {
    timeLeft = 15; // 15 seconds to answer
    const timerBar = document.getElementById('timer-bar');
    timerBar.style.width = '100%';

    timerInterval = setInterval(() => {
        timeLeft -= 0.1;
        timerBar.style.width = `${(timeLeft / 15) * 100}%`;

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            handleTimeout();
        }
    }, 100);
}

function stopTimer() {
    clearInterval(timerInterval);
}

// Handle answer selection
function handleAnswer(selectedIndex) {
    stopTimer();

    const buttons = document.querySelectorAll('.answer-btn');
    buttons.forEach(btn => btn.disabled = true);

    const correct = selectedIndex === gameState.currentQuestion.correct;

    // Highlight answers
    buttons[gameState.currentQuestion.correct].classList.add('correct');
    if (!correct) {
        buttons[selectedIndex].classList.add('incorrect');
    }

    // Show result after a delay
    setTimeout(() => {
        showBattleResult(correct);
    }, 1500);
}

// Handle timeout
function handleTimeout() {
    const buttons = document.querySelectorAll('.answer-btn');
    buttons.forEach(btn => btn.disabled = true);
    buttons[gameState.currentQuestion.correct].classList.add('correct');

    document.getElementById('battle-status').textContent = "⏰ Time's up!";

    setTimeout(() => {
        showBattleResult(false);
    }, 1500);
}

// Show battle result
function showBattleResult(challengerWon) {
    const challenger = gameState.players[gameState.currentPlayerIndex];
    const defender = gameState.players[gameState.selectedTile.owner];

    if (challengerWon) {
        // Challenger takes the territory
        gameState.grid[gameState.selectedTile.row][gameState.selectedTile.col].owner = gameState.currentPlayerIndex;
        countTerritories();

        document.getElementById('result-title').textContent = '🎉 Victory! 🎉';
        document.getElementById('result-title').style.color = challenger.color;
        document.getElementById('result-message').textContent =
            `${challenger.name} conquered territory from ${defender.name}!`;
    } else {
        document.getElementById('result-title').textContent = '❌ Defeated ❌';
        document.getElementById('result-title').style.color = '#e74c3c';
        document.getElementById('result-message').textContent =
            `${defender.name} successfully defended their territory!`;
    }

    // Check if defender is eliminated
    if (defender.territories === 0) {
        defender.eliminated = true;
        document.getElementById('result-message').textContent +=
            `\n\n💀 ${defender.name} has been eliminated from The Floor!`;
    }

    showScreen('result');
}

// Continue to next turn
function continueGame() {
    // Check for winner
    const remainingPlayers = gameState.players.filter(p => !p.eliminated);

    if (remainingPlayers.length === 1) {
        showVictory(remainingPlayers[0]);
        return;
    }

    // Move to next player
    do {
        gameState.currentPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length;
    } while (gameState.players[gameState.currentPlayerIndex].eliminated);

    gameState.battleInProgress = false;
    gameState.selectedTile = null;

    // Check if current player can make any moves
    const attackable = getAdjacentEnemyTiles(gameState.currentPlayerIndex);
    if (attackable.length === 0) {
        // Skip players with no adjacent enemies
        let skippedPlayers = 0;
        while (attackable.length === 0 && skippedPlayers < gameState.players.length) {
            do {
                gameState.currentPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length;
            } while (gameState.players[gameState.currentPlayerIndex].eliminated);
            skippedPlayers++;
        }
    }

    updateUI();
    showScreen('game');
}

// Show victory screen
function showVictory(winner) {
    gameState.gameOver = true;
    document.getElementById('winner-name').textContent = winner.name;
    document.getElementById('winner-name').style.color = winner.color;
    showScreen('victory');
}

// Reset game
function resetGame() {
    gameState = {
        players: [],
        currentPlayerIndex: 0,
        grid: [],
        gridSize: { rows: 0, cols: 0 },
        selectedTile: null,
        usedQuestions: [],
        battleInProgress: false,
        gameOver: false
    };
    showScreen('title');
}

// Add roundRect polyfill for older browsers
if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
        if (w < 2 * r) r = w / 2;
        if (h < 2 * r) r = h / 2;
        this.moveTo(x + r, y);
        this.arcTo(x + w, y, x + w, y + h, r);
        this.arcTo(x + w, y + h, x, y + h, r);
        this.arcTo(x, y + h, x, y, r);
        this.arcTo(x, y, x + w, y, r);
        this.closePath();
        return this;
    };
}

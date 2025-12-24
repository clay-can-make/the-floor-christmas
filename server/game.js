// Game Logic for The Floor: Christmas Edition
const { getQuestion, getQuestionCount } = require('./questions');

class GameManager {
    constructor(io, roomManager) {
        this.io = io;
        this.roomManager = roomManager;
        this.timers = new Map(); // roomCode -> timer interval
    }

    // Calculate grid size based on player count
    calculateGridSize(playerCount) {
        if (playerCount <= 4) return { rows: 2, cols: 2 };
        if (playerCount <= 6) return { rows: 2, cols: 3 };
        if (playerCount <= 9) return { rows: 3, cols: 3 };
        if (playerCount <= 12) return { rows: 3, cols: 4 };
        if (playerCount <= 16) return { rows: 4, cols: 4 };
        if (playerCount <= 20) return { rows: 4, cols: 5 };
        return { rows: 5, cols: 5 }; // Max 25 squares for up to 24 players
    }

    // Create the floor grid
    createGrid(room) {
        const players = room.getReadyPlayers();
        const gridSize = this.calculateGridSize(players.length);
        const totalSquares = gridSize.rows * gridSize.cols;

        // Create assignment array
        const assignments = [];

        // Assign one square per player first
        players.forEach((player, index) => {
            assignments.push(index);
        });

        // Assign extra squares randomly
        while (assignments.length < totalSquares) {
            const randomPlayer = Math.floor(Math.random() * players.length);
            assignments.push(randomPlayer);
        }

        // Shuffle assignments
        for (let i = assignments.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [assignments[i], assignments[j]] = [assignments[j], assignments[i]];
        }

        // Create grid
        const grid = [];
        let assignIndex = 0;

        for (let row = 0; row < gridSize.rows; row++) {
            grid[row] = [];
            for (let col = 0; col < gridSize.cols; col++) {
                const playerIndex = assignments[assignIndex];
                const player = players[playerIndex];

                grid[row][col] = {
                    row,
                    col,
                    ownerId: player.id,
                    ownerName: player.name,
                    character: player.character,
                    category: player.category
                };
                assignIndex++;
            }
        }

        // Count territories for each player
        players.forEach(player => {
            player.territories = 0;
        });

        for (let row = 0; row < gridSize.rows; row++) {
            for (let col = 0; col < gridSize.cols; col++) {
                const owner = players.find(p => p.id === grid[row][col].ownerId);
                if (owner) owner.territories++;
            }
        }

        return { grid, gridSize };
    }

    // Start the game
    startGame(roomCode) {
        const room = this.roomManager.getRoom(roomCode);
        if (!room) return;

        room.gameStarted = true;

        // Create grid
        const { grid, gridSize } = this.createGrid(room);
        const players = room.getReadyPlayers();

        // Initialize game state
        room.gameState = {
            grid,
            gridSize,
            players: players.map(p => ({
                id: p.id,
                name: p.name,
                character: p.character,
                category: p.category,
                territories: p.territories,
                eliminated: false
            })),
            currentChallenger: null,
            currentDefender: null,
            battle: null,
            phase: 'selecting-challenger' // selecting-challenger, selecting-opponent, battle, post-battle
        };

        // Pick first challenger randomly
        const firstChallenger = players[Math.floor(Math.random() * players.length)];
        room.gameState.currentChallenger = firstChallenger.id;

        // Emit game started
        this.io.to(roomCode).emit('game-started', {
            grid,
            gridSize,
            players: room.gameState.players,
            currentChallenger: firstChallenger.id,
            challengerName: firstChallenger.name
        });

        // Send available opponents to the first challenger
        room.gameState.phase = 'selecting-opponent';
        const adjacentOpponents = this.getAdjacentOpponents(room, firstChallenger.id);

        this.io.to(roomCode).emit('select-opponent', {
            challengerId: firstChallenger.id,
            challengerName: firstChallenger.name,
            availableOpponents: adjacentOpponents.map(id => {
                const p = room.gameState.players.find(pl => pl.id === id);
                return { id, name: p.name, character: p.character };
            }),
            grid: room.gameState.grid,
            gridSize: room.gameState.gridSize,
            players: room.gameState.players
        });
    }

    // Get adjacent opponents for a player
    getAdjacentOpponents(room, playerId) {
        const { grid, gridSize } = room.gameState;
        const opponents = new Set();
        const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];

        for (let row = 0; row < gridSize.rows; row++) {
            for (let col = 0; col < gridSize.cols; col++) {
                if (grid[row][col].ownerId === playerId) {
                    for (const [dr, dc] of directions) {
                        const newRow = row + dr;
                        const newCol = col + dc;

                        if (newRow >= 0 && newRow < gridSize.rows &&
                            newCol >= 0 && newCol < gridSize.cols) {
                            const adjacentTile = grid[newRow][newCol];
                            if (adjacentTile.ownerId !== playerId) {
                                opponents.add(adjacentTile.ownerId);
                            }
                        }
                    }
                }
            }
        }

        return Array.from(opponents);
    }

    // Initiate a challenge
    initiateChallenge(roomCode, challengerId, opponentId) {
        const room = this.roomManager.getRoom(roomCode);
        if (!room || !room.gameState) {
            return { success: false, error: 'Game not found' };
        }

        if (room.gameState.currentChallenger !== challengerId) {
            return { success: false, error: 'Not your turn to challenge' };
        }

        const adjacentOpponents = this.getAdjacentOpponents(room, challengerId);
        if (!adjacentOpponents.includes(opponentId)) {
            return { success: false, error: 'Must challenge an adjacent opponent' };
        }

        const challenger = room.gameState.players.find(p => p.id === challengerId);
        const defender = room.gameState.players.find(p => p.id === opponentId);

        if (!challenger || !defender) {
            return { success: false, error: 'Player not found' };
        }

        // Find defender's category info
        const defenderCategory = room.categories.find(c => c.id === defender.category);

        // Initialize battle
        room.gameState.currentDefender = opponentId;
        room.gameState.phase = 'battle';
        room.gameState.battle = {
            challengerId,
            defenderId: opponentId,
            challengerName: challenger.name,
            defenderName: defender.name,
            category: defender.category,
            categoryName: defenderCategory?.name || defender.category,
            challengerTime: 45000, // 45 seconds in ms
            defenderTime: 45000,
            activePlayer: challengerId, // Challenger goes first
            currentSlide: 0,
            waitingForConfirmation: false,
            lastBuzz: null,
            passCount: 0
        };

        // Get first question
        const firstQuestion = getQuestion(defender.category, 0);

        // Emit battle start
        this.io.to(roomCode).emit('battle-start', {
            challenger: {
                id: challengerId,
                name: challenger.name,
                character: challenger.character
            },
            defender: {
                id: opponentId,
                name: defender.name,
                character: defender.character
            },
            category: defenderCategory?.name || defender.category,
            categoryIcon: defenderCategory?.icon || '❓',
            question: firstQuestion?.question || 'No question available',
            correctAnswer: firstQuestion?.answer || 'Unknown',
            questionNumber: 1,
            totalQuestions: getQuestionCount(defender.category)
        });

        // Start the timer
        this.startBattleTimer(roomCode);

        return { success: true };
    }

    // Start battle timer
    startBattleTimer(roomCode) {
        // Clear any existing timer
        if (this.timers.has(roomCode)) {
            clearInterval(this.timers.get(roomCode));
        }

        const interval = setInterval(() => {
            const room = this.roomManager.getRoom(roomCode);
            if (!room || !room.gameState || !room.gameState.battle) {
                clearInterval(interval);
                this.timers.delete(roomCode);
                return;
            }

            const battle = room.gameState.battle;

            // Don't count down if waiting for host confirmation
            if (battle.waitingForConfirmation) return;

            // Decrease active player's time
            if (battle.activePlayer === battle.challengerId) {
                battle.challengerTime -= 100;
            } else {
                battle.defenderTime -= 100;
            }

            // Emit timer update
            this.io.to(roomCode).emit('timer-update', {
                challengerTime: battle.challengerTime,
                defenderTime: battle.defenderTime,
                activePlayer: battle.activePlayer
            });

            // Check for timeout
            if (battle.challengerTime <= 0) {
                this.endBattle(roomCode, battle.defenderId);
            } else if (battle.defenderTime <= 0) {
                this.endBattle(roomCode, battle.challengerId);
            }
        }, 100);

        this.timers.set(roomCode, interval);
    }

    // Handle buzz from player
    handleBuzz(roomCode, playerId, answer) {
        console.log('handleBuzz called:', { roomCode, playerId, answer });

        const room = this.roomManager.getRoom(roomCode);
        if (!room || !room.gameState || !room.gameState.battle) {
            console.log('handleBuzz early return: no room/gameState/battle');
            return;
        }

        const battle = room.gameState.battle;

        // Only active player can buzz
        if (battle.activePlayer !== playerId) {
            console.log('handleBuzz early return: not active player', { activePlayer: battle.activePlayer, playerId });
            return;
        }

        // Already waiting for confirmation
        if (battle.waitingForConfirmation) {
            console.log('handleBuzz early return: already waiting for confirmation');
            return;
        }

        battle.waitingForConfirmation = true;
        battle.lastBuzz = { playerId, answer };

        const playerName = playerId === battle.challengerId ? battle.challengerName : battle.defenderName;
        console.log('Emitting buzz-received to room:', roomCode, { playerId, playerName, answer });

        // Get the current question's correct answer
        const currentQuestion = getQuestion(battle.category, battle.currentSlide);
        const correctAnswer = currentQuestion?.answer || 'Unknown';

        // Notify host to confirm
        this.io.to(roomCode).emit('buzz-received', {
            playerId,
            playerName,
            answer,
            correctAnswer
        });
    }

    // Host confirms answer
    confirmAnswer(roomCode, correct) {
        const room = this.roomManager.getRoom(roomCode);
        if (!room || !room.gameState || !room.gameState.battle) return;

        const battle = room.gameState.battle;
        battle.waitingForConfirmation = false;

        if (correct) {
            // Correct answer - emit confirmation and auto-switch turns
            this.io.to(roomCode).emit('answer-confirmed', {
                correct: true,
                playerId: battle.activePlayer
            });

            // Auto-switch to next player (no need to hit timer)
            this.switchTurn(roomCode, battle.activePlayer);
        } else {
            // Wrong answer - give them a new question (timer continues from where it left off)
            // Advance to next question
            battle.currentSlide++;
            const nextQuestion = getQuestion(battle.category, battle.currentSlide);

            this.io.to(roomCode).emit('answer-confirmed', {
                correct: false,
                playerId: battle.activePlayer,
                newTime: battle.activePlayer === battle.challengerId ? battle.challengerTime : battle.defenderTime,
                question: nextQuestion?.question || 'No more questions',
                correctAnswer: nextQuestion?.answer || 'Unknown',
                questionNumber: battle.currentSlide + 1,
                totalQuestions: getQuestionCount(battle.category)
            });
        }
    }

    // Player hits timer to switch turns
    switchTurn(roomCode, playerId) {
        const room = this.roomManager.getRoom(roomCode);
        if (!room || !room.gameState || !room.gameState.battle) return;

        const battle = room.gameState.battle;

        // Only the active player who just got confirmed can switch
        if (battle.activePlayer !== playerId) return;

        // Switch active player
        battle.activePlayer = battle.activePlayer === battle.challengerId
            ? battle.defenderId
            : battle.challengerId;

        battle.currentSlide++;
        battle.passCount = 0;

        // Get next question
        const nextQuestion = getQuestion(battle.category, battle.currentSlide);

        this.io.to(roomCode).emit('turn-switched', {
            activePlayer: battle.activePlayer,
            slideNumber: battle.currentSlide,
            question: nextQuestion?.question || 'No more questions',
            correctAnswer: nextQuestion?.answer || 'Unknown',
            questionNumber: battle.currentSlide + 1,
            totalQuestions: getQuestionCount(battle.category)
        });
    }

    // Handle pass
    handlePass(roomCode, playerId) {
        const room = this.roomManager.getRoom(roomCode);
        if (!room || !room.gameState || !room.gameState.battle) return;

        const battle = room.gameState.battle;

        if (battle.activePlayer !== playerId) return;

        battle.passCount++;

        // Deduct 3 seconds (3000ms) from the active player's time
        if (battle.activePlayer === battle.challengerId) {
            battle.challengerTime = Math.max(0, battle.challengerTime - 3000);
        } else {
            battle.defenderTime = Math.max(0, battle.defenderTime - 3000);
        }

        // Advance to next question
        battle.currentSlide++;
        const nextQuestion = getQuestion(battle.category, battle.currentSlide);

        // Emit pass notification with new question and updated times
        this.io.to(roomCode).emit('player-passed', {
            playerId,
            passCount: battle.passCount,
            challengerTime: battle.challengerTime,
            defenderTime: battle.defenderTime,
            question: nextQuestion?.question || 'No more questions',
            correctAnswer: nextQuestion?.answer || 'Unknown',
            questionNumber: battle.currentSlide + 1,
            totalQuestions: getQuestionCount(battle.category)
        });

        // Check if time ran out due to penalty
        if (battle.challengerTime <= 0) {
            this.endBattle(roomCode, battle.defenderId);
        } else if (battle.defenderTime <= 0) {
            this.endBattle(roomCode, battle.challengerId);
        }
    }

    // Host advances to next slide
    nextSlide(roomCode) {
        const room = this.roomManager.getRoom(roomCode);
        if (!room || !room.gameState || !room.gameState.battle) return;

        const battle = room.gameState.battle;
        battle.currentSlide++;

        // Get next question
        const nextQuestion = getQuestion(battle.category, battle.currentSlide);

        this.io.to(roomCode).emit('slide-advanced', {
            slideNumber: battle.currentSlide,
            activePlayer: battle.activePlayer,
            question: nextQuestion?.question || 'No more questions',
            correctAnswer: nextQuestion?.answer || 'Unknown',
            questionNumber: battle.currentSlide + 1,
            totalQuestions: getQuestionCount(battle.category)
        });
    }

    // End battle
    endBattle(roomCode, winnerId) {
        const room = this.roomManager.getRoom(roomCode);
        if (!room || !room.gameState || !room.gameState.battle) return;

        // Clear timer
        if (this.timers.has(roomCode)) {
            clearInterval(this.timers.get(roomCode));
            this.timers.delete(roomCode);
        }

        const battle = room.gameState.battle;
        const loserId = winnerId === battle.challengerId ? battle.defenderId : battle.challengerId;

        const winner = room.gameState.players.find(p => p.id === winnerId);
        const loser = room.gameState.players.find(p => p.id === loserId);

        // Transfer all loser's territories to winner
        const { grid, gridSize } = room.gameState;
        for (let row = 0; row < gridSize.rows; row++) {
            for (let col = 0; col < gridSize.cols; col++) {
                if (grid[row][col].ownerId === loserId) {
                    grid[row][col].ownerId = winnerId;
                    grid[row][col].ownerName = winner.name;
                    grid[row][col].character = winner.character;
                    // Category stays the same (territory's category)
                }
            }
        }

        // Update territory counts
        this.updateTerritoryCount(room);

        // Eliminate loser
        loser.eliminated = true;
        loser.territories = 0;

        // Check for game over
        const activePlayers = room.gameState.players.filter(p => !p.eliminated);

        room.gameState.battle = null;
        room.gameState.phase = 'post-battle';

        this.io.to(roomCode).emit('battle-end', {
            winnerId,
            winnerName: winner.name,
            loserId,
            loserName: loser.name,
            grid,
            players: room.gameState.players,
            gameOver: activePlayers.length === 1
        });

        if (activePlayers.length === 1) {
            this.io.to(roomCode).emit('game-over', {
                winner: activePlayers[0]
            });
        }
    }

    // Update territory count for all players
    updateTerritoryCount(room) {
        const { grid, gridSize, players } = room.gameState;

        // Reset counts
        players.forEach(p => p.territories = 0);

        // Count
        for (let row = 0; row < gridSize.rows; row++) {
            for (let col = 0; col < gridSize.cols; col++) {
                const owner = players.find(p => p.id === grid[row][col].ownerId);
                if (owner) owner.territories++;
            }
        }
    }

    // Handle winner's decision to challenge again or pass
    handleChallengeDecision(roomCode, playerId, challengeAgain) {
        const room = this.roomManager.getRoom(roomCode);
        if (!room || !room.gameState) return;

        const activePlayers = room.gameState.players.filter(p => !p.eliminated);

        if (challengeAgain) {
            // Same player challenges again
            room.gameState.currentChallenger = playerId;
            room.gameState.phase = 'selecting-opponent';

            const challenger = room.gameState.players.find(p => p.id === playerId);
            const adjacentOpponents = this.getAdjacentOpponents(room, playerId);

            this.io.to(roomCode).emit('select-opponent', {
                challengerId: playerId,
                challengerName: challenger.name,
                availableOpponents: adjacentOpponents.map(id => {
                    const p = room.gameState.players.find(pl => pl.id === id);
                    return { id, name: p.name, character: p.character };
                }),
                grid: room.gameState.grid,
                gridSize: room.gameState.gridSize,
                players: room.gameState.players
            });
        } else {
            // Pick new random challenger (excluding the winner who just passed)
            const eligiblePlayers = activePlayers.filter(p => p.id !== playerId);
            // If only the winner is left, they must continue
            const candidates = eligiblePlayers.length > 0 ? eligiblePlayers : activePlayers;
            const randomIndex = Math.floor(Math.random() * candidates.length);
            const newChallenger = candidates[randomIndex];

            room.gameState.currentChallenger = newChallenger.id;
            room.gameState.phase = 'selecting-opponent';

            const adjacentOpponents = this.getAdjacentOpponents(room, newChallenger.id);

            this.io.to(roomCode).emit('new-challenger', {
                challengerId: newChallenger.id,
                challengerName: newChallenger.name,
                availableOpponents: adjacentOpponents.map(id => {
                    const p = room.gameState.players.find(pl => pl.id === id);
                    return { id, name: p.name, character: p.character };
                }),
                grid: room.gameState.grid,
                gridSize: room.gameState.gridSize,
                players: room.gameState.players
            });
        }
    }
}

module.exports = GameManager;

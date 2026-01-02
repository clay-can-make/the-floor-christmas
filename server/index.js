const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const RoomManager = require('./rooms');
const GameManager = require('./game');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 3000;

// Get local IP address (prefer 192.168.x.x over VPN addresses)
function getLocalIP() {
    const { networkInterfaces } = require('os');
    const nets = networkInterfaces();
    let fallbackIP = null;

    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            if (net.family === 'IPv4' && !net.internal) {
                // Prefer 192.168.x.x (typical home network)
                if (net.address.startsWith('192.168')) {
                    return net.address;
                }
                // Keep 10.x.x.x as fallback (could be VPN)
                if (net.address.startsWith('10.') && !fallbackIP) {
                    fallbackIP = net.address;
                }
            }
        }
    }
    return fallbackIP || 'localhost';
}

const LOCAL_IP = getLocalIP();

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.get('/host', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/host.html'));
});

app.get('/controller', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/controller.html'));
});

app.get('/play', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/player.html'));
});

app.get('/audience', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/audience.html'));
});

// Initialize managers
const roomManager = new RoomManager();
const gameManager = new GameManager(io, roomManager);

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

    // ============ ROOM EVENTS ============

    // Host creates a new room
    socket.on('create-room', (callback) => {
        const room = roomManager.createRoom(socket.id);
        socket.join(room.code);
        socket.roomCode = room.code;
        socket.role = 'host';

        console.log(`Room created: ${room.code} by ${socket.id}`);
        callback({ success: true, roomCode: room.code });
    });

    // Host rejoins after reconnection
    socket.on('rejoin-as-host', ({ roomCode }, callback) => {
        const code = roomCode.toUpperCase();
        const room = roomManager.getRoom(code);

        if (!room) {
            return callback({ success: false, error: 'Room not found' });
        }

        // Verify this is the original host or allow rejoin
        socket.join(code);
        socket.roomCode = code;
        socket.role = 'host';

        console.log(`Host rejoined room: ${code}`);
        callback({ success: true });
    });

    // Display/TV joins a room to receive updates
    socket.on('join-as-display', ({ roomCode }, callback) => {
        const code = roomCode.toUpperCase();
        const room = roomManager.getRoom(code);

        if (!room) {
            return callback({ success: false, error: 'Room not found' });
        }

        socket.join(code);
        socket.roomCode = code;
        socket.role = 'display';

        console.log(`Display joined room: ${code}`);

        // Return current state so display can sync
        callback({
            success: true,
            players: room.players,
            gameState: room.gameStarted ? room.gameState : null
        });
    });

    // Player joins a room
    socket.on('join-room', ({ roomCode, playerName, deviceId }, callback) => {
        const code = roomCode.toUpperCase();
        const room = roomManager.getRoom(code);

        if (!room) {
            callback({ success: false, error: 'Room not found' });
            return;
        }

        if (room.gameStarted) {
            // Join as audience if game already started
            socket.join(code);
            socket.roomCode = code;
            socket.role = 'audience';
            room.audience.push({ id: socket.id, name: playerName });

            callback({ success: true, role: 'audience' });
            io.to(code).emit('audience-joined', { name: playerName });
            return;
        }

        if (room.players.length >= 24) {
            // Join as audience if room is full
            socket.join(code);
            socket.roomCode = code;
            socket.role = 'audience';
            room.audience.push({ id: socket.id, name: playerName });

            callback({ success: true, role: 'audience' });
            io.to(code).emit('audience-joined', { name: playerName });
            return;
        }

        // Join as player
        socket.join(code);
        socket.roomCode = code;
        socket.role = 'player';

        const player = {
            id: socket.id,
            name: playerName,
            character: null,
            category: null,
            ready: false,
            territories: 0,
            eliminated: false,
            deviceId: deviceId || null
        };

        room.players.push(player);

        // First player is the room leader
        const isRoomLeader = room.players.length === 1;

        callback({
            success: true,
            role: 'player',
            playerId: socket.id,
            availableCharacters: room.getAvailableCharacters(),
            categories: room.categories,
            isRoomLeader: isRoomLeader
        });

        // Notify host and other players
        io.to(code).emit('player-joined', {
            player: { id: socket.id, name: playerName },
            playerCount: room.players.length
        });
    });

    // Player attempts to rejoin after disconnect
    socket.on('rejoin-as-player', ({ roomCode, deviceId, playerName }, callback) => {
        const code = roomCode.toUpperCase();
        const room = roomManager.getRoom(code);

        if (!room) {
            return callback({ success: false, error: 'Room not found' });
        }

        // Find player by deviceId
        let player = room.players.find(p => p.deviceId === deviceId);

        // If not found by deviceId, try to find by name (for backwards compatibility)
        if (!player && playerName) {
            player = room.players.find(p => p.name === playerName && p.disconnected);
        }

        if (!player) {
            return callback({ success: false, error: 'Player not found in room' });
        }

        // Update player's socket ID and clear disconnected flag
        const oldSocketId = player.id;
        player.id = socket.id;
        player.disconnected = false;
        player.deviceId = deviceId;

        // Update socket info
        socket.join(code);
        socket.roomCode = code;
        socket.role = 'player';

        console.log(`Player ${player.name} rejoined room ${code} (old: ${oldSocketId}, new: ${socket.id})`);

        // If game has started, also update gameState.players
        if (room.gameState && room.gameState.players) {
            const gamePlayer = room.gameState.players.find(p => p.id === oldSocketId);
            if (gamePlayer) {
                gamePlayer.id = socket.id;
            }

            // Also update grid ownership references
            if (room.gameState.grid) {
                for (let row = 0; row < room.gameState.gridSize.rows; row++) {
                    for (let col = 0; col < room.gameState.gridSize.cols; col++) {
                        if (room.gameState.grid[row][col].ownerId === oldSocketId) {
                            room.gameState.grid[row][col].ownerId = socket.id;
                        }
                    }
                }
            }

            // Update battle references if in battle
            if (room.gameState.battle) {
                if (room.gameState.battle.challengerId === oldSocketId) {
                    room.gameState.battle.challengerId = socket.id;
                }
                if (room.gameState.battle.defenderId === oldSocketId) {
                    room.gameState.battle.defenderId = socket.id;
                }
                if (room.gameState.battle.activePlayer === oldSocketId) {
                    room.gameState.battle.activePlayer = socket.id;
                }
            }

            // Update currentChallenger/currentDefender
            if (room.gameState.currentChallenger === oldSocketId) {
                room.gameState.currentChallenger = socket.id;
            }
            if (room.gameState.currentDefender === oldSocketId) {
                room.gameState.currentDefender = socket.id;
            }
        }

        callback({ success: true });

        // Build rejoin data
        const isRoomLeader = room.players.length > 0 && room.players[0].id === socket.id;
        const rejoinData = {
            playerId: socket.id,
            playerName: player.name,
            character: player.character,
            category: player.category,
            categories: room.categories,
            availableCharacters: room.getAvailableCharacters(),
            takenCategories: room.usedCategories,
            gameStarted: room.gameStarted,
            isRoomLeader: isRoomLeader,
            readyCount: room.players.filter(p => p.ready).length,
            totalPlayers: room.players.length
        };

        // Add game state data if game has started
        if (room.gameState) {
            rejoinData.grid = room.gameState.grid;
            rejoinData.gridSize = room.gameState.gridSize;
            rejoinData.players = room.gameState.players;
            rejoinData.gamePhase = room.gameState.phase;
            rejoinData.currentChallenger = room.gameState.currentChallenger;

            // Add available opponents if it's their turn
            if (room.gameState.currentChallenger === socket.id) {
                rejoinData.availableOpponents = gameManager.getAdjacentOpponents(room, socket.id).map(id => {
                    const p = room.gameState.players.find(pl => pl.id === id);
                    return { id, name: p.name, character: p.character };
                });
            }

            // Add battle data if in battle
            if (room.gameState.battle) {
                const battle = room.gameState.battle;
                rejoinData.inBattle = battle.challengerId === socket.id || battle.defenderId === socket.id;
                if (rejoinData.inBattle) {
                    rejoinData.iAmChallenger = battle.challengerId === socket.id;
                    rejoinData.activePlayer = battle.activePlayer;

                    // Get current question
                    const { getQuestion } = require('./questions');
                    const currentQuestion = getQuestion(battle.category, battle.currentSlide);
                    rejoinData.question = currentQuestion?.question || 'Question loading...';
                }
            }
        }

        // Send rejoin success with all state
        socket.emit('rejoin-success', rejoinData);

        // Notify others that player reconnected
        io.to(code).emit('player-reconnected', {
            playerId: socket.id,
            playerName: player.name
        });
    });

    // Player selects character
    socket.on('select-character', ({ character }, callback) => {
        const room = roomManager.getRoom(socket.roomCode);
        if (!room) return callback({ success: false, error: 'Room not found' });

        const player = room.players.find(p => p.id === socket.id);
        if (!player) return callback({ success: false, error: 'Player not found' });

        if (room.usedCharacters.includes(character)) {
            return callback({ success: false, error: 'Character already taken' });
        }

        player.character = character;
        room.usedCharacters.push(character);

        callback({ success: true });
        io.to(socket.roomCode).emit('character-selected', {
            playerId: socket.id,
            character: character
        });
    });

    // Player selects category
    socket.on('select-category', ({ category }, callback) => {
        const room = roomManager.getRoom(socket.roomCode);
        if (!room) return callback({ success: false, error: 'Room not found' });

        const player = room.players.find(p => p.id === socket.id);
        if (!player) return callback({ success: false, error: 'Player not found' });

        // Handle random selection
        let selectedCategory = category;
        if (category === 'random') {
            const available = room.categories.filter(c => !room.usedCategories.includes(c.id));
            if (available.length > 0) {
                selectedCategory = available[Math.floor(Math.random() * available.length)].id;
            }
        }

        if (room.usedCategories.includes(selectedCategory)) {
            return callback({ success: false, error: 'Category already taken' });
        }

        player.category = selectedCategory;
        player.ready = true;
        room.usedCategories.push(selectedCategory);

        const readyCount = room.players.filter(p => p.ready).length;
        const totalPlayers = room.players.length;

        callback({
            success: true,
            category: selectedCategory,
            readyCount: readyCount,
            totalPlayers: totalPlayers
        });
        io.to(socket.roomCode).emit('player-ready', {
            playerId: socket.id,
            playerName: player.name,
            category: selectedCategory,
            readyCount: readyCount,
            totalPlayers: totalPlayers
        });
    });

    // ============ GAME EVENTS ============

    // Host or first player starts the game
    socket.on('start-game', (callback) => {
        const room = roomManager.getRoom(socket.roomCode);
        if (!room) return callback({ success: false, error: 'Room not found' });

        // Allow host or the first player (room leader) to start
        const isHost = socket.role === 'host';
        const isFirstPlayer = room.players.length > 0 && room.players[0].id === socket.id;

        if (!isHost && !isFirstPlayer) {
            return callback({ success: false, error: 'Only the room leader can start the game' });
        }

        const readyPlayers = room.players.filter(p => p.ready);
        if (readyPlayers.length < 2) {
            return callback({ success: false, error: 'Need at least 2 ready players' });
        }

        gameManager.startGame(socket.roomCode);
        callback({ success: true });
    });

    // Challenger selects opponent
    socket.on('select-challenge', ({ opponentId }, callback) => {
        const result = gameManager.initiateChallenge(socket.roomCode, socket.id, opponentId);
        callback(result);
    });

    // Player buzzes in
    socket.on('buzz', ({ answer }) => {
        gameManager.handleBuzz(socket.roomCode, socket.id, answer);
    });

    // Host or display confirms answer
    socket.on('confirm-answer', ({ correct }) => {
        if (socket.role !== 'host' && socket.role !== 'display') return;
        gameManager.confirmAnswer(socket.roomCode, correct);
    });

    // Player hits timer (passes turn)
    socket.on('timer-hit', () => {
        gameManager.switchTurn(socket.roomCode, socket.id);
    });

    // Player passes on current slide
    socket.on('pass', () => {
        gameManager.handlePass(socket.roomCode, socket.id);
    });

    // Host advances to next slide
    socket.on('next-slide', () => {
        if (socket.role !== 'host') return;
        gameManager.nextSlide(socket.roomCode);
    });

    // Winner decides to challenge again or pass
    socket.on('challenge-decision', ({ challengeAgain, winnerId }) => {
        gameManager.handleChallengeDecision(socket.roomCode, winnerId, challengeAgain);
    });

    // ============ DISCONNECT ============

    socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);

        if (socket.roomCode) {
            const room = roomManager.getRoom(socket.roomCode);
            if (room) {
                if (socket.role === 'host') {
                    // Host disconnected - notify all players
                    io.to(socket.roomCode).emit('host-disconnected');
                    roomManager.deleteRoom(socket.roomCode);
                } else if (socket.role === 'player') {
                    // Player disconnected
                    const playerIndex = room.players.findIndex(p => p.id === socket.id);
                    if (playerIndex !== -1) {
                        const player = room.players[playerIndex];
                        if (!room.gameStarted) {
                            // Remove from lobby
                            room.players.splice(playerIndex, 1);
                            if (player.character) {
                                room.usedCharacters = room.usedCharacters.filter(c => c !== player.character);
                            }
                            if (player.category) {
                                room.usedCategories = room.usedCategories.filter(c => c !== player.category);
                            }
                        } else {
                            // Mark as disconnected during game
                            player.disconnected = true;
                        }
                        io.to(socket.roomCode).emit('player-disconnected', {
                            playerId: socket.id,
                            playerName: player.name
                        });
                    }
                } else if (socket.role === 'audience') {
                    room.audience = room.audience.filter(a => a.id !== socket.id);
                }
            }
        }
    });
});

// Start server
server.listen(PORT, '0.0.0.0', () => {
    console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   🎄 The Floor: Christmas Edition 🎄                         ║
║                                                               ║
║   Server running!                                             ║
║                                                               ║
║   LOCAL:    http://localhost:${PORT}                            ║
║   NETWORK:  http://${LOCAL_IP}:${PORT}                          ║
║                                                               ║
║   Players should join at:                                     ║
║   👉  http://${LOCAL_IP}:${PORT}                                ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
    `);
});

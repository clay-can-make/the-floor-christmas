// Room Management for The Floor: Christmas Edition

// Default characters (placeholders until user provides images)
const DEFAULT_CHARACTERS = [
    'santa', 'elf', 'reindeer', 'snowman', 'gingerbread',
    'angel', 'penguin', 'polar-bear', 'nutcracker', 'mrs-claus',
    'candy-cane', 'christmas-tree', 'star', 'present', 'stocking',
    'wreath', 'bell', 'candle', 'sleigh', 'igloo',
    'grinch', 'rudolph', 'frosty', 'jack-frost'
];

// Default categories - matches the 24 Google Slides with content
const DEFAULT_CATEGORIES = [
    { id: 'activities', name: 'Activities', icon: '🎿' },
    { id: 'at-the-mall', name: 'At the Mall', icon: '🛍️' },
    { id: 'board-games', name: 'Board Games', icon: '🎲' },
    { id: 'christmas-albums', name: 'Christmas Albums', icon: '💿' },
    { id: 'christmas-candy', name: 'Christmas Candy', icon: '🍬' },
    { id: 'christmas-cards', name: 'Christmas Cards', icon: '💌' },
    { id: 'christmas-cartoon-characters', name: 'Christmas Cartoon Characters', icon: '🎭' },
    { id: 'christmas-cities', name: 'Christmas Cities', icon: '🏙️' },
    { id: 'christmas-gifts', name: 'Christmas Gifts', icon: '🎁' },
    { id: 'christmas-movies', name: 'Christmas Movies', icon: '🎬' },
    { id: 'christmas-song-lyrics', name: 'Christmas Song Lyrics', icon: '🎵' },
    { id: 'christmas-tv-shows', name: 'Christmas TV Shows', icon: '📺' },
    { id: 'classic-toys', name: 'Classic Toys', icon: '🧸' },
    { id: 'december-calendar', name: 'December Calendar', icon: '📅' },
    { id: 'first-christmas', name: 'First Christmas', icon: '⭐' },
    { id: 'its-cold-outside', name: "It's Cold Outside", icon: '❄️' },
    { id: 'matthew-luke', name: 'Matthew & Luke', icon: '📖' },
    { id: 'movie-lines', name: 'Movie Lines', icon: '🎥' },
    { id: 'nba', name: 'NBA', icon: '🏀' },
    { id: 'nba-stars', name: 'NBA Stars', icon: '⭐' },
    { id: 'santa-screentime', name: 'Santa Screentime', icon: '🎅' },
    { id: 'stocking-stuffers', name: 'Stocking Stuffers', icon: '🧦' },
    { id: 'toy-shopping', name: 'Toy Shopping', icon: '🛒' },
    { id: 'twas-the-night', name: "Twas the Night", icon: '🌙' }
];

class Room {
    constructor(code, hostId) {
        this.code = code;
        this.hostId = hostId;
        this.players = [];
        this.audience = [];
        this.characters = [...DEFAULT_CHARACTERS];
        this.usedCharacters = [];
        this.categories = [...DEFAULT_CATEGORIES];
        this.usedCategories = [];
        this.gameStarted = false;
        this.gameState = null;
        this.createdAt = Date.now();
    }

    getAvailableCharacters() {
        return this.characters.filter(c => !this.usedCharacters.includes(c));
    }

    getAvailableCategories() {
        return this.categories.filter(c => !this.usedCategories.includes(c.id));
    }

    getReadyPlayers() {
        return this.players.filter(p => p.ready);
    }
}

class RoomManager {
    constructor() {
        this.rooms = new Map();
        this.usedCodes = new Set();
    }

    // Generate a unique 4-character room code
    generateCode() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // Removed I and O to avoid confusion
        let code;
        let attempts = 0;

        do {
            code = '';
            for (let i = 0; i < 4; i++) {
                code += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            attempts++;
        } while (this.usedCodes.has(code) && attempts < 100);

        return code;
    }

    createRoom(hostId) {
        const code = this.generateCode();
        const room = new Room(code, hostId);

        this.rooms.set(code, room);
        this.usedCodes.add(code);

        return room;
    }

    getRoom(code) {
        return this.rooms.get(code.toUpperCase());
    }

    deleteRoom(code) {
        const room = this.rooms.get(code);
        if (room) {
            this.rooms.delete(code);
            this.usedCodes.delete(code);
            return true;
        }
        return false;
    }

    // Clean up old rooms (call periodically)
    cleanupOldRooms(maxAgeMs = 3600000) { // Default: 1 hour
        const now = Date.now();
        for (const [code, room] of this.rooms) {
            if (now - room.createdAt > maxAgeMs) {
                this.deleteRoom(code);
            }
        }
    }
}

module.exports = RoomManager;

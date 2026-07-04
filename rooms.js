const { randomQuote } = require("./quotes");

// Lobby tiers, matching the PRD thresholds.
const LOBBY_TIERS = {
  bronze: { minWpm: 25, minAccuracy: 85, maxMistakes: 20 },
  silver: { minWpm: 45, minAccuracy: 92, maxMistakes: 12 },
  gold: { minWpm: 70, minAccuracy: 97, maxMistakes: 6 },
};

const GRACE_PERIOD_MS = 6000; // no eliminations before this
const MATCH_TIMEOUT_MS = 120000; // hard stop for a round

function makeRoomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous chars
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

class Room {
  constructor(code, tier = "bronze") {
    this.code = code;
    this.tier = LOBBY_TIERS[tier] ? tier : "bronze";
    this.hostId = null;
    this.players = new Map(); // socketId -> player
    this.status = "waiting"; // waiting | countdown | active | finished
    this.quote = null;
    this.startTime = null;
    this.winnerId = null;
    this.eliminationTimer = null;
    this.timeoutTimer = null;
  }

  get thresholds() {
    return LOBBY_TIERS[this.tier];
  }

  addPlayer(socketId, name) {
    if (!this.hostId) this.hostId = socketId;
    this.players.set(socketId, {
      id: socketId,
      name: name || `Player${this.players.size + 1}`,
      wpm: 0,
      accuracy: 100,
      mistakes: 0,
      typedLength: 0,
      correctLength: 0,
      progress: 0,
      status: "waiting", // waiting | racing | eliminated | finished
      finishTime: null,
      combo: 0,
    });
  }

  removePlayer(socketId) {
    this.players.delete(socketId);
    if (this.hostId === socketId) {
      const next = this.players.keys().next();
      this.hostId = next.done ? null : next.value;
    }
  }

  isEmpty() {
    return this.players.size === 0;
  }

  publicPlayers() {
    return Array.from(this.players.values())
      .map((p) => ({ ...p }))
      .sort((a, b) => b.wpm - a.wpm);
  }

  startMatch() {
    this.quote = randomQuote();
    this.status = "active";
    this.startTime = Date.now();
    this.winnerId = null;
    for (const p of this.players.values()) {
      p.wpm = 0;
      p.accuracy = 100;
      p.mistakes = 0;
      p.typedLength = 0;
      p.correctLength = 0;
      p.progress = 0;
      p.status = "racing";
      p.finishTime = null;
      p.combo = 0;
    }
  }

  updateProgress(socketId, { typedLength, correctLength, mistakes }) {
    const p = this.players.get(socketId);
    if (!p || p.status !== "racing") return null;

    p.typedLength = typedLength;
    p.correctLength = correctLength;
    p.mistakes = mistakes;
    p.progress = this.quote
      ? Math.min(100, Math.round((correctLength / this.quote.text.length) * 100))
      : 0;
    p.accuracy =
      typedLength > 0 ? Math.round((correctLength / typedLength) * 1000) / 10 : 100;

    const elapsedMinutes = Math.max((Date.now() - this.startTime) / 60000, 1 / 60);
    p.wpm = Math.round(correctLength / 5 / elapsedMinutes);
    p.combo = mistakes === 0 && correctLength > 0 ? p.combo + 1 : 0;

    if (this.quote && correctLength >= this.quote.text.length && p.status === "racing") {
      p.status = "finished";
      p.finishTime = Date.now();
    }

    return p;
  }

  activePlayers() {
    return Array.from(this.players.values()).filter((p) => p.status === "racing");
  }

  findWinner() {
    return Array.from(this.players.values()).find(
      (p) => p.status === "finished" && p.finishTime
    );
  }
}

class RoomManager {
  constructor() {
    this.rooms = new Map();
  }

  create(tier) {
    let code = makeRoomCode();
    while (this.rooms.has(code)) code = makeRoomCode();
    const room = new Room(code, tier);
    this.rooms.set(code, room);
    return room;
  }

  get(code) {
    return this.rooms.get((code || "").toUpperCase());
  }

  delete(code) {
    this.rooms.delete(code);
  }

  // Find (or create) an open public room for quick matchmaking.
  findQuickMatch() {
    for (const room of this.rooms.values()) {
      if (room.status === "waiting" && room.players.size < 8 && room.isQuickMatch) {
        return room;
      }
    }
    const room = this.create("bronze");
    room.isQuickMatch = true;
    return room;
  }
}

module.exports = { Room, RoomManager, LOBBY_TIERS, GRACE_PERIOD_MS, MATCH_TIMEOUT_MS };

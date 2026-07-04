const http = require("http");
const express = require("express");
const cors = require("cors");
const { Server } = require("socket.io");

const { RoomManager, MATCH_TIMEOUT_MS } = require("./rooms");
const { checkEliminations } = require("./eliminationEngine");

const PORT = process.env.PORT || 4000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:3000";

const app = express();
app.use(cors({ origin: CLIENT_ORIGIN }));
app.get("/health", (_req, res) => res.json({ ok: true }));

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: CLIENT_ORIGIN, methods: ["GET", "POST"] },
});

const rooms = new RoomManager();

function broadcastRoom(room) {
  io.to(room.code).emit("room_update", {
    code: room.code,
    hostId: room.hostId,
    status: room.status,
    tier: room.tier,
    players: room.publicPlayers(),
  });
}

function broadcastLeaderboard(room) {
  io.to(room.code).emit("leaderboard_update", {
    players: room.publicPlayers(),
  });
}

function startCountdown(room) {
  room.status = "countdown";
  broadcastRoom(room);
  let count = 3;
  io.to(room.code).emit("countdown", { value: count });
  const interval = setInterval(() => {
    count -= 1;
    if (count > 0) {
      io.to(room.code).emit("countdown", { value: count });
      return;
    }
    clearInterval(interval);
    launchMatch(room);
  }, 1000);
}

function launchMatch(room) {
  room.startMatch();
  io.to(room.code).emit("match_started", {
    quote: room.quote,
    startTime: room.startTime,
    thresholds: room.thresholds,
    timeoutMs: MATCH_TIMEOUT_MS,
  });
  broadcastRoom(room);

  room.eliminationTimer = setInterval(() => {
    const eliminated = checkEliminations(room);
    for (const e of eliminated) {
      io.to(room.code).emit("player_eliminated", e);
    }
    if (eliminated.length) broadcastLeaderboard(room);

    maybeEndMatch(room);
  }, 1000);

  room.timeoutTimer = setTimeout(() => {
    endMatch(room, { reason: "timeout" });
  }, MATCH_TIMEOUT_MS);
}

function maybeEndMatch(room) {
  if (room.status !== "active") return;

  const winner = room.findWinner();
  if (winner) {
    endMatch(room, { reason: "finished", winnerId: winner.id });
    return;
  }

  const stillRacing = room.activePlayers();
  if (stillRacing.length === 0 && room.players.size > 0) {
    endMatch(room, { reason: "all_eliminated" });
  }
}

function endMatch(room, { reason, winnerId }) {
  if (room.status !== "active") return;
  room.status = "finished";
  clearInterval(room.eliminationTimer);
  clearTimeout(room.timeoutTimer);

  const results = room.publicPlayers();
  const winner =
    (winnerId && room.players.get(winnerId)) ||
    results.find((p) => p.status !== "eliminated") ||
    results[0] ||
    null;

  room.winnerId = winner ? winner.id : null;

  io.to(room.code).emit("match_ended", {
    reason,
    winner,
    results,
  });
  broadcastRoom(room);
}

io.on("connection", (socket) => {
  socket.on("create_room", ({ name, tier } = {}, ack) => {
    const room = rooms.create(tier);
    room.addPlayer(socket.id, name);
    socket.join(room.code);
    broadcastRoom(room);
    if (typeof ack === "function") ack({ ok: true, code: room.code });
  });

  socket.on("quick_match", ({ name } = {}, ack) => {
    const room = rooms.findQuickMatch();
    room.addPlayer(socket.id, name);
    socket.join(room.code);
    broadcastRoom(room);
    if (typeof ack === "function") ack({ ok: true, code: room.code });
  });

  socket.on("join_room", ({ code, name } = {}, ack) => {
    const room = rooms.get(code);
    if (!room) {
      if (typeof ack === "function") ack({ ok: false, error: "Room not found" });
      return;
    }
    if (room.status !== "waiting") {
      if (typeof ack === "function") ack({ ok: false, error: "Match already in progress" });
      return;
    }
    room.addPlayer(socket.id, name);
    socket.join(room.code);
    broadcastRoom(room);
    if (typeof ack === "function") ack({ ok: true, code: room.code });
  });

  socket.on("start_match", ({ code } = {}) => {
    const room = rooms.get(code);
    if (!room) return;
    if (socket.id !== room.hostId) return; // only host can start
    if (room.status !== "waiting") return;
    if (room.players.size < 1) return;
    startCountdown(room);
  });

  socket.on("progress_update", ({ code, typedLength, correctLength, mistakes } = {}) => {
    const room = rooms.get(code);
    if (!room || room.status !== "active") return;
    const player = room.updateProgress(socket.id, { typedLength, correctLength, mistakes });
    if (!player) return;
    broadcastLeaderboard(room);
    maybeEndMatch(room);
  });

  socket.on("leave_room", ({ code } = {}) => {
    handleLeave(socket, code);
  });

  socket.on("disconnect", () => {
    for (const room of rooms.rooms.values()) {
      if (room.players.has(socket.id)) {
        handleLeave(socket, room.code);
      }
    }
  });

  function handleLeave(socket, code) {
    const room = rooms.get(code);
    if (!room) return;
    room.removePlayer(socket.id);
    socket.leave(room.code);
    if (room.isEmpty()) {
      clearInterval(room.eliminationTimer);
      clearTimeout(room.timeoutTimer);
      rooms.delete(room.code);
      return;
    }
    broadcastRoom(room);
    maybeEndMatch(room);
  }
});

server.listen(PORT, () => {
  console.log(`TypeArena realtime server listening on :${PORT}`);
});

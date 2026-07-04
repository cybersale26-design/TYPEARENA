const { GRACE_PERIOD_MS } = require("./rooms");

// Runs once per tick for an active room. Mutates player status in place
// and returns a list of players eliminated on this tick.
function checkEliminations(room) {
  if (room.status !== "active" || !room.startTime) return [];

  const elapsed = Date.now() - room.startTime;
  if (elapsed < GRACE_PERIOD_MS) return [];

  const { minWpm, minAccuracy, maxMistakes } = room.thresholds;
  const eliminated = [];

  for (const p of room.players.values()) {
    if (p.status !== "racing") continue;
    // Only judge players once they've actually started typing, so an idle
    // player isn't instantly flagged before their first keystroke lands.
    if (p.typedLength === 0) continue;

    const failedWpm = p.wpm < minWpm;
    const failedAccuracy = p.accuracy < minAccuracy;
    const failedMistakes = p.mistakes > maxMistakes;

    if (failedWpm || failedAccuracy || failedMistakes) {
      p.status = "eliminated";
      eliminated.push({
        id: p.id,
        name: p.name,
        wpm: p.wpm,
        accuracy: p.accuracy,
        reason: failedMistakes
          ? "too many mistakes"
          : failedAccuracy
          ? "accuracy too low"
          : "speed too low",
      });
    }
  }

  return eliminated;
}

module.exports = { checkEliminations };

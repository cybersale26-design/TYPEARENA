"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Hud } from "@/components/Hud";
import { PlayerStatsPanel } from "@/components/PlayerStatsPanel";
import { TypingArena } from "@/components/TypingArena";
import { Leaderboard } from "@/components/Leaderboard";
import { getSocket } from "@/lib/socket";
import type {
  EliminationPayload,
  MatchEndedPayload,
  MatchStartedPayload,
  Player,
  RoomUpdatePayload,
} from "@/lib/types";

export default function ArenaPage() {
  const params = useParams<{ roomCode: string }>();
  const router = useRouter();
  const roomCode = (params.roomCode || "").toUpperCase();

  const [selfId, setSelfId] = useState("");
  const [status, setStatus] = useState("waiting");
  const [countdown, setCountdown] = useState<number | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [match, setMatch] = useState<MatchStartedPayload | null>(null);
  const [eliminations, setEliminations] = useState<EliminationPayload[]>([]);
  const [selfEliminated, setSelfEliminated] = useState(false);
  const lastSent = useRef<number>(0);

  useEffect(() => {
    const socket = getSocket();
    setSelfId(socket.id || "");

    const onRoomUpdate = (payload: RoomUpdatePayload) => {
      if (payload.code !== roomCode) return;
      setStatus(payload.status);
      setPlayers(payload.players);
    };
    const onCountdown = ({ value }: { value: number }) => setCountdown(value);
    const onMatchStarted = (payload: MatchStartedPayload) => {
      setMatch(payload);
      setCountdown(null);
      setEliminations([]);
      setSelfEliminated(false);
      setStatus("active");
    };
    const onLeaderboard = ({ players }: { players: Player[] }) => {
      setPlayers(players);
      const me = players.find((p) => p.id === socket.id);
      if (me?.status === "eliminated") setSelfEliminated(true);
    };
    const onEliminated = (payload: EliminationPayload) => {
      setEliminations((prev) => [...prev, payload]);
      if (payload.id === socket.id) setSelfEliminated(true);
    };
    const onMatchEnded = (payload: MatchEndedPayload) => {
      setStatus("finished");
      sessionStorage.setItem("typearena:results", JSON.stringify(payload));
      sessionStorage.setItem("typearena:selfId", socket.id || "");
      router.push("/victory");
    };

    socket.on("room_update", onRoomUpdate);
    socket.on("countdown", onCountdown);
    socket.on("match_started", onMatchStarted);
    socket.on("leaderboard_update", onLeaderboard);
    socket.on("player_eliminated", onEliminated);
    socket.on("match_ended", onMatchEnded);

    return () => {
      socket.off("room_update", onRoomUpdate);
      socket.off("countdown", onCountdown);
      socket.off("match_started", onMatchStarted);
      socket.off("leaderboard_update", onLeaderboard);
      socket.off("player_eliminated", onEliminated);
      socket.off("match_ended", onMatchEnded);
    };
  }, [roomCode, router]);

  const handleProgress = (payload: { typedLength: number; correctLength: number; mistakes: number }) => {
    const now = Date.now();
    if (now - lastSent.current < 150) return; // throttle to ~6-7 updates/sec
    lastSent.current = now;
    getSocket().emit("progress_update", { code: roomCode, ...payload });
  };

  const self = players.find((p) => p.id === selfId);

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-6 py-6">
      <Hud
        roomCode={roomCode}
        startTime={match?.startTime ?? null}
        timeoutMs={match?.timeoutMs ?? 120000}
        status={status}
      />

      <AnimatePresence>
        {countdown !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-void/80 backdrop-blur-sm"
          >
            <motion.span
              key={countdown}
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1.2, opacity: 1 }}
              exit={{ scale: 1.8, opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="font-display text-9xl text-cyan-arena text-stroke-glow"
            >
              {countdown}
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr_300px]">
        <PlayerStatsPanel player={self} />

        <div>
          {match ? (
            <TypingArena
              quote={match.quote}
              disabled={selfEliminated || status !== "active"}
              onProgress={handleProgress}
            />
          ) : (
            <div className="flex h-64 items-center justify-center rounded-2xl border border-white/10 text-white/40">
              Waiting for the host to start the match…
            </div>
          )}
          {selfEliminated && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 rounded-xl border border-danger/50 bg-danger/10 p-4 text-center shadow-glow-danger"
            >
              <span className="font-display text-2xl text-danger">ELIMINATED</span>
              <p className="mt-1 text-sm text-white/60">You can still spectate the rest of the round.</p>
            </motion.div>
          )}
        </div>

        <Leaderboard players={players} selfId={selfId} eliminations={eliminations} />
      </div>
    </main>
  );
}

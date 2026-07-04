"use client";

const NAME_KEY = "typearena:name";
const ROOM_KEY = "typearena:room";

export function savePlayerName(name: string) {
  sessionStorage.setItem(NAME_KEY, name);
}

export function getPlayerName(): string {
  if (typeof window === "undefined") return "";
  return sessionStorage.getItem(NAME_KEY) || "Player";
}

export function saveRoomCode(code: string) {
  sessionStorage.setItem(ROOM_KEY, code);
}

export function getRoomCode(): string {
  if (typeof window === "undefined") return "";
  return sessionStorage.getItem(ROOM_KEY) || "";
}

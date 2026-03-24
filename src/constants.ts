import { BingoColors } from "./types";

export const DEFAULT_COLORS: BingoColors = {
  background: "#f8fafc",
  text: "#1e293b",
  cell: "#ffffff",
  preview: "#fde047",
  outline: "#3b82f6",
  selected: "#22c55e",
};

export const STORAGE_KEY_COLORS = "skolechips_bingo_colors";
export const STORAGE_KEY_GAME_STATE = "skolechips_bingo_state";

export const BINGO_EMOJIS = [
  // --- DYR (30) ---
  // Husdyr & Kæledyr
  "🐶", "🐱", "🐭", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯", "🦁",
  "🐮", "🐷", "🐵", "🐘", "🦒", "🦘", "🐎", "🐑", "🐪", "🐔",
  // Fugle, Insekter & Vanddyr
  "🦆", "🦉", "🐝", "🦋", "🐸", "🐢", "🐍", "🐙", "🦈", "🐟",

  // --- MAD & DRIKKE (25) ---
  // Frugt & Grønt
  "🍎", "🍌", "🍉", "🍇", "🍓", "🍍", "🥝", "🍅", "🌽", "🥕", "🥦",
  // Snacks & Måltider
  "🥨", "🧀", "🥞", "🍕", "🍔", "🍟", "🌮", "🍦", "🍩", "🍪", "🍫", "🍿", "🥤", "🍭",

  // --- NATUR & STEDER (15) ---
  // Elementer & Vejr
  "🌍", "☀️", "🌈", "🌲", "🌻", "🍄", "🌵", "🌊", "🌋", "🏔️",
  // Landmærker & Ophold
  "🏝️", "🏠", "⛺", "🎡", "🎢",

  // --- OBJEKTER & AKTIVITET (10) ---
  "🧸", "📚", "💻", "📱", "🎸", "🎁", "🏆", "🎈", "⚽", "🏀",

  // --- TRANSPORT (10) ---
  "✈️", "🚀", "🚁", "🚢", "🚗", "🚕", "🚌", "🚑", "🚒", "🚲"
];

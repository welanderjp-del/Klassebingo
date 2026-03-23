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

export const BINGO_EMOJIS = [
  // Dyr (30)
  "🐶", "🐱", "🐭", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯", "🦁",
  "🐮", "🐷", "🐸", "🐵", "🐔", "🐧", "🐦", "🦆", "🦉", "🐝",
  "🦋", "🐢", "🐍", "🐙", "🦈", "🐘", "🦒", "🦘", "🐎", "🐑",
  // Frugt & Mad (30)
  "🍎", "🍐", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", "🍒", "🍍",
  "🥝", "🍅", "🌽", "🥕", "🥦", "🥨", "🧀", "🥞", "🍕", "🍔",
  "🍟", "🌮", "🍦", "🍩", "🍪", "🍫", "🍿", "🥤", "🧃", "🥛",
  // Objekter & Steder (30)
  "🏠", "🏢", "🏫", "🏥", "🏦", "🏨", "⛪", "🕌", "⛺", "🎡",
  "🎢", "🚢", "✈️", "🚀", "🚁", "🚗", "🚕", "🚌", "🚑", "🚒",
  "🚲", "🛴", "⚽", "🏀", "🎾", "🎸", "🎨", "📚", "💻", "📱"
];

export interface BingoColors {
  background: string;
  text: string;
  cell: string;
  preview: string;
  outline: string;
  selected: string;
}

export type BingoState = {
  drawnNumbers: number[];
  currentNumber: number | null;
  previousNumber: number | null;
};

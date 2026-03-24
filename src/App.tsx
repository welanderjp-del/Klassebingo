import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Settings, RotateCcw, Undo2, Play, X, RefreshCw, Printer, Hash, Smile, Shuffle } from "lucide-react";
import { BingoColors, GameMode } from "./types";
import { DEFAULT_COLORS, STORAGE_KEY_COLORS, BINGO_EMOJIS } from "./constants";

export default function App() {
  // --- State ---
  const [drawnNumbers, setDrawnNumbers] = useState<number[]>([]);
  const [currentNumber, setCurrentNumber] = useState<number | null>(null);
  const [previousNumber, setPreviousNumber] = useState<number | null>(null);
  
  const [gameMode, setGameMode] = useState<GameMode>("numbers");
  const [isAnimating, setIsAnimating] = useState(false);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printCount, setPrintCount] = useState(12);
  
  const [colors, setColors] = useState<BingoColors>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_COLORS);
    return saved ? JSON.parse(saved) : DEFAULT_COLORS;
  });

  // --- Refs for Animation Control ---
  const animationRef = useRef<number | null>(null);
  const stopRequestedRef = useRef(false);

  // --- Persistence ---
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_COLORS, JSON.stringify(colors));
  }, [colors]);

  // --- Logic ---
  const resetGame = () => {
    if (isAnimating) return;
    if (confirm("Er du sikker på, at du vil nulstille spillet?")) {
      setDrawnNumbers([]);
      setCurrentNumber(null);
      setPreviousNumber(null);
    }
  };

  const undoLast = () => {
    if (isAnimating || drawnNumbers.length === 0) return;
    const newDrawn = [...drawnNumbers];
    newDrawn.pop();
    setDrawnNumbers(newDrawn);
    setCurrentNumber(newDrawn.length > 0 ? newDrawn[newDrawn.length - 1] : null);
    setPreviousNumber(newDrawn.length > 1 ? newDrawn[newDrawn.length - 2] : null);
  };

  const toggleNumber = (num: number) => {
    if (isAnimating) return;
    if (drawnNumbers.includes(num)) {
      const newDrawn = drawnNumbers.filter(n => n !== num);
      setDrawnNumbers(newDrawn);
      setCurrentNumber(newDrawn.length > 0 ? newDrawn[newDrawn.length - 1] : null);
      setPreviousNumber(newDrawn.length > 1 ? newDrawn[newDrawn.length - 2] : null);
    } else {
      const newDrawn = [...drawnNumbers, num];
      setDrawnNumbers(newDrawn);
      setPreviousNumber(currentNumber);
      setCurrentNumber(num);
    }
  };

  const getDisplayValue = (num: number | null) => {
    if (num === null) return "--";
    if (gameMode === "emojis") return BINGO_EMOJIS[num - 1];
    if (gameMode === "mixed") {
      const row = Math.floor((num - 1) / 10);
      const isEmoji = row % 2 === 0 ? num % 2 !== 0 : num % 2 === 0;
      return isEmoji ? BINGO_EMOJIS[num - 1] : num;
    }
    return num;
  };

  const drawNumber = useCallback(async () => {
    if (isAnimating) {
      stopRequestedRef.current = true;
      return;
    }

    const available = Array.from({ length: 90 }, (_, i) => i + 1).filter(
      n => !drawnNumbers.includes(n)
    );

    if (available.length === 0) {
      alert("Alle tal er trukket!");
      return;
    }

    setIsAnimating(true);
    stopRequestedRef.current = false;

    const duration = 4000;
    const startTime = Date.now();
    let lastTick = startTime;
    
    let currentIndex = Math.floor(Math.random() * 90) + 1;

    const animate = async () => {
      const now = Date.now();
      const elapsed = now - startTime;
      
      if (stopRequestedRef.current || elapsed >= duration) {
        let finalNum = currentIndex;
        
        if (!stopRequestedRef.current && Math.random() < 0.1) {
          setPreviewIndex(currentIndex);
          await new Promise(resolve => setTimeout(resolve, 1500));
          currentIndex = (currentIndex % 90) + 1;
          setPreviewIndex(currentIndex);
          await new Promise(resolve => setTimeout(resolve, 200));
          finalNum = currentIndex;
        }

        while (drawnNumbers.includes(finalNum)) {
          finalNum = (finalNum % 90) + 1;
        }

        setDrawnNumbers(prev => [...prev, finalNum]);
        setPreviousNumber(currentNumber);
        setCurrentNumber(finalNum);
        setIsAnimating(false);
        setPreviewIndex(null);
        return;
      }

      const t = elapsed / duration;
      const easeOut = t * (2 - t);
      const baseInterval = 50;
      const maxInterval = 500;
      const currentInterval = baseInterval + (maxInterval - baseInterval) * easeOut;

      if (now - lastTick >= currentInterval) {
        currentIndex = (currentIndex % 90) + 1;
        setPreviewIndex(currentIndex);
        lastTick = now;
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
  }, [drawnNumbers, currentNumber, isAnimating]);

  useEffect(() => {
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  const resetColors = () => {
    setColors(DEFAULT_COLORS);
  };

  // --- Bankoplad Generation ---
  const generateBankoplad = () => {
    const grid: (number | null)[][] = Array.from({ length: 3 }, () => Array(9).fill(null));
    
    // For each row, pick 5 columns to fill
    for (let r = 0; r < 3; r++) {
      const cols = Array.from({ length: 9 }, (_, i) => i);
      const selectedCols = [];
      for (let i = 0; i < 5; i++) {
        const idx = Math.floor(Math.random() * cols.length);
        selectedCols.push(cols.splice(idx, 1)[0]);
      }
      
      selectedCols.forEach(c => {
        // Range for column c: (c*10 + 1) to (c*10 + 10)
        const min = c * 10 + 1;
        const max = c * 10 + 10;
        let num = Math.floor(Math.random() * (max - min + 1)) + min;
        
        // Ensure no duplicates in the same column across rows
        while (grid.some(row => row[c] === num)) {
          num = Math.floor(Math.random() * (max - min + 1)) + min;
        }
        grid[r][c] = num;
      });
    }

    // Sort columns
    for (let c = 0; c < 9; c++) {
      const colValues = grid.map(row => row[c]).filter(v => v !== null) as number[];
      colValues.sort((a, b) => a - b);
      let valIdx = 0;
      for (let r = 0; r < 3; r++) {
        if (grid[r][c] !== null) {
          grid[r][c] = colValues[valIdx++];
        }
      }
    }

    return grid;
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div 
      className="h-screen w-screen font-sans transition-colors duration-300 flex flex-col overflow-hidden print:h-auto print:w-auto print:overflow-visible"
      style={{ backgroundColor: colors.background, color: colors.text }}
    >
      {/* Header - Minimalist */}
      <header className="px-6 py-3 flex justify-between items-center border-b border-black/5 shrink-0 print:hidden">
        <div className="flex items-center gap-6">
          <a 
            href="https://skolechips.dk" 
            className="flex items-center gap-2 hover:opacity-70 transition-opacity"
          >
            <img 
              src="https://res.cloudinary.com/dtw8jfk0k/image/upload/v1774287946/ikon_m2x8mj.png" 
              alt="Skolechips Logo" 
              className="h-7 w-auto"
              referrerPolicy="no-referrer"
            />
            <h1 className="text-lg font-bold tracking-tight uppercase opacity-80">Klassebingo</h1>
          </a>

          {/* Mode Selector */}
          <div className="flex bg-black/5 p-1 rounded-lg gap-1">
            <button
              onClick={() => setGameMode("numbers")}
              className={`px-3 py-1 rounded-md text-sm font-semibold flex items-center gap-2 transition-all ${gameMode === "numbers" ? "bg-white shadow-sm" : "opacity-50 hover:opacity-80"}`}
            >
              <Hash size={16} /> Tal
            </button>
            <button
              onClick={() => setGameMode("emojis")}
              className={`px-3 py-1 rounded-md text-sm font-semibold flex items-center gap-2 transition-all ${gameMode === "emojis" ? "bg-white shadow-sm" : "opacity-50 hover:opacity-80"}`}
            >
              <Smile size={16} /> Emojis
            </button>
            <button
              onClick={() => setGameMode("mixed")}
              className={`px-3 py-1 rounded-md text-sm font-semibold flex items-center gap-2 transition-all ${gameMode === "mixed" ? "bg-white shadow-sm" : "opacity-50 hover:opacity-80"}`}
            >
              <Shuffle size={16} /> Blandet
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowPrintModal(true)}
            className="p-2 rounded-full hover:bg-black/5 transition-colors"
            title="Print plader"
          >
            <Printer size={20} />
          </button>
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded-full hover:bg-black/5 transition-colors"
            title="Indstillinger"
          >
            <Settings size={20} />
          </button>
        </div>
      </header>

      {/* Main Content - Scaled to fit */}
      <main className="flex-1 flex flex-col p-4 gap-4 min-h-0 overflow-hidden print:hidden">
        
        {/* Top Section: Display & Controls */}
        <div className="grid grid-cols-3 items-center px-4 shrink-0 h-28">
          {/* Left: Draw & Previous */}
          <div className="flex items-center gap-6 justify-self-start">
            <button
              onClick={drawNumber}
              className="py-3 px-8 min-w-[160px] rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm"
              style={{ backgroundColor: colors.outline, color: '#fff' }}
            >
              {isAnimating ? <X size={20} /> : <Play size={20} />}
              {isAnimating ? "Stop" : "Træk tal"}
            </button>
            <div className="flex flex-col leading-tight w-16">
              <span className="text-[10px] uppercase font-bold opacity-40">Forrige</span>
              <div className="text-2xl font-mono font-bold opacity-80 truncate">
                {getDisplayValue(previousNumber)}
              </div>
            </div>
          </div>

          {/* Middle: Current Large Display */}
          <div className="flex justify-center items-center h-full">
            <div className="min-w-[120px] flex justify-center">
              <AnimatePresence mode="wait">
                <motion.div 
                  key={currentNumber + (gameMode)}
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -10, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-7xl font-black font-mono tracking-tighter"
                >
                  {getDisplayValue(currentNumber)}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Right: Undo & Reset */}
          <div className="flex items-center gap-3 justify-self-end">
            <button
              onClick={undoLast}
              disabled={isAnimating || drawnNumbers.length === 0}
              className="p-2.5 rounded-lg hover:bg-black/5 transition-colors disabled:opacity-20"
              title="Fortryd"
            >
              <Undo2 size={20} />
            </button>
            <button
              onClick={resetGame}
              disabled={isAnimating}
              className="p-2.5 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors disabled:opacity-20"
              title="Nulstil spil"
            >
              <RotateCcw size={20} />
            </button>
          </div>
        </div>

        {/* Bingo Grid - Flexible to fill space */}
        <div 
          className="flex-1 min-h-0 w-full grid grid-cols-10 gap-1"
          style={{ gridTemplateRows: 'repeat(9, 1fr)' }}
        >
          {Array.from({ length: 90 }, (_, i) => i + 1).map(num => {
            const isDrawn = drawnNumbers.includes(num);
            const isPreview = previewIndex === num;
            const isCurrent = currentNumber === num;

            return (
              <button
                key={num}
                onClick={() => toggleNumber(num)}
                className="flex items-center justify-center text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold rounded-md transition-all border p-0.5 overflow-hidden"
                style={{
                  backgroundColor: isPreview ? colors.preview : (isDrawn ? colors.selected : colors.cell),
                  borderColor: isPreview || isCurrent ? colors.outline : 'transparent',
                  color: isDrawn || isPreview ? '#fff' : colors.text,
                  opacity: isDrawn && !isCurrent ? 0.3 : 1,
                  transform: isPreview ? 'scale(1.05)' : 'scale(1)',
                  zIndex: isPreview ? 10 : 1,
                }}
              >
                <span className="leading-none select-none">{getDisplayValue(num)}</span>
              </button>
            );
          })}
        </div>
      </main>

      {/* Print View - Only visible when printing */}
      <div className="hidden print:block">
        <div className="flex flex-col">
          {Array.from({ length: Math.ceil(printCount / 4) }).map((_, pageIdx) => (
            <div 
              key={pageIdx} 
              className={`flex flex-col gap-4 p-8 ${pageIdx < Math.ceil(printCount / 4) - 1 ? "break-after-page" : ""}`}
            >
              {Array.from({ length: 4 }).map((_, cardIdx) => {
                const globalCardIdx = pageIdx * 4 + cardIdx;
                if (globalCardIdx >= printCount) return null;
                const grid = generateBankoplad();
                return (
                  <div key={cardIdx} className="border-[3px] border-slate-400 p-3 rounded-xl bg-white flex flex-col h-fit overflow-hidden">
                    <div className="flex justify-between items-center mb-1 px-1">
                      <span className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Skolechips Klassebingo</span>
                      <span className="text-[10px] font-mono font-bold text-slate-500">PLADE #{globalCardIdx + 1}</span>
                    </div>
                    <div className="grid grid-cols-9 border-t-[2px] border-l-[2px] border-slate-300">
                      {grid.map((row, r) => (
                        row.map((val, c) => (
                          <div 
                            key={`${r}-${c}`} 
                            className="aspect-[1.25/1] border-r-[2px] border-b-[2px] border-slate-300 flex items-center justify-center text-4xl font-bold bg-white overflow-hidden"
                          >
                            <span className="leading-none text-slate-800">{val !== null ? getDisplayValue(val) : ""}</span>
                          </div>
                        ))
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Print Modal */}
      <AnimatePresence>
        {showPrintModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4 print:hidden">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl flex flex-col gap-6"
              style={{ color: '#1e293b' }}
            >
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Print Bingoplader</h2>
                <button onClick={() => setShowPrintModal(false)} className="p-1 hover:bg-gray-100 rounded-full">
                  <X size={24} />
                </button>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold opacity-60">Antal plader i alt</label>
                <div className="flex items-center gap-4">
                  <input 
                    type="range" 
                    min="1" 
                    max="100" 
                    value={printCount}
                    onChange={(e) => setPrintCount(parseInt(e.target.value))}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                  <span className="text-xl font-bold w-12 text-center">{printCount}</span>
                </div>
                <p className="text-xs opacity-50 italic">Dette vil fylde {Math.ceil(printCount / 4)} sider (4 plader pr. side).</p>
              </div>

              <div className="bg-blue-50 p-4 rounded-xl flex flex-col gap-2 border border-blue-100">
                <p className="text-sm font-medium text-blue-800">
                  Pladerne vil bruge den nuværende mode: <span className="font-bold uppercase">{gameMode === "numbers" ? "Tal" : gameMode === "emojis" ? "Emojis" : "Blandet"}</span>
                </p>
                <p className="text-xs text-blue-600">
                  Hver plade er en klassisk bankoplade med 3 rækker og 9 kolonner.
                </p>
              </div>

              <button
                onClick={handlePrint}
                className="w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 bg-blue-500 text-white hover:bg-blue-600 transition-all active:scale-95 shadow-lg"
              >
                <Printer size={24} />
                Start print
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="fixed inset-y-0 right-0 w-80 bg-white shadow-2xl z-50 p-6 flex flex-col gap-6 print:hidden"
            style={{ color: '#1e293b' }}
          >
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Farveindstillinger</h2>
              <button onClick={() => setShowSettings(false)} className="p-1 hover:bg-gray-100 rounded-full">
                <X size={24} />
              </button>
            </div>

            <div className="flex flex-col gap-4 overflow-y-auto">
              {Object.entries(colors).map(([key, value]) => (
                <div key={key} className="flex flex-col gap-1">
                  <label className="text-xs uppercase font-bold opacity-60">
                    {key === 'background' && 'Baggrund'}
                    {key === 'text' && 'Talfarve (Grid)'}
                    {key === 'cell' && 'Feltfarve'}
                    {key === 'preview' && 'Blink/Preview'}
                    {key === 'outline' && 'Outline/Knap'}
                    {key === 'selected' && 'Valgte tal'}
                  </label>
                  <div className="flex gap-2 items-center">
                    <input 
                      type="color" 
                      value={value}
                      onChange={(e) => setColors(prev => ({ ...prev, [key]: e.target.value }))}
                      className="w-10 h-10 rounded cursor-pointer border-none"
                    />
                    <span className="font-mono text-sm">{value}</span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={resetColors}
              className="mt-auto py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <RefreshCw size={20} />
              Nulstil farver
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="p-4 text-center text-xs opacity-40 print:hidden">
        &copy; {new Date().getFullYear()} Skolechips Klassebingo
      </footer>
    </div>
  );
}

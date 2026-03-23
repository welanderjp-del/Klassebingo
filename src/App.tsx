import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Settings, RotateCcw, Undo2, Play, X, RefreshCw } from "lucide-react";
import { BingoColors } from "./types";
import { DEFAULT_COLORS, STORAGE_KEY_COLORS } from "./constants";

export default function App() {
  // --- State ---
  const [drawnNumbers, setDrawnNumbers] = useState<number[]>([]);
  const [currentNumber, setCurrentNumber] = useState<number | null>(null);
  const [previousNumber, setPreviousNumber] = useState<number | null>(null);
  
  const [isAnimating, setIsAnimating] = useState(false);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  
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
    
    // Start at a random index
    let currentIndex = Math.floor(Math.random() * 90) + 1;

    const animate = async () => {
      const now = Date.now();
      const elapsed = now - startTime;
      
      if (stopRequestedRef.current || elapsed >= duration) {
        // Final selection
        let finalNum = currentIndex;
        
        // 10% chance for extra move if not manually stopped
        if (!stopRequestedRef.current && Math.random() < 0.1) {
          setPreviewIndex(currentIndex);
          await new Promise(resolve => setTimeout(resolve, 1500));
          currentIndex = (currentIndex % 90) + 1;
          setPreviewIndex(currentIndex);
          await new Promise(resolve => setTimeout(resolve, 200));
          finalNum = currentIndex;
        }

        // If the final number is already drawn, find the next available one
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

      // Deacceleration logic: interval increases over time
      // Ease out quad: t * (2 - t)
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

  return (
    <div 
      className="h-screen w-screen font-sans transition-colors duration-300 flex flex-col overflow-hidden"
      style={{ backgroundColor: colors.background, color: colors.text }}
    >
      {/* Header - Minimalist */}
      <header className="px-6 py-3 flex justify-between items-center border-b border-black/5 shrink-0">
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
        
        <button 
          onClick={() => setShowSettings(!showSettings)}
          className="p-1.5 rounded-full hover:bg-black/5 transition-colors"
          title="Indstillinger"
        >
          <Settings size={20} />
        </button>
      </header>

      {/* Main Content - Scaled to fit */}
      <main className="flex-1 flex flex-col p-4 gap-4 min-h-0 overflow-hidden">
        
        {/* Top Section: Display & Controls */}
        <div className="flex items-center justify-between gap-8 px-4 shrink-0">
          {/* Left: Draw & Previous */}
          <div className="flex items-center gap-6">
            <button
              onClick={drawNumber}
              className="py-3 px-8 min-w-[160px] rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm"
              style={{ backgroundColor: colors.outline, color: '#fff' }}
            >
              {isAnimating ? <X size={20} /> : <Play size={20} />}
              {isAnimating ? "Stop" : "Træk tal"}
            </button>
            <div className="flex flex-col leading-tight">
              <span className="text-[10px] uppercase font-bold opacity-40">Forrige</span>
              <div className="text-2xl font-mono font-bold opacity-80">
                {previousNumber || "--"}
              </div>
            </div>
          </div>

          {/* Middle: Current Large Display */}
          <div className="flex-1 flex justify-center">
            <motion.div 
              key={currentNumber}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-7xl font-black font-mono tracking-tighter"
            >
              {currentNumber || "--"}
            </motion.div>
          </div>

          {/* Right: Undo & Reset */}
          <div className="flex items-center gap-3">
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
                className="flex items-center justify-center text-xs sm:text-sm md:text-base font-bold rounded-md transition-all border"
                style={{
                  backgroundColor: isPreview ? colors.preview : (isDrawn ? colors.selected : colors.cell),
                  borderColor: isPreview || isCurrent ? colors.outline : 'transparent',
                  color: isDrawn || isPreview ? '#fff' : colors.text,
                  opacity: isDrawn && !isCurrent ? 0.3 : 1,
                  transform: isPreview ? 'scale(1.05)' : 'scale(1)',
                  zIndex: isPreview ? 10 : 1,
                }}
              >
                {num}
              </button>
            );
          })}
        </div>
      </main>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="fixed inset-y-0 right-0 w-80 bg-white shadow-2xl z-50 p-6 flex flex-col gap-6"
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
      <footer className="p-4 text-center text-xs opacity-40">
        &copy; {new Date().getFullYear()} Skolechips Klassebingo
      </footer>
    </div>
  );
}

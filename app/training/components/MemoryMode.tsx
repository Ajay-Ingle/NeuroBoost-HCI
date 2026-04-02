"use client";

import { useState, useEffect, useRef } from "react";
import { AdaptiveEngine, AdaptiveSettings } from "../../lib/adaptiveEngine";
import { usePerformance } from "../../lib/PerformanceContext";

export default function MemoryMode() {
    const { addSession, progress } = usePerformance();

    // Game State
    const [isPlaying, setIsPlaying] = useState(false);
    const [gameState, setGameState] = useState<'idle' | 'showing' | 'waiting' | 'finished'>('idle');
    const [score, setScore] = useState(0);
    const [round, setRound] = useState(1);

    // Sequence State
    const [sequence, setSequence] = useState<number[]>([]);
    const [userSequence, setUserSequence] = useState<number[]>([]);
    const [activeTile, setActiveTile] = useState<number | null>(null);

    // Stats for Adaptive Engine
    const [perfectStreak, setPerfectStreak] = useState(0);
    const [failedRecalls, setFailedRecalls] = useState(0);
    const [highestLevel, setHighestLevel] = useState(1);

    // Timing
    const [sessionStartTime, setSessionStartTime] = useState(0);
    const [sessionDuration, setSessionDuration] = useState(0); // in seconds

    const [settings, setSettings] = useState<AdaptiveSettings>(
        AdaptiveEngine.getInitialSettings('memory')
    );

    const gridRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (progress.currentLevel > 1) {
            setSettings(prev => ({ ...prev, level: progress.currentLevel, sequenceLength: 2 + progress.currentLevel }));
        }
    }, [progress.currentLevel]);

    // Handle sequence generation
    const startNextRound = () => {
        const curLen = settings.sequenceLength || 3;
        const newSequence = [];
        for (let i = 0; i < curLen; i++) {
            // 9 tiles total (0-8)
            newSequence.push(Math.floor(Math.random() * 9));
        }
        setSequence(newSequence);
        setUserSequence([]);
        setGameState('showing');
        playSequence(newSequence);
    };

    const playSequence = (seq: number[]) => {
        let index = 0;
        const interval = setInterval(() => {
            setActiveTile(seq[index]);

            setTimeout(() => {
                setActiveTile(null); // Turn off briefly between pulses
            }, 500); // 500ms lit up

            index++;
            if (index >= seq.length) {
                clearInterval(interval);
                setTimeout(() => setGameState('waiting'), 600);
            }
        }, 800); // 800ms per tile cycle
    };

    const handleTileClick = (index: number) => {
        if (gameState !== 'waiting') return;

        const newUserSequence = [...userSequence, index];
        setUserSequence(newUserSequence);

        // Flash the tile briefly for feedback
        setActiveTile(index);
        setTimeout(() => setActiveTile(null), 200);

        // Validate
        const currentStepIndex = newUserSequence.length - 1;
        if (newUserSequence[currentStepIndex] !== sequence[currentStepIndex]) {
            // Failed!
            handleRoundEnd(false);
        } else if (newUserSequence.length === sequence.length) {
            // Success!
            handleRoundEnd(true);
        }
    };

    const handleRoundEnd = (success: boolean) => {
        if (success) {
            setScore(s => s + (settings.sequenceLength || 3) * 100);
            setPerfectStreak(s => s + 1);
            setFailedRecalls(0);
        } else {
            setFailedRecalls(f => f + 1);
            setPerfectStreak(0);
        }

        // Evaluate adaptive settings
        const newSettings = AdaptiveEngine.evaluateMemoryPerformance(
            settings,
            success ? perfectStreak + 1 : 0,
            success ? 0 : failedRecalls + 1
        );

        if (newSettings.level > highestLevel) setHighestLevel(newSettings.level);
        setSettings(newSettings);

        // Wait briefly before starting next round or ending if failed too many times
        setTimeout(() => {
            if (round >= 5 || (!success && failedRecalls >= 2)) {
                endGame();
            } else {
                setRound(r => r + 1);
                startNextRound();
            }
        }, 1000);
    };

    const startGame = () => {
        setIsPlaying(true);
        setScore(0);
        setRound(1);
        setPerfectStreak(0);
        setFailedRecalls(0);
        setSessionStartTime(Date.now());
        startNextRound();
    };

    const endGame = () => {
        setIsPlaying(false);
        setGameState('finished');

        // Calculate final duration
        const finalDuration = Math.floor((Date.now() - sessionStartTime) / 1000);
        setSessionDuration(finalDuration);

        const accuracy = perfectStreak > 0 ? 100 : Math.max(0, 100 - (failedRecalls * 20));

        addSession({
            mode: 'memory',
            duration: finalDuration,
            score,
            accuracy,
            highestLevelReached: highestLevel,
            difficultySettings: settings
        });
    };

    // Convert settings load to visual percentage (simulated)
    const memoryDifficultyPct = Math.min(100, Math.max(10,
        ((settings.sequenceLength || 3) / 10) * 100
    )).toFixed(0);

    return (
        <div className="layout-content-container flex flex-col w-full flex-1 gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1 rounded-xl p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                        <span className="material-symbols-outlined text-sm">trending_up</span>
                        <p className="text-xs font-bold uppercase tracking-wider">Level</p>
                    </div>
                    <p className="text-slate-900 dark:text-slate-100 text-2xl font-bold">Adaptive {settings.level}</p>
                </div>
                <div className="flex flex-col gap-1 rounded-xl p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                        <span className="material-symbols-outlined text-sm">stars</span>
                        <p className="text-xs font-bold uppercase tracking-wider">Current Score</p>
                    </div>
                    <p className="text-slate-900 dark:text-slate-100 text-2xl font-bold">{score.toLocaleString()}</p>
                </div>
                <div className="flex flex-col gap-1 rounded-xl p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                        <span className="material-symbols-outlined text-sm">sync</span>
                        <p className="text-xs font-bold uppercase tracking-wider">Round</p>
                    </div>
                    <p className="text-slate-900 dark:text-slate-100 text-2xl font-bold">{round} / 5</p>
                </div>
            </div>

            <div className="relative flex flex-col items-center justify-center grow min-h-[400px] md:min-h-[500px] bg-white dark:bg-slate-900 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800 p-8 overflow-hidden shadow-inner">

                {/* Adaptive Indicators: Difficulty Bar */}
                <div className="absolute top-6 left-1/2 -translate-x-1/2 w-full max-w-md px-10 z-20 pointer-events-none">
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Difficulty Level</span>
                        <span className="text-xs font-bold text-primary">{memoryDifficultyPct}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${memoryDifficultyPct}%` }}></div>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 text-center italic">Difficulty adjusting based on performance...</p>
                </div>

                {/* Memory Grid */}
                <div className="relative w-full max-w-sm aspect-square flex flex-col items-center justify-center z-10">
                    {!isPlaying && gameState === 'idle' ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 z-20 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-xl">
                            <div className="text-center">
                                <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">Memory Mode</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Watch the pattern closely and repeat it in the exact order.</p>
                            </div>
                            <button
                                onClick={startGame}
                                className="px-8 py-3 bg-primary text-white rounded-xl font-bold text-lg shadow-lg shadow-primary/25 hover:scale-105 transition-transform active:scale-95"
                            >
                                Start Session
                            </button>
                        </div>
                    ) : !isPlaying && gameState === 'finished' ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 z-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-xl">
                            <div className="text-center">
                                <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">Session Complete!</h2>
                                <p className="text-xl text-primary font-bold mb-4">Final Score: {score}</p>
                                <button onClick={startGame} className="px-6 py-2 bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl font-bold hover:bg-slate-300 transition-colors">Play Again</button>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 gap-3 md:gap-4 w-full h-full" ref={gridRef}>
                            {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((index) => (
                                <div
                                    key={index}
                                    onClick={() => handleTileClick(index)}
                                    className={`
                     rounded-xl border-4 transition-all duration-200
                     ${gameState === 'waiting' ? 'cursor-pointer hover:border-primary/50' : 'cursor-default'}
                     ${activeTile === index
                                            ? 'bg-purple-500 border-purple-300 shadow-[0_0_30px_rgba(168,85,247,0.6)] scale-105'
                                            : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm'}
                   `}
                                ></div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Status Indicator */}
                {isPlaying && (
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
                        <div className={`px-6 py-2 rounded-full font-bold text-sm tracking-wider uppercase transition-colors ${gameState === 'showing' ? 'bg-primary/20 text-primary border border-primary/30' :
                                gameState === 'waiting' ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30' :
                                    'bg-slate-100 dark:bg-slate-800 text-slate-400'
                            }`}>
                            {gameState === 'showing' ? 'Watch Pattern...' : gameState === 'waiting' ? 'Your Turn!' : 'Get Ready...'}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

"use client";

import { useState, useEffect, useRef } from "react";
import { AdaptiveEngine, AdaptiveSettings } from "../../lib/adaptiveEngine";
import { usePerformance } from "../../lib/PerformanceContext";

export default function FocusMode() {
    const { addSession, progress } = usePerformance();

    // Game State
    const [isPlaying, setIsPlaying] = useState(false);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(60);

    // Stats for Adaptive Engine
    const [hits, setHits] = useState(0);
    const [misses, setMisses] = useState(0);
    const [reactionTimes, setReactionTimes] = useState<number[]>([]);

    // Game Board State
    interface Item { id: number; top: string; left: string; isTarget: boolean; icon: string; color: string; rotation: number }
    const [items, setItems] = useState<Item[]>([]);

    // Timing refs
    const gameInterval = useRef<NodeJS.Timeout | null>(null);
    const spawnTimeRef = useRef<number>(0);

    const [settings, setSettings] = useState<AdaptiveSettings>(
        AdaptiveEngine.getInitialSettings('focus')
    );

    useEffect(() => {
        if (progress.currentFocusDistractors > 0) {
            setSettings(prev => ({
                ...prev,
                level: Math.floor(progress.currentFocusDistractors / 2),
                distractorCount: progress.currentFocusDistractors,
                similarityToTarget: Math.min(0.9, 0.2 + (progress.currentFocusDistractors * 0.05))
            }));
        }
    }, [progress.currentFocusDistractors]);

    useEffect(() => {
        if (isPlaying && timeLeft > 0) {
            gameInterval.current = setInterval(() => {
                setTimeLeft(t => t - 1);
            }, 1000);
        } else if (isPlaying && timeLeft === 0) {
            endGame();
        }
        return () => {
            if (gameInterval.current) clearInterval(gameInterval.current);
        };
    }, [isPlaying, timeLeft]);

    // Generate board
    const generateBoard = () => {
        const count = settings.distractorCount || 8;
        const sim = settings.similarityToTarget || 0.2; // 0 to 1

        const newItems: Item[] = [];

        // Target Definition
        const targetIcon = 'search';
        const targetColor = 'text-primary';

        // Distractor variations (simulating similarity)
        const similarIcons = ['manage_search', 'zoom_in', 'find_in_page'];
        const distinctIcons = ['home', 'settings', 'star', 'favorite', 'build', 'face'];

        const similarColors = ['text-blue-400', 'text-sky-500', 'text-indigo-400'];
        const distinctColors = ['text-red-500', 'text-emerald-500', 'text-amber-500'];

        // Add target
        newItems.push({
            id: 0,
            top: Math.max(10, Math.random() * 80) + '%',
            left: Math.max(10, Math.random() * 80) + '%',
            isTarget: true,
            icon: targetIcon,
            color: targetColor,
            rotation: Math.floor(Math.random() * 360)
        });

        // Add distractors
        for (let i = 1; i <= count; i++) {
            const useSimilar = Math.random() < sim;
            newItems.push({
                id: i,
                top: Math.max(10, Math.random() * 80) + '%',
                left: Math.max(10, Math.random() * 80) + '%',
                isTarget: false,
                icon: useSimilar ? similarIcons[Math.floor(Math.random() * similarIcons.length)] : distinctIcons[Math.floor(Math.random() * distinctIcons.length)],
                color: useSimilar ? similarColors[Math.floor(Math.random() * similarColors.length)] : distinctColors[Math.floor(Math.random() * distinctColors.length)],
                rotation: Math.floor(Math.random() * 360)
            });
        }

        setItems(newItems);
        spawnTimeRef.current = performance.now();
    };

    const handleItemClick = (isTarget: boolean) => {
        if (!isPlaying) return;

        const rt = performance.now() - spawnTimeRef.current;

        if (isTarget) {
            setHits(h => h + 1);
            setReactionTimes(prev => [...prev, rt]);
            setScore(s => s + Math.max(10, 500 - Math.floor(rt / 10)));

            // Evaluate adaptation briefly
            const acc = ((hits + 1) / (hits + misses + 1)) * 100;
            if (acc > 80 && rt < 2500) {
                setSettings(prev => ({
                    ...prev,
                    level: Math.floor(((prev.distractorCount || 8) + 1) / 2),
                    distractorCount: (prev.distractorCount || 8) + 1,
                    similarityToTarget: Math.min(0.9, (prev.similarityToTarget || 0.2) + 0.05)
                }));
            }

            generateBoard(); // Next round
        } else {
            setMisses(m => m + 1);
            setScore(s => Math.max(0, s - 50));
            // Provide penalty feedback here if needed
        }
    };

    const startGame = () => {
        setIsPlaying(true);
        setScore(0);
        setTimeLeft(60);
        setHits(0);
        setMisses(0);
        setReactionTimes([]);
        generateBoard();
    };

    const endGame = () => {
        setIsPlaying(false);
        setItems([]);

        const avgRt = reactionTimes.length > 0
            ? reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length
            : 0;

        const finalAccuracy = hits === 0 ? 0 : (hits / (hits + misses)) * 100;

        addSession({
            mode: 'focus',
            duration: 60 - timeLeft,
            score,
            avgReactionTime: avgRt,
            accuracy: finalAccuracy,
            highestLevelReached: settings.level,
            difficultySettings: settings
        });
    };

    // Convert settings load to visual percentage (simulated)
    const complexityPct = Math.min(100, Math.max(10,
        ((settings.distractorCount || 8) / 30) * 100
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
                        <span className="material-symbols-outlined text-sm">timer</span>
                        <p className="text-xs font-bold uppercase tracking-wider">Timer</p>
                    </div>
                    <p className={`text-2xl font-bold ${timeLeft <= 10 ? 'text-red-500' : 'text-slate-900 dark:text-slate-100'}`}>
                        00:{timeLeft.toString().padStart(2, '0')}
                    </p>
                </div>
            </div>

            <div className="relative flex flex-col items-center justify-center grow min-h-[400px] md:min-h-[500px] bg-white dark:bg-slate-900 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800 p-8 overflow-hidden shadow-inner">

                {/* Adaptive Indicators: Difficulty Bar */}
                <div className="absolute top-6 left-1/2 -translate-x-1/2 w-full max-w-md px-10 z-20 pointer-events-none">
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Difficulty Level</span>
                        <span className="text-xs font-bold text-primary">{complexityPct}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${complexityPct}%` }}></div>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 text-center italic">Difficulty adjusting based on performance...</p>
                </div>

                {/* Central Game Area */}
                <div className="relative w-full h-full min-h-[300px]">
                    {!isPlaying && timeLeft === 60 ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 z-10 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-xl">
                            <div className="text-center max-w-sm">
                                <div className="flex justify-center mb-4">
                                    <span className="material-symbols-outlined text-primary text-6xl">search</span>
                                </div>
                                <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">Focus Mode</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Find and click the <strong className="text-primary">Search icon</strong> hidden among the distractors as quickly as possible!</p>
                            </div>
                            <button
                                onClick={(e) => { e.stopPropagation(); startGame(); }}
                                className="px-8 py-3 bg-primary text-white rounded-xl font-bold text-lg shadow-lg shadow-primary/25 hover:scale-105 transition-transform active:scale-95"
                            >
                                Start Session
                            </button>
                        </div>
                    ) : !isPlaying && timeLeft === 0 ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 z-10 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-xl">
                            <div className="text-center">
                                <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">Session Complete!</h2>
                                <p className="text-xl text-primary font-bold mb-4">Final Score: {score}</p>
                                <button onClick={(e) => { e.stopPropagation(); startGame(); }} className="px-6 py-2 bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl font-bold hover:bg-slate-300 transition-colors">Play Again</button>
                            </div>
                        </div>
                    ) : (
                        // The Board
                        items.map((item) => (
                            <div
                                key={item.id}
                                onClick={(e) => { e.stopPropagation(); handleItemClick(item.isTarget); }}
                                className="absolute flex items-center justify-center cursor-pointer p-2 bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 hover:scale-110 active:scale-90 transition-transform"
                                style={{
                                    top: item.top,
                                    left: item.left,
                                    transform: `translate(-50%, -50%) rotate(${item.rotation}deg)`
                                }}
                            >
                                <span className={`material-symbols-outlined text-3xl md:text-4xl ${item.color}`}>
                                    {item.icon}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

"use client";

import { useState, useEffect, useRef } from "react";
import { AdaptiveEngine, AdaptiveSettings } from "../../lib/adaptiveEngine";
import { usePerformance } from "../../lib/PerformanceContext";
import SurveyOverlay from "./SurveyOverlay";

export default function ReflexMode() {
    const { addSession, progress } = usePerformance();
    const [needsSurvey, setNeedsSurvey] = useState(false);

    // Game State
    const [isPlaying, setIsPlaying] = useState(false);
    const [timeLeft, setTimeLeft] = useState(60); // 1 minute session
    const [score, setScore] = useState(0);

    // Adaptive Settings
    const [settings, setSettings] = useState<AdaptiveSettings>(
        AdaptiveEngine.getInitialSettings('reflex')
    );

    // Performance Metrics Tracking
    const [reactionTimes, setReactionTimes] = useState<number[]>([]);
    const [misses, setMisses] = useState(0);
    const [hits, setHits] = useState(0);

    // Stimulus State
    const [stimulusActive, setStimulusActive] = useState(false);
    const [stimulusPos, setStimulusPos] = useState({ top: '50%', left: '50%' });

    // Refs for tracking timeouts and exact spawn time
    const stimulusTimeout = useRef<NodeJS.Timeout | null>(null);
    const gameInterval = useRef<NodeJS.Timeout | null>(null);
    const spawnTimeRef = useRef<number>(0);

    useEffect(() => {
        // Sync initial level with global user progress if they've played before
        if (progress.currentLevel > 1) {
            setSettings(prev => ({ ...prev, level: progress.currentLevel }));
        }
    }, [progress.currentLevel]);

    // Handle Timer & Game End
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

    // Adapt engine periodically (every 10 seconds or 5 clicks)
    useEffect(() => {
        if (isPlaying && (hits + misses) > 0 && (hits + misses) % 5 === 0) {
            triggerAdaptation();
        }
    }, [hits, misses, isPlaying]);

    const triggerAdaptation = () => {
        const accuracy = hits === 0 ? 0 : (hits / (hits + misses)) * 100;
        const avgRt = reactionTimes.length > 0
            ? reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length
            : 0;

        const newSettings = AdaptiveEngine.evaluateReflexPerformance(
            settings,
            avgRt,
            misses, // raw misses in this window
            accuracy
        );

        setSettings(newSettings);
        // Reset window metrics for the next adaptation cycle
        setReactionTimes([]);
        setMisses(0);
        setHits(0);
    };

    const spawnStimulus = () => {
        // Generate random position within boundaries
        const top = Math.max(10, Math.random() * 80) + '%';
        const left = Math.max(10, Math.random() * 80) + '%';

        setStimulusPos({ top, left });
        setStimulusActive(true);
        spawnTimeRef.current = performance.now();

        // Auto-miss if they don't click within the allocated generic duration
        if (stimulusTimeout.current) clearTimeout(stimulusTimeout.current);

        stimulusTimeout.current = setTimeout(() => {
            handleMiss();
        }, settings.stimulusDurationMs || 1500);
    };

    const handleMiss = () => {
        setStimulusActive(false);
        setMisses(m => m + 1);

        // Spawn next stimulus after a slight delay
        setTimeout(() => {
            if (isPlaying) spawnStimulus();
        }, settings.spawnIntervalMs || 1000);
    };

    const handleHit = () => {
        if (!stimulusActive) return;

        const hitTime = performance.now();
        const rt = hitTime - spawnTimeRef.current;

        if (stimulusTimeout.current) clearTimeout(stimulusTimeout.current);

        setStimulusActive(false);
        setHits(h => h + 1);
        setReactionTimes(rtList => [...rtList, rt]);
        setScore(s => s + Math.max(10, 1000 - Math.floor(rt)));

        // Spawn next stimulus after interval
        setTimeout(() => {
            if (isPlaying) spawnStimulus();
        }, settings.spawnIntervalMs || 1000);
    };

    const startGame = () => {
        setIsPlaying(true);
        setScore(0);
        setTimeLeft(60);
        setHits(0);
        setMisses(0);
        setReactionTimes([]);
        spawnStimulus();
    };

    const endGame = () => {
        setIsPlaying(false);
        setStimulusActive(false);
        if (stimulusTimeout.current) clearTimeout(stimulusTimeout.current);

        setNeedsSurvey(true);
    };

    const handleSurveyComplete = (surveyResults: { cognitiveLoad: string, satisfactionScore: number }) => {
        setNeedsSurvey(false);

        // Final save to Performance Context
        const avgRt = reactionTimes.length > 0
            ? reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length
            : 0;

        const finalAccuracy = hits === 0 ? 0 : (hits / (hits + misses)) * 100;

        addSession({
            mode: 'reflex',
            duration: 60 - timeLeft,
            score,
            avgReactionTime: avgRt,
            rawReactionTimes: reactionTimes,
            isEarlyDropOff: timeLeft > 0,
            accuracy: finalAccuracy,
            highestLevelReached: settings.level,
            difficultySettings: settings,
            cognitiveLoad: surveyResults.cognitiveLoad,
            satisfactionScore: surveyResults.satisfactionScore,
        });
    };

    // Convert settings load to visual percentage (simulated)
    const systemLoadPct = Math.min(100, Math.max(10,
        100 - ((settings.stimulusDurationMs || 1500) / 2000) * 100
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

            <div className="relative flex flex-row items-stretch grow min-h-[400px] md:min-h-[500px] bg-white dark:bg-slate-900 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800 p-6 md:p-8 overflow-hidden shadow-inner cursor-crosshair">

                {/* Adaptive Indicators: Vertical Difficulty Bar */}
                <div className="w-12 md:w-16 flex flex-col items-center justify-end shrink-0 z-20 pointer-events-none border-r border-slate-200 dark:border-slate-800 pr-4 md:pr-6 mr-4 md:mr-6">
                    <span className="text-[10px] font-bold text-primary mb-2">{systemLoadPct}%</span>
                    <div className="w-2 h-full min-h-[250px] bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden flex flex-col justify-end">
                        <div className="w-full bg-primary transition-all duration-500 rounded-full" style={{ height: `${systemLoadPct}%` }}></div>
                    </div>
                    <div className="mt-4 flex items-center justify-center">
                         <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>Diff Level</span>
                    </div>
                </div>

                {/* Central Game Area */}
                <div className="relative flex-1 w-full h-full min-h-[300px]" onClick={() => {
                    if (isPlaying && !stimulusActive) {
                        handleMiss(); // penalize for clicking randomly when no stimulus
                    }
                }}>
                    {!isPlaying && timeLeft === 60 ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 z-10 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-xl">
                            <div className="text-center max-w-sm">
                                <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">Reflex Mode</h3>
                                <div className="text-sm text-slate-500 dark:text-slate-400 flex flex-col items-center gap-3">
                                    <span>When this glowing target appears, click it as quickly as humanly possible:</span>
                                    <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/40 relative">
                                        <div className="absolute inset-0 bg-primary/30 rounded-full blur-md animate-pulse"></div>
                                        <span className="material-symbols-outlined text-white text-3xl relative z-10">ads_click</span>
                                    </div>
                                    <span className="font-bold border border-primary/20 bg-primary/10 rounded-lg p-2 text-primary px-4">Do not click randomly! Accuracy and Speed both matter.</span>
                                </div>
                            </div>
                            <button
                                onClick={(e) => { e.stopPropagation(); startGame(); }}
                                className="px-8 py-3 bg-primary text-white rounded-xl font-bold text-lg shadow-lg shadow-primary/25 hover:scale-105 transition-transform active:scale-95"
                            >
                                Start Session
                            </button>
                        </div>
                    ) : needsSurvey ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center z-30 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm rounded-xl">
                            <SurveyOverlay onComplete={handleSurveyComplete} />
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
                        // The Target
                        stimulusActive && (
                            <div
                                onClick={(e) => { e.stopPropagation(); handleHit(); }}
                                className="absolute flex items-center justify-center cursor-pointer transition-colors"
                                style={{
                                    top: stimulusPos.top,
                                    left: stimulusPos.left,
                                    transform: 'translate(-50%, -50%)'
                                }}
                            >
                                <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
                                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/40 border-4 border-white dark:border-slate-700 hover:bg-primary/80 active:scale-90 transition-transform">
                                    <span className="material-symbols-outlined text-white text-3xl">ads_click</span>
                                </div>
                            </div>
                        )
                    )}
                </div>

                {/* Live Feedback Feed (Bottom of Game Area) */}
                {isPlaying && reactionTimes.length > 0 && (
                    <div className="absolute bottom-6 left-0 right-0 flex justify-center px-4 pointer-events-none">
                        <div className="bg-slate-100/90 dark:bg-slate-800/90 backdrop-blur-md px-6 py-3 rounded-full border border-slate-200 dark:border-slate-700 flex items-center gap-4 shadow-xl">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-emerald-500 text-sm">check_circle</span>
                                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide">Last Reaction:</span>
                                <span className={`text-sm font-bold ${reactionTimes[reactionTimes.length - 1] < 400 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-500'}`}>
                                    {Math.round(reactionTimes[reactionTimes.length - 1])}ms
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

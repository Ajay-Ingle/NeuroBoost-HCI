"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Data models
export interface GameSession {
    id: string;
    timestamp: number;
    mode: 'reflex' | 'memory' | 'focus';
    duration: number; // in seconds
    score: number;
    accuracy: number; // 0-100
    avgReactionTime?: number; // mainly for reflex
    highestLevelReached: number;
    difficultySettings: any; // snapshot of what adaptive engine set
}

export interface UserProgress {
    currentLevel: number;
    globalRank: number;
    totalTrainingTime: number; // in hours
    highestMemoryLevel: number;
    avgReactionTime: number; // global average
    streak: number;
    lastActive: number | null;
}

interface PerformanceContextType {
    sessions: GameSession[];
    progress: UserProgress;
    addSession: (session: Omit<GameSession, 'id' | 'timestamp'>) => void;
    updateProgress: (updates: Partial<UserProgress>) => void;
    clearHistory: () => void;
}

const defaultProgress: UserProgress = {
    currentLevel: 1,
    globalRank: 10000,
    totalTrainingTime: 0,
    highestMemoryLevel: 1,
    avgReactionTime: 0,
    streak: 0,
    lastActive: null,
};

const PerformanceContext = createContext<PerformanceContextType | undefined>(undefined);

export function PerformanceProvider({ children }: { children: ReactNode }) {
    const [sessions, setSessions] = useState<GameSession[]>([]);
    const [progress, setProgress] = useState<UserProgress>(defaultProgress);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load from localStorage on mount
    useEffect(() => {
        try {
            const storedSessions = localStorage.getItem('neuroboost_sessions');
            const storedProgress = localStorage.getItem('neuroboost_progress');

            if (storedSessions) setSessions(JSON.parse(storedSessions));
            if (storedProgress) setProgress(JSON.parse(storedProgress));

            // Calculate streak logic here if needed based on storedProgress.lastActive

            setIsLoaded(true);
        } catch (e) {
            console.error("Failed to load user data", e);
            setIsLoaded(true);
        }
    }, []);

    // Save to localStorage when things change
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('neuroboost_sessions', JSON.stringify(sessions));
            localStorage.setItem('neuroboost_progress', JSON.stringify(progress));
        }
    }, [sessions, progress, isLoaded]);

    const addSession = (sessionData: Omit<GameSession, 'id' | 'timestamp'>) => {
        const newSession: GameSession = {
            ...sessionData,
            id: crypto.randomUUID(),
            timestamp: Date.now()
        };

        setSessions(prev => [...prev, newSession]);

        // Auto-update global progress based on new session
        setProgress(prev => {
            const newTotalTime = prev.totalTrainingTime + (newSession.duration / 3600);
            let newHighestMemory = prev.highestMemoryLevel;
            if (newSession.mode === 'memory' && newSession.highestLevelReached > prev.highestMemoryLevel) {
                newHighestMemory = newSession.highestLevelReached;
            }

            // Rough moving average for reaction time
            let newAvgRt = prev.avgReactionTime;
            if (newSession.avgReactionTime) {
                newAvgRt = prev.avgReactionTime === 0
                    ? newSession.avgReactionTime
                    : (prev.avgReactionTime * 0.9) + (newSession.avgReactionTime * 0.1);
            }

            return {
                ...prev,
                totalTrainingTime: newTotalTime,
                highestMemoryLevel: newHighestMemory,
                avgReactionTime: newAvgRt,
                lastActive: Date.now()
            };
        });
    };

    const updateProgress = (updates: Partial<UserProgress>) => {
        setProgress(prev => ({ ...prev, ...updates }));
    };

    const clearHistory = () => {
        setSessions([]);
        setProgress(defaultProgress);
        localStorage.removeItem('neuroboost_sessions');
        localStorage.removeItem('neuroboost_progress');
    };

    return (
        <PerformanceContext.Provider value={{ sessions, progress, addSession, updateProgress, clearHistory }}>
            {children}
        </PerformanceContext.Provider>
    );
}

export function usePerformance() {
    const context = useContext(PerformanceContext);
    if (context === undefined) {
        throw new Error('usePerformance must be used within a PerformanceProvider');
    }
    return context;
}

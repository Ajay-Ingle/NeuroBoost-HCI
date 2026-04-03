"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from './supabaseClient';

// Data models
export interface GameSession {
    id: string;
    timestamp: number;
    mode: 'reflex' | 'memory' | 'focus';
    duration: number; // in seconds
    score: number; // local rendering proxy
    accuracy: number; // 0-100
    avgReactionTime?: number;
    highestLevelReached: number;
    difficultySettings: any;
}

export interface UserProgress {
    currentLevel: number;
    globalRank: number;
    totalTrainingTime: number; // in hours
    highestMemoryLevel: number;
    currentFocusDistractors: number; // For isolated focus tracking
    avgReactionTime: number; // global average
    streak: number;
    lastActive: number | null;
}

interface PerformanceContextType {
    sessions: GameSession[];
    progress: UserProgress;
    addSession: (session: Omit<GameSession, 'id' | 'timestamp'>) => void;
    clearHistory: () => void;
}

const defaultProgress: UserProgress = {
    currentLevel: 1,
    globalRank: 10000,
    totalTrainingTime: 0,
    highestMemoryLevel: 1,
    currentFocusDistractors: 5,
    avgReactionTime: 0,
    streak: 0,
    lastActive: null,
};

const PerformanceContext = createContext<PerformanceContextType | undefined>(undefined);

export function PerformanceProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const [sessions, setSessions] = useState<GameSession[]>([]);
    const [progress, setProgress] = useState<UserProgress>(defaultProgress);
    const [isLoaded, setIsLoaded] = useState(false);

    // Initial Database Pull (Cloud Fetch)
    useEffect(() => {
        async function fetchCloudData() {
            if (!user) {
                // Anonymous Player Mode - Use Local Storage
                try {
                    const storedSessions = localStorage.getItem('neuroboost_sessions');
                    const storedProgress = localStorage.getItem('neuroboost_progress');
                    if (storedSessions) setSessions(JSON.parse(storedSessions));
                    if (storedProgress) {
                        const parsed = JSON.parse(storedProgress);
                        // Calculate local streak from lastActive
                        if (parsed.lastActive) {
                            const lastDate = new Date(parsed.lastActive);
                            const today = new Date();
                            const diffDays = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
                            if (diffDays > 1) parsed.streak = 0; // Missed a day, reset
                        }
                        setProgress(parsed);
                    }
                } catch (e) {
                    console.error("Failed to load generic local data", e);
                } finally {
                    setIsLoaded(true);
                }
                return;
            }

            // Authenticated Player Mode - Fetch natively from Supabase
            try {
                const { data: logsData, error: logsError } = await supabase
                    .from('session_logs')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('session_date', { ascending: false })
                    .limit(100);
                
                if (logsError) throw logsError;

                const { data: statsData, error: statsError } = await supabase
                    .from('user_stats')
                    .select('*')
                    .eq('user_id', user.id)
                    .maybeSingle(); // maybeSingle allows empty state
                
                if (statsError) throw statsError;

                if (logsData) {
                    const mappedSessions: GameSession[] = logsData.map(log => ({
                        id: log.id,
                        timestamp: new Date(log.session_date).getTime(),
                        mode: log.mode as 'reflex' | 'memory' | 'focus',
                        duration: log.session_duration_seconds || log.completion_time_seconds || 60,
                        score: 0, // Graphing mainly focuses on physical metrics now
                        accuracy: log.accuracy_rate ? Number(log.accuracy_rate) : 0,
                        avgReactionTime: log.reaction_time_ms_avg || 0,
                        highestLevelReached: log.difficulty_progression_level || 1,
                        difficultySettings: {} // Dynamic processing
                    }));
                    setSessions(mappedSessions.reverse()); // Format chronological for Chart.js
                }

                if (statsData) {
                    setProgress(prev => ({
                        ...prev,
                        totalTrainingTime: (statsData.overall_play_time_seconds || 0) / 3600,
                        highestMemoryLevel: statsData.current_memory_sequence || 1,
                        currentLevel: Math.max(Math.floor((statsData.current_reflex_spawn_rate ? (2000 - statsData.current_reflex_spawn_rate)/100 : 1)), 1),
                        currentFocusDistractors: statsData.current_focus_distractors || 5,
                    }));
                }

                // Fetch real streak from dedicated Postgres RPC
                const { data: streakData, error: streakError } = await supabase
                    .rpc('get_user_streak', { target_user_id: user.id });
                
                if (!streakError && streakData !== null) {
                    setProgress(prev => ({ ...prev, streak: streakData }));
                }
            } catch (err) {
                console.error("Failed to fetch cloud user context", err);
            } finally {
                setIsLoaded(true);
            }
        }
        
        fetchCloudData();
    }, [user]);

    // Local anonymous persistence driver
    useEffect(() => {
        if (isLoaded && !user) {
            localStorage.setItem('neuroboost_sessions', JSON.stringify(sessions));
            localStorage.setItem('neuroboost_progress', JSON.stringify(progress));
        }
    }, [sessions, progress, isLoaded, user]);


    // Action Method utilized by all Game Modules
    const addSession = async (sessionData: Omit<GameSession, 'id' | 'timestamp'>) => {
        const newSession: GameSession = {
            ...sessionData,
            id: crypto.randomUUID(),
            timestamp: Date.now()
        };

        // 1. Maintain React State for live Chart.js rendering
        setSessions(prev => [...prev, newSession]);

        let newTotalTime = progress.totalTrainingTime + (newSession.duration / 3600);
        let newAvgRt = progress.avgReactionTime;
        if (newSession.avgReactionTime) {
            newAvgRt = progress.avgReactionTime === 0
                ? newSession.avgReactionTime
                : (progress.avgReactionTime * 0.9) + (newSession.avgReactionTime * 0.1);
        }

        setProgress(prev => {
            // Streak logic: compare lastActive date to today
            let newStreak = prev.streak;
            if (prev.lastActive) {
                const lastDate = new Date(prev.lastActive);
                const today = new Date();
                const lastDay = new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate());
                const todayDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                const diffDays = Math.floor((todayDay.getTime() - lastDay.getTime()) / (1000 * 60 * 60 * 24));

                if (diffDays === 0) {
                    // Same day — keep current streak (already counted today)
                    newStreak = Math.max(1, prev.streak);
                } else if (diffDays === 1) {
                    // Consecutive day — increment
                    newStreak = prev.streak + 1;
                } else {
                    // Missed days — reset to 1
                    newStreak = 1;
                }
            } else {
                // First ever session
                newStreak = 1;
            }

            return {
                ...prev,
                totalTrainingTime: newTotalTime,
                avgReactionTime: newAvgRt,
                highestMemoryLevel: Math.max(prev.highestMemoryLevel, sessionData.mode === 'memory' ? sessionData.highestLevelReached : 1),
                currentFocusDistractors: sessionData.mode === 'focus' && sessionData.difficultySettings ? sessionData.difficultySettings.distractorCount : prev.currentFocusDistractors,
                streak: newStreak,
                lastActive: Date.now()
            };
        });

        // 2. Cloud Write Engine
        if (user) {
            // Push active log utilizing standard mapped integer types to avoid #22P02 Postgres errors
            const logPayload = {
                user_id: user.id,
                mode: sessionData.mode,
                session_date: new Date(newSession.timestamp).toISOString(),
                reaction_time_ms_avg: sessionData.avgReactionTime ? Math.round(sessionData.avgReactionTime) : null,
                accuracy_rate: sessionData.accuracy !== undefined ? Number(sessionData.accuracy.toFixed(2)) : null,
                completion_time_seconds: sessionData.duration ? Math.round(sessionData.duration) : null,
                memory_span_level: sessionData.mode === 'memory' ? sessionData.highestLevelReached : null,
                difficulty_progression_level: sessionData.highestLevelReached
            };
            
            supabase.from('session_logs').insert(logPayload).then(({error}) => {
                if (error) console.error("Could not upload log to Cloud: ", error);
            });

            // Persist the specific Adaptive Node Settings dynamically
            const statsPayload: any = {
                user_id: user.id,
                overall_play_time_seconds: Math.round(newTotalTime * 3600),
            };

            if (sessionData.mode === 'reflex' && sessionData.difficultySettings) {
                statsPayload.current_reflex_spawn_rate = sessionData.difficultySettings.spawnIntervalMs || 1000;
            } else if (sessionData.mode === 'memory' && sessionData.difficultySettings) {
                statsPayload.current_memory_sequence = sessionData.difficultySettings.sequenceLength || 3;
            } else if (sessionData.mode === 'focus' && sessionData.difficultySettings) {
                statsPayload.current_focus_distractors = sessionData.difficultySettings.distractorCount || 5;
            }

            // Using standard update instead of explicit upsert if record doesn't trigger gracefully yet
            supabase.from('user_stats').upsert(statsPayload, { onConflict: 'user_id' }).then(({error}) => {
                if (error) console.error("Could not adapt difficulty engine trace: ", error);
            });
        }
    };

    const clearHistory = () => {
        setSessions([]);
        setProgress(defaultProgress);
        if (!user) {
            localStorage.removeItem('neuroboost_sessions');
            localStorage.removeItem('neuroboost_progress');
        }
    };

    return (
        <PerformanceContext.Provider value={{ sessions, progress, addSession, clearHistory }}>
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

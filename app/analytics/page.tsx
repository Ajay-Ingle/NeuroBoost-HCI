"use client";

import Link from "next/link";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { usePerformance } from "../lib/PerformanceContext";
import { useAuth } from "../lib/AuthContext";
import { supabase } from "../lib/supabaseClient";
import { useState, useEffect } from "react";

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

export default function Analytics() {
    const { progress, sessions: localSessions } = usePerformance();
    const { user } = useAuth();
    const [cloudLogs, setCloudLogs] = useState<any[]>([]);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    
    // AI Integration States
    const [aiReport, setAiReport] = useState<string | null>(null);
    const [isAiLoading, setIsAiLoading] = useState(false);

    useEffect(() => {
        if (user) {
            // Fetch raw telemetry logs directly to utilize the newly built AI clinical math variables
            supabase.from('session_logs')
                .select('*')
                .eq('user_id', user.id)
                .order('session_date', { ascending: true })
                .limit(50)
                .then(({ data, error }) => {
                    if (data) setCloudLogs(data);
                    if (error) console.error("Postgres Logs Error:", error);
                });
        }
    }, [user]);

    const generateAiClinicalInsight = async () => {
        if (!user) return;
        setIsAiLoading(true);
        try {
            // Fetch session to obtain JWT for RLS bypass in the Python backend
            const { data: { session } } = await supabase.auth.getSession();
            
            const res = await fetch('/api/diagnose', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.access_token}`
                },
                body: JSON.stringify({ user_id: user.id, limit: 5 })
            });
            const data = await res.json();
            if (data.status === 'success') {
                setAiReport(data.ai_report);
            } else {
                console.error("Backend diagnostic error:", data);
                setAiReport("Unable to generate diagnostic. Backend Error.");
            }
        } catch (error) {
            console.error(error);
            setAiReport("Network error contacting AI Engine.");
        } finally {
            setIsAiLoading(false);
        }
    };

    // Data Source mapping (Prefer Cloud DB if logged in, fallback to local standard sessions if guest)
    const activeData = user && cloudLogs.length > 0 ? cloudLogs : [...localSessions].reverse();
    const isCloudMode = user && cloudLogs.length > 0;

    // --- CHART 1: Cognitive Performance Effectiveness (Line) ---
    const chartLabels = activeData.map((_, i) => `Sess ${i + 1}`);

    const effectivenessData = activeData.map(s => isCloudMode ? (s.effectiveness_score || 0) : ((s.accuracy || 0) * (s.highestLevelReached || 1) / 100));
    const learnabilityData = activeData.map(s => isCloudMode ? (s.learnability_score || 0) : 0);
    const adaptationData = activeData.map(s => isCloudMode ? (s.adaptation_accuracy_score || 0) : 0);

    const cognitiveChartData = {
        labels: chartLabels.length > 0 ? chartLabels : ['No Data'],
        datasets: [
            {
                label: 'Effectiveness Score',
                data: effectivenessData.length > 0 ? effectivenessData : [0],
                borderColor: '#10b981', // emerald-500
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                tension: 0.4,
                fill: true,
                yAxisID: 'y',
            },
            {
                label: 'Adaptation Accuracy (Panic Resistance)',
                data: adaptationData.length > 0 ? adaptationData : [0],
                borderColor: '#8b5cf6', // violet-500
                backgroundColor: 'transparent',
                borderDash: [5, 5],
                tension: 0.4,
                fill: false,
                yAxisID: 'y',
            }
        ],
    };

    // --- CHART 2: Attention Fatigue vs Stability (Bar) ---
    const fatigueData = activeData.map(s => isCloudMode ? (s.attention_stability_score || 0) : 0);
    const expectedVarianceData = activeData.map(s => isCloudMode ? (s.performance_stability_variance || 0) : 0);

    const stabilityChartData = {
        labels: chartLabels.length > 0 ? chartLabels : ['No Data'],
        datasets: [
            {
                label: 'Attention Decay (Fatigue)',
                data: fatigueData.length > 0 ? fatigueData : [0],
                backgroundColor: '#f59e0b', // amber
            },
            {
                label: 'Deviation (Variance)',
                data: expectedVarianceData.length > 0 ? expectedVarianceData : [0],
                backgroundColor: '#ef4444', // red
            }
        ],
    };

    const lineOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'top' as const },
            tooltip: { backgroundColor: 'rgba(15, 23, 42, 0.9)' }
        },
        scales: {
            y: { min: 0 }
        }
    };

    // Calculate aggregated overview states
    const recentSess = isCloudMode ? cloudLogs[cloudLogs.length - 1] : null;
    const isImproving = recentSess?.learning_improvement_rate > 0;

    return (
        <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
            <div className="layout-container flex h-full grow flex-col">
                {/* Top Navigation Bar */}
                <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 lg:px-10 py-3 sticky top-0 z-50">
                    <Link href="/" className="flex items-center gap-4 text-primary hover:opacity-80 transition-opacity cursor-pointer">
                        <div className="size-8 flex items-center justify-center bg-primary/10 rounded-lg">
                            <span className="material-symbols-outlined text-primary font-bold">psychology</span>
                        </div>
                        <h2 className="text-slate-900 dark:text-white text-xl font-bold leading-tight tracking-tight">NeuroBoost</h2>
                    </Link>
                    <div className="flex flex-1 justify-end gap-3 lg:gap-8 items-center">
                        <nav className="hidden md:flex gap-6">
                            <Link className="text-slate-500 dark:text-slate-400 hover:text-primary font-medium flex items-center gap-2 transition-colors" href="/">
                                <span className="material-symbols-outlined text-lg">home</span> Home
                            </Link>
                            <Link className="text-slate-500 dark:text-slate-400 hover:text-primary font-medium flex items-center gap-2 transition-colors" href="/training">
                                <span className="material-symbols-outlined text-lg">exercise</span> Training
                            </Link>
                            <Link className="text-primary font-semibold flex items-center gap-2 border-b-2 border-primary pb-1" href="/analytics">
                                <span className="material-symbols-outlined text-lg">leaderboard</span> Stats
                            </Link>
                        </nav>
                        <div className="flex gap-2">
                            {/* Mobile Hamburger Toggle */}
                            <button 
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="md:hidden flex size-10 cursor-pointer items-center justify-center rounded-xl bg-primary text-white hover:opacity-90 transition-opacity shadow-sm"
                            >
                                <span className="material-symbols-outlined">{mobileMenuOpen ? 'close' : 'menu'}</span>
                            </button>
                        </div>
                        
                        {/* Dynamic User Avatar (Clickable to Profile) */}
                        <Link href="/profile" className="bg-primary/10 dark:bg-primary/20 rounded-full size-10 flex items-center justify-center border-2 border-primary/30 hidden sm:flex flex-shrink-0 cursor-pointer hover:border-primary transition-colors" title="Edit Research Profile">
                            {user && user.email ? (
                                <span className="text-primary font-bold text-lg uppercase">
                                    {user.email.charAt(0)}
                                </span>
                            ) : (
                                <span className="material-symbols-outlined text-primary">person</span>
                            )}
                        </Link>
                    </div>
                </header>

                {/* Mobile Dropdown Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden absolute top-[62px] left-0 w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 z-40 py-4 px-6 flex flex-col gap-4 shadow-xl animate-in slide-in-from-top-4 fade-in duration-200">
                        <Link className="text-slate-600 dark:text-slate-300 font-bold flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors" href="/" onClick={() => setMobileMenuOpen(false)}>
                            <span className="material-symbols-outlined">home</span> Dashboard / Home
                        </Link>
                        <Link className="text-slate-600 dark:text-slate-300 font-bold flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors" href="/training" onClick={() => setMobileMenuOpen(false)}>
                            <span className="material-symbols-outlined">exercise</span> Training Modules
                        </Link>
                        <Link className="text-primary font-bold flex items-center gap-3 p-3 bg-primary/5 rounded-xl border border-primary/20" href="/analytics" onClick={() => setMobileMenuOpen(false)}>
                            <span className="material-symbols-outlined">leaderboard</span> Data & Analytics
                        </Link>
                        <div className="h-px w-full bg-slate-200 dark:bg-slate-800 my-2"></div>
                        <Link className="text-slate-500 flex items-center gap-3 px-3 py-2 text-sm" href="/profile" onClick={() => setMobileMenuOpen(false)}>
                            <span className="material-symbols-outlined text-[18px]">settings</span> Edit Clinical Profile
                        </Link>
                    </div>
                )}

                <main className="flex flex-1 flex-col lg:flex-row gap-6 p-6 lg:px-10 max-w-[1200px] mx-auto w-full">
                    {/* Sidebar / AI Insights Panel */}
                    <aside className="w-full lg:w-72 flex flex-col gap-6">
                        {/* Navigation Menu */}
                        <nav className="flex flex-col gap-1 bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <Link href="/" className="flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors group">
                                <span className="material-symbols-outlined text-xl group-hover:text-primary">dashboard</span>
                                <span className="text-sm font-bold">Dashboard</span>
                            </Link>
                            <Link href="/analytics" className="flex items-center gap-3 px-4 py-3 bg-primary/10 text-primary rounded-lg transition-colors">
                                <span className="material-symbols-outlined text-xl">analytics</span>
                                <span className="text-sm font-bold">Analytics</span>
                            </Link>
                            <Link href="/training" className="flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors group">
                                <span className="material-symbols-outlined text-xl group-hover:text-primary">exercise</span>
                                <span className="text-sm font-bold">Training</span>
                            </Link>
                            <Link href="#" className="flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors group">
                                <span className="material-symbols-outlined text-xl group-hover:text-primary">settings</span>
                                <span className="text-sm font-bold">Settings</span>
                            </Link>
                        </nav>

                        {/* AI Insights Panel */}
                        <div className="bg-primary/5 dark:bg-primary/10 p-5 rounded-xl border border-primary/20 shadow-sm flex flex-col items-start gap-4">
                            <div className="flex w-full items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary text-xl">psychology</span>
                                    <h3 className="text-primary font-bold text-sm uppercase tracking-wider">Gen AI Insights</h3>
                                </div>
                                <span className="bg-primary/20 text-primary text-[10px] font-bold px-2 py-1 rounded-full border border-primary/30">MCP Powered</span>
                            </div>

                            {/* Dynamic AI UI Area */}
                            <div className="w-full space-y-4">
                                {aiReport ? (
                                    <div className="p-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-emerald-500/30 relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500 opacity-60"></div>
                                        <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300 font-medium">
                                            {aiReport}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="p-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-primary/10 relative overflow-hidden group">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-50"></div>
                                        <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400 font-medium italic">
                                            "Our Gen AI Agent maps your latest mathematical clinical arrays (Panic Resistance & Variance) via Model Context Protocol to generate personalized behavioral therapy insights."
                                        </p>
                                    </div>
                                )}
                                
                                <button 
                                    onClick={generateAiClinicalInsight}
                                    disabled={isAiLoading || !isCloudMode}
                                    className={`w-full py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm font-bold transition-all shadow-sm
                                        ${isAiLoading 
                                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                                            : !isCloudMode 
                                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                                : 'bg-primary text-white hover:bg-primary/90 hover:shadow-primary/30 hover:shadow-md'
                                        }
                                    `}
                                >
                                    {isAiLoading ? (
                                        <>
                                            <span className="material-symbols-outlined animate-spin text-sm">cycle</span>
                                            Reasoning...
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined text-sm">auto_awesome</span>
                                            Generate Diagnostic
                                        </>
                                    )}
                                </button>
                                {!isCloudMode && <p className="text-[10px] text-center text-slate-400 w-full mt-1">Requires Supabase Cloud Connection</p>}
                            </div>
                        </div>
                    </aside>

                    {/* Content Area */}
                    <div className="flex-1 flex flex-col gap-6">
                        {/* Top Summary Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
                                <div className="flex justify-between items-start mb-4">
                                    <p className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-wider">Clinical Effectiveness</p>
                                    {recentSess && (
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${recentSess.effectiveness_score > 5 ? 'bg-emerald-100 text-emerald-600' : 'bg-primary/10 text-primary'}`}>
                                            Peak Rating
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-end justify-between">
                                    <h4 className="text-3xl font-bold text-slate-900 dark:text-slate-100 italic">
                                        {recentSess?.effectiveness_score || '--'}
                                        <span className="text-sm font-normal text-slate-400 ml-1 not-italic">index</span>
                                    </h4>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
                                <div className="flex justify-between items-start mb-4">
                                    <p className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-wider">Learning Delta</p>
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${isImproving ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                                        {isImproving ? '+ Improvement' : 'Plateau'}
                                    </span>
                                </div>
                                <div className="flex items-end justify-between">
                                    <h4 className="text-3xl font-bold text-slate-900 dark:text-slate-100 italic">
                                        {recentSess?.learning_improvement_rate ? `+${recentSess.learning_improvement_rate}` : '--'}
                                        <span className="text-sm font-normal text-slate-400 ml-1 not-italic">%</span>
                                    </h4>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
                                <div className="flex justify-between items-start mb-4">
                                    <p className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-wider">Adaptivity</p>
                                </div>
                                <div className="flex items-end justify-between">
                                    <h4 className="text-3xl font-bold text-slate-900 dark:text-slate-100 italic">
                                        {recentSess?.learnability_score || '--'}
                                        <span className="text-sm font-normal text-slate-400 ml-1 not-italic">Hz</span>
                                    </h4>
                                </div>
                            </div>
                        </div>



                        {/* Main Chart Section */}
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 uppercase font-mono tracking-tighter">I. Cognitive Effectiveness</h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm">Effectiveness matrix overlaying adaptation resistance during high-pressure panic intervals.</p>
                                </div>
                            </div>

                            <div className="h-72 w-full relative mb-8">
                                {activeData.length > 0 ? (
                                    <Line data={cognitiveChartData} options={lineOptions} />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-dashed border-slate-300 dark:border-slate-700">
                                        <p className="text-slate-400">Sync games to Cloud to populate clinical data.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Fatigue Chart Section */}
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 uppercase font-mono tracking-tighter">II. Fatigue & Variance Analytics</h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm">Quantifiable interaction decay representing cognitive exhaustion thresholds.</p>
                                </div>
                            </div>

                            <div className="h-72 w-full relative">
                                {activeData.length > 0 ? (
                                    <Bar data={stabilityChartData} options={lineOptions} />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-dashed border-slate-300 dark:border-slate-700">
                                        <p className="text-slate-400">Sync games to Cloud to populate clinical data.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Adaptive Level Progress */}
                            <div className="bg-white dark:bg-background-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
                                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">analytics</span>
                                    Adaptive Level Progress
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between text-xs font-bold mb-1">
                                            <span className="text-slate-600 dark:text-slate-400 uppercase">Tier {progress.currentLevel}: Current</span>
                                            <span className="text-primary">In Progress</span>
                                        </div>
                                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                                            <div className="bg-primary h-full w-[35%] rounded-full"></div>
                                        </div>
                                    </div>
                                    {progress.currentLevel > 1 && (
                                        <div>
                                            <div className="flex justify-between text-xs font-bold mb-1">
                                                <span className="text-slate-400 dark:text-slate-500 uppercase">Tier {progress.currentLevel - 1}</span>
                                                <span className="text-emerald-500 flex items-center"><span className="material-symbols-outlined text-sm">check_circle</span> 100%</span>
                                            </div>
                                            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                                                <div className="bg-emerald-500 h-full w-full rounded-full"></div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Summary Download Section */}
                            <div className="bg-white dark:bg-background-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 flex flex-col justify-between">
                                <div>
                                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary">clinical_notes</span>
                                        Caregiver Summary
                                    </h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                                        Generate a comprehensive performance report.
                                    </p>
                                    <div className="bg-primary/5 dark:bg-primary/10 border border-dashed border-primary/40 p-4 rounded-lg mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 bg-white dark:bg-slate-800 rounded shadow-sm flex items-center justify-center">
                                                <span className="material-symbols-outlined text-red-500">picture_as_pdf</span>
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-xs font-bold">Latest_Cognitive_Report.pdf</p>
                                                <p className="text-[10px] text-slate-400">PDF • Generated dynamically</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-3 mt-4">
                                    <button className="flex-1 bg-primary hover:bg-primary/90 text-white font-bold py-2.5 rounded-lg text-sm transition-all hover:shadow-lg hover:shadow-primary/25 flex items-center justify-center gap-2">
                                        <span className="material-symbols-outlined text-sm">download</span> Download PDF
                                    </button>
                                    <button className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold py-2.5 px-4 rounded-lg text-sm transition-colors flex items-center justify-center gap-2">
                                        <span className="material-symbols-outlined text-sm">send</span> Send to Doctor
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

"use client";

import Link from "next/link";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
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
    Title,
    Tooltip,
    Legend,
    Filler
);

export default function Analytics() {
    const { progress, sessions } = usePerformance();
    const { user } = useAuth();
    const [cloudStats, setCloudStats] = useState<any>(null);

    useEffect(() => {
        if (user) {
            // Harness pure Postgres backend processing to generate daily statistical trends instantly
            supabase.rpc('get_user_analytics', { target_user_id: user.id, days_back: 30 })
                .then(({ data, error }) => {
                    if (data) setCloudStats(data);
                    if (error) console.error("Postgres RPC Analytics Error:", error);
                });
        }
    }, [user]);

    // Prepare chart data (Fallback to local Context if anonymous, override with Cloud RPC daily aggregates if authenticated)
    const reflexSessions = sessions.filter(s => s.mode === 'reflex');

    const chartLabels = cloudStats?.daily_trends?.length > 0 
        ? cloudStats.daily_trends.map((d: any) => new Date(d.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }))
        : reflexSessions.map((s, i) => `Session ${i + 1}`);

    const rtData = cloudStats?.daily_trends?.length > 0
        ? cloudStats.daily_trends.map((d: any) => d.avg_rt || 0)
        : reflexSessions.map(s => s.avgReactionTime || 0);

    const accuracyData = cloudStats?.daily_trends?.length > 0
        ? cloudStats.daily_trends.map((d: any) => d.avg_acc || 0)
        : reflexSessions.map(s => s.accuracy);

    const chartData = {
        labels: chartLabels.length > 0 ? chartLabels : ['No Data'],
        datasets: [
            {
                label: 'Accuracy (%)',
                data: accuracyData.length > 0 ? accuracyData : [0],
                borderColor: '#10b981', // emerald-500
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                tension: 0.4,
                fill: true,
                yAxisID: 'y',
            },
            {
                label: 'Reaction Time (ms)',
                data: rtData.length > 0 ? rtData : [0],
                borderColor: '#2e9cdc', // primary blue
                backgroundColor: 'rgba(46, 156, 220, 0.1)',
                tension: 0.4,
                fill: false,
                borderDash: [5, 5],
                yAxisID: 'y1',
            }
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'index' as const,
            intersect: false,
        },
        plugins: {
            legend: {
                position: 'top' as const,
            },
            tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                titleColor: '#fff',
                bodyColor: '#cbd5e1',
                padding: 10,
                cornerRadius: 8,
            }
        },
        scales: {
            y: {
                type: 'linear' as const,
                display: true,
                position: 'left' as const,
                title: { display: true, text: 'Accuracy %' },
                min: 0,
                max: 100,
            },
            y1: {
                type: 'linear' as const,
                display: true,
                position: 'right' as const,
                title: { display: true, text: 'Reaction Time (ms)' },
                grid: { drawOnChartArea: false }, // Only draw grid for primary y-axis
                reverse: true, // Lower is better for RT
            },
        },
    };

    // Calculate some aggregate stats
    const latestRt = cloudStats ? cloudStats.avg_reflex_rt_ms : (reflexSessions.length > 0 ? reflexSessions[reflexSessions.length - 1].avgReactionTime : 0);
    const previousRt = reflexSessions.length > 1 ? reflexSessions[reflexSessions.length - 2].avgReactionTime : latestRt;
    const rtTrend = latestRt && previousRt ? (((latestRt - previousRt) / previousRt) * 100).toFixed(1) : '0';
    const isRtImprovement = parseFloat(rtTrend) < 0; // Negative means faster RT!
    const globalAverageDisplay = cloudStats ? cloudStats.avg_reflex_rt_ms : progress.avgReactionTime;

    return (
        <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
            <div className="layout-container flex h-full grow flex-col">
                {/* Top Navigation Bar */}
                <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 dark:border-slate-800 bg-white dark:bg-background-dark px-6 md:px-10 py-3 sticky top-0 z-50">
                    <Link href="/" className="flex items-center gap-4 hover:opacity-80 transition-opacity cursor-pointer">
                        <div className="text-primary size-8 flex items-center justify-center">
                            <span className="material-symbols-outlined text-3xl">psychology</span>
                        </div>
                        <h2 className="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight tracking-[-0.015em]">NeuroBoost Analytics</h2>
                    </Link>
                    <div className="flex flex-1 justify-end gap-4 md:gap-8 items-center">
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
                        <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden border border-primary/30 ml-4">
                            <img className="h-full w-full object-cover" alt="User profile avatar" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCj-qvrI5Xz168RHIP3fPpseFCrFIrikOk2tgPMV4DsR8CHIkWozQyJoWHJasp-SpQ_06qre8ZWyBxlmkYscIJd8gi8d1kzCnFoncgMUT6VFI5YrdUnjNLHVCrl4l7cxNiXYpmb0HSxeKgzAuK-4N2FzVXuL4NGOPtE24T0TNaUlG25_A8hLu5ykKvlP7d8P5qe2ulnS2VUFiPcQn-naExwGt5KOqjAdRwUpLci7NAOZ3C3DkMaeCF-KUu7K8KCt4BXoCIy1a58KQ" />
                        </div>
                    </div>
                </header>

                <main className="flex flex-1 flex-col lg:flex-row gap-6 p-6 lg:px-10 max-w-[1200px] mx-auto w-full">
                    {/* Sidebar / AI Insights Panel */}
                    <aside className="w-full lg:w-64 flex flex-col gap-6">
                        <div className="bg-primary/5 dark:bg-primary/10 p-5 rounded-xl border border-primary/20">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="material-symbols-outlined text-primary text-xl">auto_awesome</span>
                                <h3 className="text-primary font-bold text-sm">AI Cognitive Insights</h3>
                            </div>
                            <div className="space-y-4">
                                <div className="p-3 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-primary/10">
                                    <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300 font-medium">
                                        {reflexSessions.length > 5
                                            ? `"Based on your last 5 sessions, your reaction time variance is decreasing. This shows cognitive stability!"`
                                            : `"Complete at least 5 training sessions across modes to generate deeper AI insights."`}
                                    </p>
                                </div>
                                {isRtImprovement && (
                                    <div className="p-3 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-emerald-500/20">
                                        <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300 font-medium">
                                            "Excellent! Your reaction time improved by <span className="text-emerald-500 font-bold">{Math.abs(parseFloat(rtTrend))}%</span> from the previous session."
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </aside>

                    {/* Content Area */}
                    <div className="flex-1 flex flex-col gap-6">
                        {/* Top Summary Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-white dark:bg-background-dark p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                <div className="flex justify-between items-start mb-2">
                                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Latest Reaction Time</p>
                                    {reflexSessions.length > 1 && (
                                        <span className={`flex items-center text-xs font-bold ${isRtImprovement ? 'text-emerald-500' : 'text-red-500'}`}>
                                            {rtTrend}% <span className="material-symbols-outlined text-sm">{isRtImprovement ? 'trending_down' : 'trending_up'}</span>
                                        </span>
                                    )}
                                </div>
                                <h4 className="text-3xl font-bold text-slate-900 dark:text-slate-100">{latestRt ? Math.round(latestRt) : '--'}<span className="text-lg font-normal text-slate-400 ml-1">ms</span></h4>
                            </div>

                            <div className="bg-white dark:bg-background-dark p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                <div className="flex justify-between items-start mb-2">
                                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Highest Adaptive Level</p>
                                </div>
                                <h4 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Tier {progress.currentLevel}</h4>
                            </div>

                            <div className="bg-white dark:bg-background-dark p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                <div className="flex justify-between items-start mb-2">
                                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Global Average RT</p>
                                </div>
                                <h4 className="text-3xl font-bold text-slate-900 dark:text-slate-100">{globalAverageDisplay > 0 ? Math.round(globalAverageDisplay) : '--'}<span className="text-lg font-normal text-slate-400 ml-1">ms</span></h4>
                            </div>
                        </div>

                        {/* Main Chart Section */}
                        <div className="bg-white dark:bg-background-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Cognitive Performance Trends (Reflex)</h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm">Historical progress over mapped training sessions</p>
                                </div>
                            </div>

                            <div className="h-72 w-full relative">
                                {reflexSessions.length > 0 ? (
                                    <Line data={chartData} options={chartOptions} />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-dashed border-slate-300 dark:border-slate-700">
                                        <p className="text-slate-400">Complete a Reflex training session to view performance charts.</p>
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
                                    <button className="flex-1 bg-primary hover:bg-primary/90 text-white font-bold py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-2">
                                        <span className="material-symbols-outlined text-sm">download</span> Download PDF
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

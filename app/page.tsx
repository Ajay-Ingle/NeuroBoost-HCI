"use client";

import Link from "next/link";
import { usePerformance } from "./lib/PerformanceContext";

export default function Home() {
    const { progress } = usePerformance();

    return (
        <div className="relative flex h-auto min-h-screen w-full flex-col group/design-root overflow-x-hidden">
            <div className="layout-container flex h-full grow flex-col">
                {/* Top Navigation Bar */}
                <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 lg:px-10 py-3 sticky top-0 z-50">
                    <Link href="/" className="flex items-center gap-4 text-primary hover:opacity-80 transition-opacity cursor-pointer">
                        <div className="size-8 flex items-center justify-center bg-primary/10 rounded-lg">
                            <span className="material-symbols-outlined text-primary font-bold">psychology</span>
                        </div>
                        <h2 className="text-slate-900 dark:text-white text-xl font-bold leading-tight tracking-tight">NeuroBoost</h2>
                    </Link>
                    <div className="flex flex-1 justify-end gap-4 lg:gap-8 items-center">
                        <nav className="hidden md:flex gap-6">
                            <Link className="text-primary font-semibold flex items-center gap-2 border-b-2 border-primary pb-1" href="/">
                                <span className="material-symbols-outlined text-lg">home</span> Home
                            </Link>
                            <Link className="text-slate-500 dark:text-slate-400 hover:text-primary font-medium flex items-center gap-2 transition-colors" href="/training">
                                <span className="material-symbols-outlined text-lg">exercise</span> Training
                            </Link>
                            <Link className="text-slate-500 dark:text-slate-400 hover:text-primary font-medium flex items-center gap-2 transition-colors" href="/analytics">
                                <span className="material-symbols-outlined text-lg">leaderboard</span> Stats
                            </Link>
                        </nav>
                        <div className="flex gap-2">
                            <button className="flex size-10 cursor-pointer items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 transition-colors">
                                <span className="material-symbols-outlined">notifications</span>
                            </button>
                            <button className="flex size-10 cursor-pointer items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 transition-colors">
                                <span className="material-symbols-outlined">settings</span>
                            </button>
                        </div>
                        <div className="bg-primary/20 rounded-full size-10 overflow-hidden border-2 border-primary/30">
                            <img className="w-full h-full object-cover" alt="User profile avatar" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBhMtEK935G_qp4xFh5DJGy_FAagcbtzixZXsOC5KgBq7zS8J2_D7NZhjULWcIw3oOeM7PlULsNOkW-i9NFh39nTURDB0XXALLrh3ck7rLWi8IJS8wXmFW8_J1DyUHPCCgKgS1nPps6IoOvxkw9cJAAsGEFI1ImhTbmRiZUrD_gDJfF29UJxoQkzJ1uTdadrieTZNzHbJ_OUqpyHDv8WEK7J5KTpaP4ETM9r0VM9LDTkgOsHqD4pp9UvQrCXjXBoSmrTMOFGencIA" />
                        </div>
                    </div>
                </header>

                <main className="flex-1 max-w-[1200px] mx-auto w-full px-4 lg:px-10 py-8 space-y-8">
                    {/* User Profile & Streak Section */}
                    <section className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex items-center gap-6">
                                <div className="size-20 bg-primary/10 rounded-full flex items-center justify-center relative">
                                    <span className="material-symbols-outlined text-primary text-4xl">person</span>
                                    <div className="absolute -bottom-1 -right-1 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 border-2 border-white dark:border-slate-900">
                                        <span className="material-symbols-outlined text-[14px]">local_fire_department</span> {progress.streak}
                                    </div>
                                </div>
                                <div>
                                    <h1 className="text-slate-900 dark:text-white text-2xl lg:text-3xl font-bold">Welcome back!</h1>
                                    <p className="text-slate-500 dark:text-slate-400 text-lg">
                                        {progress.streak >= 7
                                            ? `Incredible! ${progress.streak}-day streak — you're building real neural pathways! 🧠🔥`
                                            : progress.streak >= 3
                                            ? `Nice consistency! ${progress.streak}-day streak — keep the momentum! 🔥`
                                            : progress.streak >= 1
                                            ? `You're on a ${progress.streak}-day streak! Come back tomorrow to keep it alive! 🔥`
                                            : `Start a training session today to begin your streak! 💪`
                                        }
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 bg-gradient-to-r from-orange-500/10 to-amber-500/10 dark:from-orange-500/20 dark:to-amber-500/20 px-6 py-4 rounded-xl border border-orange-500/20">
                                <span className="material-symbols-outlined text-orange-500 text-4xl">local_fire_department</span>
                                <div>
                                    <p className="text-xs uppercase tracking-wider text-orange-600 dark:text-orange-400 font-bold">Daily Streak</p>
                                    <p className="text-orange-600 dark:text-orange-400 font-bold text-3xl">{progress.streak} <span className="text-base font-medium">day{progress.streak !== 1 ? 's' : ''}</span></p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Quick Stats Grid */}
                    <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-4 shadow-sm">
                            <div className="size-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                                <span className="material-symbols-outlined text-blue-500">timer</span>
                            </div>
                            <div>
                                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Avg Reaction Time</p>
                                <p className="text-xl font-bold text-slate-900 dark:text-white">{progress.avgReactionTime > 0 ? `${Math.round(progress.avgReactionTime)} ms` : '--'}</p>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-4 shadow-sm">
                            <div className="size-12 bg-purple-50 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                                <span className="material-symbols-outlined text-purple-500">memory</span>
                            </div>
                            <div>
                                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Highest Memory Level</p>
                                <p className="text-xl font-bold text-slate-900 dark:text-white">Level {progress.highestMemoryLevel}</p>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-4 shadow-sm">
                            <div className="size-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center">
                                <span className="material-symbols-outlined text-emerald-500">schedule</span>
                            </div>
                            <div>
                                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Total Training Time</p>
                                <p className="text-xl font-bold text-slate-900 dark:text-white">{progress.totalTrainingTime.toFixed(1)} hrs</p>
                            </div>
                        </div>
                    </section>

                    {/* Game Mode Selection */}
                    <section>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-slate-900 dark:text-white text-2xl font-bold flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">play_circle</span> Game Modes
                            </h2>
                            <Link className="text-primary font-semibold hover:underline text-sm" href="/training">View all games</Link>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Reflex Mode Card */}
                            <div className="group flex flex-col bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-md border border-slate-200 dark:border-slate-800 hover:border-primary transition-all duration-300">
                                <div className="h-48 overflow-hidden relative">
                                    <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Abstract vibrant geometric neon colors" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA5phwIeOB_M9h5gFTBTRro-957Dlutvrx7xZM7B9Bl2CFshdGLKfjiiWLczeMmCo1EKcAQPnTvtEOkdwi5cMRMQEM-exx5c_97aL9UTo5K1Q9ojMG03IT5yO7p79RsY4KkvsFjsHi_q3P0dUBDNSwo2YYn1b3qf0Q928qScD9RAwSB1_8u4UFDlsG6O2FhCEA3r91SFFzvRgyDXN12Qxrzruvi5GxyPz_SK5qC_1TN5nsAeXeyXLMR6X7dnm_0hvx_zZaFEK8Q9w" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                    <div className="absolute bottom-4 left-4 text-white">
                                        <span className="bg-primary/90 text-[10px] uppercase font-bold px-2 py-1 rounded">Fast Paced</span>
                                    </div>
                                </div>
                                <div className="p-6 flex flex-col flex-1">
                                    <h3 className="text-slate-900 dark:text-white text-xl font-bold mb-2">Reflex Mode</h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-base mb-6 flex-1">Improve your reaction time and hand-eye coordination with rapid-fire challenges.</p>
                                    <Link href="/training?mode=reflex" className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2">
                                        <span className="material-symbols-outlined">bolt</span> Start Session
                                    </Link>
                                </div>
                            </div>

                            {/* Memory Mode Card */}
                            <div className="group flex flex-col bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-md border border-slate-200 dark:border-slate-800 hover:border-primary transition-all duration-300">
                                <div className="h-48 overflow-hidden relative">
                                    <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Abstract complex patterns representing neural networks" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAxF-uYpDywGk5cAXdBHUj6XFhlmdbc8NzRXETjGzS9j6DZLhMHPEY48Pf4ZhOJ6JjcphYkOydqn7LPeDDF0n5l4wmjbXEneT5syy3CjhiITqdgoQ-Djobx-9QIv6nIsjb9Bt1w9-dHPqKRseYywbGhWuA2LCERs1_97F8u3CN03xXC0XM1xGGIxDnP9BkxkIemtAeFUJ8epjyp2GY4XZSMs5Lr3bMSo5T4svrNjxfwSzizpGVrFlSXK0tQudwWCv-siH8wVITElg" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                    <div className="absolute bottom-4 left-4 text-white">
                                        <span className="bg-purple-500/90 text-[10px] uppercase font-bold px-2 py-1 rounded">Cognitive</span>
                                    </div>
                                </div>
                                <div className="p-6 flex flex-col flex-1">
                                    <h3 className="text-slate-900 dark:text-white text-xl font-bold mb-2">Memory Mode</h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-base mb-6 flex-1">Strengthen your short-term recall and visualization abilities through pattern sequences.</p>
                                    <Link href="/training?mode=memory" className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2">
                                        <span className="material-symbols-outlined">extension</span> Start Session
                                    </Link>
                                </div>
                            </div>

                            {/* Focus Mode Card */}
                            <div className="group flex flex-col bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-md border border-slate-200 dark:border-slate-800 hover:border-primary transition-all duration-300">
                                <div className="h-48 overflow-hidden relative">
                                    <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Calming blue abstract water ripples" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCjdIyZ7OvRoiMhGS77ZZ-8MTiIj02_HmE0VkT0zj7Kblyzkd6JQ86VUxBifYNGwfyPycECiPJgFbOyFXBv3phZIbTLWpg1q09qVf1urPju4VC6ssIPPvCZbRB9WYzjOnl4xLmqgAb9RygsapQA14jJHG44T8uH_rj7Kk6gSfVPOuq_WnTUPxU1VGlvG-u56309XmHPgEcawj1P9Xxnup4S1IhwHfNqBSGLZn5CC7VmBxiKFF5aHoPNqIf9Ve1cA4bmG6GZHbTx9w" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                    <div className="absolute bottom-4 left-4 text-white">
                                        <span className="bg-emerald-500/90 text-[10px] uppercase font-bold px-2 py-1 rounded">Mental Clarity</span>
                                    </div>
                                </div>
                                <div className="p-6 flex flex-col flex-1">
                                    <h3 className="text-slate-900 dark:text-white text-xl font-bold mb-2">Focus Mode</h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-base mb-6 flex-1">Enhance concentration and filter out distractions with mindfulness tasks.</p>
                                    <Link href="/training?mode=focus" className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2">
                                        <span className="material-symbols-outlined">center_focus_strong</span> Start Session
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
}

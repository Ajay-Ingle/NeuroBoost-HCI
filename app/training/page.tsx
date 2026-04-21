"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import ReflexMode from "./components/ReflexMode";
import MemoryMode from "./components/MemoryMode";
import FocusMode from "./components/FocusMode";
import { useAuth } from "../lib/AuthContext";

export default function Training() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'reflex' | 'memory' | 'focus'>('reflex');
    const { user, showAuthModal, signOut } = useAuth();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const mode = params.get('mode');
        if (mode === 'memory' || mode === 'focus' || mode === 'reflex') {
            setActiveTab(mode);
        }
    }, []);

    return (
        <div className="layout-container flex h-full grow flex-col min-h-screen">
            {/* Header / Top Navigation */}
            <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 dark:border-slate-800 px-6 md:px-10 py-3 bg-background-light dark:bg-background-dark">
                <Link href="/" className="flex items-center gap-4 hover:opacity-80 transition-opacity cursor-pointer">
                    <div className="text-primary size-8 flex items-center justify-center">
                        <span className="material-symbols-outlined text-3xl">psychology</span>
                    </div>
                    <h2 className="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight tracking-tight">NeuroBoost</h2>
                </Link>
                <div className="flex flex-1 justify-end gap-6 items-center">
                    <nav className="hidden md:flex items-center gap-8">
                        <Link className="text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary text-sm font-medium transition-colors" href="/">Dashboard</Link>
                        <Link className="text-primary text-sm font-bold border-b-2 border-primary pb-1" href="/training">Training</Link>
                        <Link className="text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary text-sm font-medium transition-colors" href="/analytics">Stats</Link>
                    </nav>
                    {user ? (
                        <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-emerald-500 hidden md:flex items-center gap-1 border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 rounded-full"><span className="material-symbols-outlined text-[14px]">cloud_done</span> Cloud Synced</span>
                        </div>
                    ) : (
                        <button onClick={showAuthModal} className="hidden md:flex items-center gap-2 justify-center rounded-xl h-10 px-5 bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all text-sm tracking-wide">
                            <span className="material-symbols-outlined text-lg">cloud_upload</span>
                            <span>Login to Sync</span>
                        </button>
                    )}
                    
                    {/* Mobile Hamburger Toggle */}
                    <button 
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden flex size-10 cursor-pointer items-center justify-center rounded-xl bg-primary text-white hover:opacity-90 transition-opacity shadow-sm ml-2"
                    >
                        <span className="material-symbols-outlined">{mobileMenuOpen ? 'close' : 'menu'}</span>
                    </button>
                </div>
            </header>

            {/* Mobile Dropdown Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden absolute top-[62px] left-0 w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 z-40 py-4 px-6 flex flex-col gap-4 shadow-xl animate-in slide-in-from-top-4 fade-in duration-200">
                    <Link className="text-slate-600 dark:text-slate-300 font-bold flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors" href="/" onClick={() => setMobileMenuOpen(false)}>
                        <span className="material-symbols-outlined">home</span> Dashboard / Home
                    </Link>
                    <Link className="text-primary font-bold flex items-center gap-3 p-3 bg-primary/5 rounded-xl border border-primary/20" href="/training" onClick={() => setMobileMenuOpen(false)}>
                        <span className="material-symbols-outlined">exercise</span> Training Modules
                    </Link>
                    <Link className="text-slate-600 dark:text-slate-300 font-bold flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors" href="/analytics" onClick={() => setMobileMenuOpen(false)}>
                        <span className="material-symbols-outlined">leaderboard</span> Data & Analytics
                    </Link>
                    <div className="h-px w-full bg-slate-200 dark:bg-slate-800 my-2"></div>
                    <Link className="text-slate-500 flex items-center gap-3 px-3 py-2 text-sm" href="/profile" onClick={() => setMobileMenuOpen(false)}>
                        <span className="material-symbols-outlined text-[18px]">settings</span> Edit Clinical Profile
                    </Link>
                </div>
            )}

            <main className="flex flex-1 justify-center py-6 md:py-10 px-4 md:px-10">
                <div className="layout-content-container flex flex-col max-w-[1024px] w-full flex-1 gap-6">

                    <div className="flex border-b border-slate-200 dark:border-slate-800 mb-4 overflow-x-auto invisible-scrollbar">
                        <button
                            onClick={() => setActiveTab('reflex')}
                            className={`px-6 py-3 font-bold text-sm tracking-wide transition-colors ${activeTab === 'reflex' ? 'text-primary border-b-2 border-primary' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
                        >
                            REFLEX MODE
                        </button>
                        <button
                            onClick={() => setActiveTab('memory')}
                            className={`px-6 py-3 font-bold text-sm tracking-wide transition-colors ${activeTab === 'memory' ? 'text-primary border-b-2 border-primary' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
                        >
                            MEMORY MODE
                        </button>
                        <button
                            onClick={() => setActiveTab('focus')}
                            className={`px-6 py-3 font-bold text-sm tracking-wide transition-colors ${activeTab === 'focus' ? 'text-primary border-b-2 border-primary' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
                        >
                            FOCUS MODE
                        </button>
                    </div>

                    {activeTab === 'reflex' && <ReflexMode />}
                    {activeTab === 'memory' && <MemoryMode />}
                    {activeTab === 'focus' && <FocusMode />}

                </div>
            </main>
        </div>
    );
}

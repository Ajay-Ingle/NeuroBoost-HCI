"use client";

import Link from "next/link";
import { useState } from "react";
import ReflexMode from "./components/ReflexMode";
import MemoryMode from "./components/MemoryMode";
import FocusMode from "./components/FocusMode";

export default function Training() {
    const [activeTab, setActiveTab] = useState<'reflex' | 'memory' | 'focus'>('reflex');

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
                    <button className="flex items-center justify-center rounded-xl h-10 w-10 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        <span className="material-symbols-outlined">settings</span>
                    </button>
                </div>
            </header>

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

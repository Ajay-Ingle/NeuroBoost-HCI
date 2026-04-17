"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "../lib/AuthContext";
import { supabase } from "../lib/supabaseClient";

export default function Profile() {
    const { user, signOut } = useAuth();
    
    // Form State mapped exactly to our new Database Columns
    const [fullName, setFullName] = useState("");
    const [age, setAge] = useState("");
    const [gender, setGender] = useState("");
    const [dominantHand, setDominantHand] = useState("Right");
    const [primaryCohort, setPrimaryCohort] = useState("Healthy");
    const [sleepAvg, setSleepAvg] = useState("7");
    
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ text: "", type: "" });

    // Fetch existing profile data on component load
    useEffect(() => {
        if (!user) return;
        
        const fetchProfile = async () => {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();
                
            if (data) {
                if (data.full_name) setFullName(data.full_name);
                if (data.age) setAge(data.age.toString());
                if (data.gender) setGender(data.gender);
                if (data.dominant_hand) setDominantHand(data.dominant_hand);
                if (data.primary_cohort) setPrimaryCohort(data.primary_cohort);
                if (data.sleep_average_hours) setSleepAvg(data.sleep_average_hours.toString());
            }
            setLoading(false);
        };
        fetchProfile();
    }, [user]);

    // Save Logic
    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ text: "", type: "" });

        try {
            const { error } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id, // Auth matches profile ID 1:1
                    full_name: fullName,
                    age: age ? parseInt(age) : null,
                    gender,
                    dominant_hand: dominantHand,
                    primary_cohort: primaryCohort,
                    sleep_average_hours: sleepAvg ? parseInt(sleepAvg) : null,
                });

            if (error) throw error;
            setMessage({ text: "Profile baseline updated successfully! ✅", type: "success" });
        } catch (error: any) {
            setMessage({ text: error.message || "Failed to update profile", type: "error" });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
    );

    return (
        <div className="layout-container flex h-full grow flex-col min-h-screen">
            <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 dark:border-slate-800 px-6 md:px-10 py-3 bg-white dark:bg-slate-900 sticky top-0 z-50">
                <Link href="/" className="flex items-center gap-4 text-primary hover:opacity-80 transition-opacity cursor-pointer">
                    <div className="size-8 flex items-center justify-center bg-primary/10 rounded-lg">
                        <span className="material-symbols-outlined text-primary font-bold">psychology</span>
                    </div>
                    <h2 className="text-slate-900 dark:text-white text-xl font-bold leading-tight tracking-tight">NeuroBoost</h2>
                </Link>
                <div className="flex flex-1 justify-end gap-6 items-center">
                    <nav className="hidden md:flex items-center gap-8">
                        <Link className="text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary text-sm font-medium transition-colors" href="/">Dashboard</Link>
                        <Link className="text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary text-sm font-medium transition-colors" href="/training">Training</Link>
                        <Link className="text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary text-sm font-medium transition-colors" href="/analytics">Stats</Link>
                    </nav>
                    <button onClick={signOut} className="flex items-center justify-center rounded-xl h-10 px-5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-sm tracking-wide hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors">
                        Logout
                    </button>
                </div>
            </header>

            <main className="flex flex-1 justify-center py-10 px-4 md:px-10 bg-slate-50 dark:bg-slate-950">
                <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 p-8 border-b border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-4">
                            <div className="size-16 bg-primary rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-primary/30">
                                {fullName ? fullName.charAt(0).toUpperCase() : <span className="material-symbols-outlined">person</span>}
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Research Data Profile</h1>
                                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Completing this helps calibrate the cognitive baseline models.</p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSave} className="p-6 md:p-8 space-y-6">
                        {message.text && (
                            <div className={`p-4 rounded-xl font-bold text-sm ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
                                {message.text}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Basic Info */}
                            <div className="space-y-2 col-span-1 md:col-span-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Full Name</label>
                                <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Jane Doe" className="w-full p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white focus:border-primary focus:outline-none transition-colors" />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Age</label>
                                <input type="number" min="5" max="120" value={age} onChange={e => setAge(e.target.value)} placeholder="Years" required className="w-full p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white focus:border-primary focus:outline-none transition-colors" />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Gender</label>
                                <select value={gender} onChange={e => setGender(e.target.value)} className="w-full p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:border-primary focus:outline-none transition-colors">
                                    <option value="" disabled>Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Non-binary">Non-binary</option>
                                    <option value="Other">Other / Prefer not to say</option>
                                </select>
                            </div>

                            {/* Cognitive Demographics */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex justify-between">
                                    Dominant Hand <span className="text-xs font-normal text-slate-400">Impacts Reflex</span>
                                </label>
                                <select value={dominantHand} onChange={e => setDominantHand(e.target.value)} className="w-full p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:border-primary focus:outline-none transition-colors">
                                    <option value="Right">Right-handed</option>
                                    <option value="Left">Left-handed</option>
                                    <option value="Ambidextrous">Ambidextrous</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex justify-between">
                                    Average Sleep <span className="text-xs font-normal text-slate-400">Hours/Night</span>
                                </label>
                                <input type="number" min="0" max="24" value={sleepAvg} onChange={e => setSleepAvg(e.target.value)} placeholder="e.g. 7" className="w-full p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white focus:border-primary focus:outline-none transition-colors" />
                            </div>

                            <div className="space-y-2 col-span-1 md:col-span-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Primary Research Cohort</label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
                                    {['Healthy', 'Elderly', 'Post-Stroke', 'ADHD'].map(cohort => (
                                        <div 
                                            key={cohort}
                                            onClick={() => setPrimaryCohort(cohort)}
                                            className={`cursor-pointer border-2 rounded-xl p-3 text-center transition-all ${primaryCohort === cohort ? 'border-primary bg-primary/10 text-primary font-bold' : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300 dark:hover:border-slate-600'}`}
                                        >
                                            {cohort}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="pt-6">
                            <button disabled={saving} type="submit" className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50">
                                {saving ? 'Saving to Database...' : <><span className="material-symbols-outlined">save</span> Save Profile Configurations</>}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}

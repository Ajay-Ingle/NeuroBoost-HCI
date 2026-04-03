"use client";
import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function AuthModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [message, setMessage] = useState('');

    if (!isOpen) return null;

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        const { error } = isSignUp 
            ? await supabase.auth.signUp({ email, password })
            : await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            setMessage(error.message);
        } else {
            setMessage(isSignUp ? 'Check your email to verify! You can log in once verified.' : 'Logged in successfully!');
            if (!isSignUp) {
                setTimeout(onClose, 1000);
            }
        }
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl max-w-sm w-full border border-slate-200 dark:border-slate-800 shadow-2xl relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-slate-800 dark:hover:text-white">✕</button>
                <div className="flex flex-col items-center mb-6">
                    <span className="material-symbols-outlined text-4xl text-primary mb-2">cloud_sync</span>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white text-center">
                        {isSignUp ? 'Create Cloud Account' : 'Welcome Back'}
                    </h2>
                    <p className="text-xs text-slate-500 text-center mt-1">Authenticate to automatically sync your local performance to the adaptive backend.</p>
                </div>
                
                <form onSubmit={handleAuth} className="flex flex-col gap-4">
                    <input 
                        type="email" 
                        placeholder="Email Address" 
                        className="p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white font-medium focus:border-primary focus:outline-none transition-colors"
                        value={email} onChange={e => setEmail(e.target.value)} required 
                    />
                    <input 
                        type="password" 
                        placeholder="Password" 
                        className="p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white font-medium focus:border-primary focus:outline-none transition-colors"
                        value={password} onChange={e => setPassword(e.target.value)} required 
                    />
                    <button type="submit" disabled={loading} className="w-full py-3 mt-2 bg-primary text-white rounded-xl font-bold tracking-wide hover:bg-primary/90 disabled:opacity-50 transition-colors shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]">
                        {loading ? 'Processing...' : (isSignUp ? 'Sign Up securely' : 'Log In & Sync Data')}
                    </button>
                </form>

                <div className="mt-6 text-center flex flex-col gap-2 border-t border-slate-100 dark:border-slate-800 pt-4">
                    <button type="button" onClick={() => setIsSignUp(!isSignUp)} className="text-sm text-primary hover:text-primary/80 font-bold transition-colors">
                        {isSignUp ? 'Already have an account? Log In' : 'First time? Sign Up Here'}
                    </button>
                </div>
                {message && <p className={`mt-4 text-sm text-center font-bold ${message.includes('success') || message.includes('Check') ? 'text-emerald-500' : 'text-amber-500'}`}>{message}</p>}
            </div>
        </div>
    );
}

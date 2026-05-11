"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "../lib/AuthContext";
import { supabase } from "../lib/supabaseClient";

export default function ClinicalAssistant() {
    const { user, loading: authLoading } = useAuth();
    const [role, setRole] = useState<"patient" | "doctor" | null>(null);
    const [patients, setPatients] = useState<any[]>([]);
    const [selectedPatientId, setSelectedPatientId] = useState<string>("");

    const [query, setQuery] = useState("");
    const [chatHistory, setChatHistory] = useState<{ role: string, text: string }[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!user) return;

        const fetchRoleAndPatients = async () => {
            // 1. Get role
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single();

            const userRole = profile?.role || 'patient';
            setRole(userRole);

            // 2. If Doctor, fetch all patients
            if (userRole === 'doctor') {
                const { data: patientList, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .ilike('role', '%patient%');

                if (error) {
                    console.error("Error fetching patients:", error.message);
                }

                if (patientList && patientList.length > 0) {
                    setPatients(patientList);
                    setSelectedPatientId(patientList[0].id);
                } else {
                    console.warn("No patients found in database!");
                }
            } else {
                // If Patient, lock it to their own ID
                setSelectedPatientId(user.id);
            }
        };

        fetchRoleAndPatients();
    }, [user]);

    const handleSend = async () => {
        if (!query.trim() || !selectedPatientId) return;

        const userMessage = query;
        setChatHistory(prev => [...prev, { role: 'user', text: userMessage }]);
        setQuery("");
        setIsLoading(true);

        try {
            const session = await supabase.auth.getSession();
            const jwt_token = session.data.session?.access_token;

            const res = await fetch('/api/mcp-chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: userMessage,
                    target_user_id: selectedPatientId,
                    jwt_token: jwt_token
                })
            });

            const data = await res.json();

            if (data.error) {
                setChatHistory(prev => [...prev, { role: 'ai', text: `Error: ${data.error}` }]);
            } else {
                setChatHistory(prev => [...prev, { role: 'ai', text: data.answer }]);
            }
        } catch (error) {
            setChatHistory(prev => [...prev, { role: 'ai', text: "Failed to reach AI server." }]);
        } finally {
            setIsLoading(false);
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center p-10">
                <div className="text-center text-white animate-pulse text-xl">Loading Security Context...</div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center p-10">
                <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 text-center max-w-md">
                    <span className="material-symbols-outlined text-rose-500 text-5xl mb-4">lock</span>
                    <h2 className="text-2xl font-bold text-white mb-2">Unauthorized Access</h2>
                    <p className="text-slate-400">You must log into NeuroBoost to access the Clinical AI Assistant.</p>
                </div>
            </div>
        );
    }

    if (!role) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center p-10">
                <div className="text-center text-white animate-pulse text-xl">Verifying Medical Credentials...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center p-6 lg:p-10">
            <div className="w-full max-w-4xl bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 overflow-hidden flex flex-col h-[85vh]">

                {/* Header */}
                <div className="p-6 border-b border-slate-700 bg-slate-800/50 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary text-3xl">health_and_safety</span>
                        <div>
                            <h1 className="text-2xl font-bold text-white">
                                {role === 'doctor' ? 'Clinical Analyst Mode' : 'Personal Health Assistant'}
                            </h1>
                            <p className="text-slate-400 text-sm">Powered by Model Context Protocol</p>
                        </div>
                    </div>

                    <Link href="/" className="text-slate-400 hover:text-white transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </Link>
                </div>

                {/* Doctor Dropdown Area */}
                {role === 'doctor' && (
                    <div className="px-6 py-4 bg-slate-900/50 border-b border-slate-700 flex items-center gap-4">
                        <span className="text-slate-300 font-medium whitespace-nowrap">Target Patient:</span>
                        <select
                            value={selectedPatientId}
                            onChange={(e) => setSelectedPatientId(e.target.value)}
                            className="bg-slate-800 border border-slate-600 text-white rounded-lg px-4 py-2 w-full focus:outline-none focus:border-primary transition-colors"
                        >
                            {patients.map(p => (
                                <option key={p.id} value={p.id}>
                                    {p.first_name ? `${p.first_name} ${p.last_name}` : p.email} (ID: {p.id.substring(0, 8)}...)
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Chat Log */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {chatHistory.length === 0 ? (
                        <div className="text-center text-slate-500 mt-20 flex flex-col items-center">
                            <span className="material-symbols-outlined text-6xl mb-4 opacity-20">smart_toy</span>
                            <p className="text-lg">Ask me to analyze cognitive fatigue, panic resistance, or medical baselines.</p>
                        </div>
                    ) : (
                        chatHistory.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] rounded-2xl px-6 py-4 ${msg.role === 'user' ? 'bg-primary text-white rounded-br-none' : 'bg-slate-700 text-slate-200 rounded-bl-none'}`}>
                                    <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                                </div>
                            </div>
                        ))
                    )}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-slate-700 text-slate-400 rounded-2xl rounded-bl-none px-6 py-4 flex items-center gap-3">
                                <span className="material-symbols-outlined animate-spin">refresh</span>
                                Analyzing patient telemetry via MCP...
                            </div>
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-slate-700 bg-slate-800">
                    <div className="flex gap-4">
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder={role === 'doctor' ? "Ask about this patient's metrics..." : "Ask about your performance..."}
                            className="flex-1 bg-slate-900 border border-slate-600 rounded-xl px-6 py-4 text-white focus:outline-none focus:border-primary transition-colors placeholder:text-slate-500"
                        />
                        <button
                            onClick={handleSend}
                            disabled={isLoading}
                            className="bg-primary hover:bg-primary-dark text-white rounded-xl px-8 py-4 font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            <span>Send</span>
                            <span className="material-symbols-outlined text-xl">send</span>
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}

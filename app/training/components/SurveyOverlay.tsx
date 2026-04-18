"use client";
import { useState } from "react";

interface SurveyOverlayProps {
    onComplete: (answers: { cognitiveLoad: string, satisfactionScore: number }) => void;
}

export default function SurveyOverlay({ onComplete }: SurveyOverlayProps) {
    const [step, setStep] = useState(1);
    const [load, setLoad] = useState<string>("Medium");
    const [rating, setRating] = useState<number>(0);
    
    const handleSubmit = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (rating === 0) return;
        onComplete({ cognitiveLoad: load, satisfactionScore: rating });
    };

    if (step === 1) {
        return (
            <div onClick={(e) => e.stopPropagation()} className="flex flex-col items-center justify-center gap-4 w-[90%] h-auto max-h-[95%] md:max-h-full max-w-sm mx-auto p-6 md:p-8 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 relative z-50 overflow-y-auto">
                <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mb-2 flex-shrink-0">
                    <span className="material-symbols-outlined text-4xl text-blue-500">psychology</span>
                </div>
                <div className="text-center w-full">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Mental Load Matrix</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Please select the overall effort required.</p>
                </div>
                
                <div className="w-full flex flex-col gap-2 mt-2">
                    {["Very Light", "Light", "Medium", "Heavy", "Overwhelming"].map(level => {
                        const isSelected = load === level;
                        return (
                        <button 
                            key={level} 
                            onClick={(e) => { e.stopPropagation(); setLoad(level); }}
                            className={`w-full py-3 rounded-lg font-bold text-sm tracking-wide transition-all ${isSelected ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700'}`}
                        >
                            {level}
                        </button>
                    )})}
                </div>
                <button 
                    onClick={(e) => { e.stopPropagation(); setStep(2); }} 
                    className="w-full mt-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-3 rounded-xl font-bold text-sm hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg flex-shrink-0"
                >
                    Next Phase <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
            </div>
        );
    }

    return (
        <div onClick={(e) => e.stopPropagation()} className="flex flex-col items-center justify-center gap-4 w-[90%] h-auto max-h-[95%] md:max-h-full max-w-sm mx-auto p-6 md:p-8 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 relative z-50 overflow-y-auto">
            <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center mb-2 flex-shrink-0">
                <span className="material-symbols-outlined text-4xl text-emerald-500">thumb_up</span>
            </div>
            <div className="text-center w-full">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">HCI Satisfaction</h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Rate the UX reliability of the engine.</p>
            </div>
            
            <div className="flex justify-between w-full gap-2 mt-4">
                {[1, 2, 3, 4, 5].map(val => {
                    const isSelected = rating === val;
                    return (
                    <button 
                        key={val} 
                        onClick={(e) => { e.stopPropagation(); setRating(val); }}
                        className={`flex-1 aspect-[4/3] rounded-xl font-bold text-2xl flex items-center justify-center transition-all ${isSelected ? 'bg-emerald-500 text-white shadow-lg border-2 border-emerald-400 scale-110' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700'}`}
                    >
                        {val}
                    </button>
                )})}
            </div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider w-full flex justify-between px-1 mb-4 border-b border-slate-100 dark:border-slate-800 pb-4 flex-shrink-0">
                <span>1 - Poor</span>
                <span>5 - Exceptional</span>
            </div>

            {rating !== 0 ? (
                <button 
                    onClick={handleSubmit} 
                    className="w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg bg-primary text-white hover:opacity-90 active:scale-[0.98] flex-shrink-0"
                >
                    Submit Clinical Report <span className="material-symbols-outlined text-sm">check_circle</span>
                </button>
            ) : (
                <div className="w-full py-3 rounded-xl text-xs text-slate-400 italic text-center border-2 border-dashed border-slate-200 dark:border-slate-800 flex-shrink-0">
                    Select a rating to continue
                </div>
            )}
        </div>
    );
}

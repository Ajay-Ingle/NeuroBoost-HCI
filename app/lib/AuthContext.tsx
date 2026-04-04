"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "./supabaseClient";
import AuthModal from "../components/AuthModal";

interface AuthContextType {
  user: any;
  loading: boolean;
  showAuthModal: () => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user || null;
      setUser(currentUser);
      setLoading(false);
      
      // Force registration prompt for any guest users on land
      if (!currentUser) {
        setModalOpen(true);
      }
      
      if (currentUser) syncLocalDataToCloud(currentUser.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const currentUser = session?.user || null;
      setUser(currentUser);
      if (event === 'SIGNED_IN' && currentUser) {
        syncLocalDataToCloud(currentUser.id);
        setModalOpen(false); // Close modal on success
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const syncLocalDataToCloud = async (userId: string) => {
    try {
      const rawSessions = localStorage.getItem('neuroboost_sessions');
      if (!rawSessions) return;
      
      const stored = JSON.parse(rawSessions);
      if (!Array.isArray(stored) || stored.length === 0) return;

      // Extract local storage records and map them precisely to our Supabase Schema requirements
      const mapped = stored.map(s => ({
        user_id: userId,
        session_date: new Date(s.timestamp).toISOString(),
        mode: s.mode,
        reaction_time_ms_avg: s.avgReactionTime ? Math.round(s.avgReactionTime) : null,
        accuracy_rate: (s.accuracy !== undefined && s.accuracy !== null) ? Number(Number(s.accuracy).toFixed(2)) : null,
        completion_time_seconds: s.duration ? Math.round(s.duration) : null,
        memory_span_level: s.highestLevelReached ? Math.round(s.highestLevelReached) : null,
        difficulty_progression_level: s.highestLevelReached ? Math.round(s.highestLevelReached) : null
      }));

      // Insert bulk array into Supabase logic layer
      console.log('🔄 Attempting to sync local data to cloud...', mapped);
      const { error } = await supabase.from('session_logs').insert(mapped);
      
      if (error) throw error;

      console.log('✅ Successfully synced local data to cloud. Destroying anonymous local copy.');
      localStorage.removeItem('neuroboost_sessions');
      
    } catch(err) {
      console.error('⚠️ Error syncing data to Supabase:', err);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, loading, showAuthModal: () => setModalOpen(true), signOut }}>
      {children}
      <AuthModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error("useAuth must be used within AuthProvider");
  return context;
}

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const checkAdmin = useCallback(async (userId: string) => {
    try {
      const { data } = await supabase
        .from("admins")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();
      return !!data;
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    // Set up auth state listener FIRST (recommended by Supabase)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Use setTimeout to prevent potential deadlock with simultaneous Supabase calls
          setTimeout(async () => {
            const result = await checkAdmin(session.user.id);
            setIsAdmin(result);
            setLoading(false);
          }, 0);
        } else {
          setIsAdmin(false);
          setLoading(false);
        }
      }
    );

    // Then get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        checkAdmin(session.user.id).then((result) => {
          setIsAdmin(result);
          setLoading(false);
        });
      } else {
        setIsAdmin(false);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [checkAdmin]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signOut = async () => {
    // Clear state first for instant UI feedback
    setIsAdmin(false);
    setUser(null);
    setSession(null);
    try {
      await supabase.auth.signOut();
    } catch {
      // Even if signOut fails (e.g. network), state is already cleared
    }
  };

  return { user, session, loading, isAdmin, signIn, signOut };
}

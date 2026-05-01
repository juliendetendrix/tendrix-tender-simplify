import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "entreprise" | "charge_affaires" | "admin";

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  roles: AppRole[];
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listener first
    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
      if (sess?.user) {
        // Defer the supabase call to avoid deadlock
        setTimeout(() => fetchRoles(sess.user.id), 0);
      } else {
        setRoles([]);
      }
    });

    // Then check existing
    supabase.auth.getSession().then(({ data: { session: sess } }) => {
      setSession(sess);
      if (sess?.user) {
        fetchRoles(sess.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const fetchRoles = async (userId: string) => {
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    if (!error && data) {
      setRoles(data.map((r) => r.role as AppRole));
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setRoles([]);
  };

  return (
    <AuthContext.Provider
      value={{ session, user: session?.user ?? null, roles, loading, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function defaultRouteForRole(role: AppRole | undefined): string {
  switch (role) {
    case "admin":
      return "/admin";
    case "charge_affaires":
      return "/charge-affaires";
    case "entreprise":
      return "/app";
    default:
      return "/login";
  }
}

"use client";
import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Role } from "@/lib/roles";

export type AppUser = {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatar_url: string | null;
  business_name: string | null;
};

type AuthCtx = {
  user: AppUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<string | null>;
  logout: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const sb = useMemo(() => createClient(), []);

  async function fetchProfile(uid: string): Promise<AppUser | null> {
    const { data } = await sb
      .from("users")
      .select("id, name, email, role, avatar_url, business_name")
      .eq("supabase_uid", uid)
      .single();
    if (!data) return null;
    return {
      id:            data.id,
      email:         data.email,
      name:          data.name,
      role:          data.role as Role,
      avatar_url:    data.avatar_url ?? null,
      business_name: (data as any).business_name ?? null,
    };
  }

  useEffect(() => {
    sb.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        setUser(profile);
      }
      setLoading(false);
    });

    const { data: { subscription } } = sb.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        setUser(profile);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function login(email: string, password: string): Promise<string | null> {
    const { error } = await sb.auth.signInWithPassword({ email, password });
    if (error) return error.message;
    return null;
  }

  async function logout() {
    await sb.auth.signOut();
    setUser(null);
  }

  return <Ctx.Provider value={{ user, loading, login, logout }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}

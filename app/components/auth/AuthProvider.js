"use client";

// Thin client wrapper around the real server session (iron-session cookie +
// MySQL `users` table). The server resolves the session in the root layout
// and passes the initial user down as a prop — no localStorage, no client-
// side password handling. Mutations call Server Actions, which update the
// httpOnly session cookie server-side; router.refresh() then re-runs the
// Server Component tree so it reflects the new session.

import { createContext, useContext, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { loginAction, registerAction, logoutAction } from "@/app/actions/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children, initialUser = null }) {
  const [user, setUser] = useState(initialUser);
  const router = useRouter();

  const login = async (email, password) => {
    const result = await loginAction(email, password);
    if (result.ok) {
      setUser(result.user);
      router.refresh();
    }
    return result;
  };

  const register = async (payload) => {
    const result = await registerAction(payload);
    if (result.ok) {
      setUser(result.user);
      router.refresh();
    }
    return result;
  };

  const logout = async () => {
    await logoutAction();
    setUser(null);
    router.refresh();
  };

  const value = useMemo(
    () => ({
      status: user ? "authenticated" : "unauthenticated",
      user,
      login,
      register,
      logout,
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

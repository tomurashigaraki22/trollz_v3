"use client";

// Thin client wrapper around the real server session (iron-session cookie +
// MySQL `users` table). The server resolves the session in the root layout
// and passes the initial user down as a prop — no localStorage, no client-
// side password handling. Mutations call Server Actions, which update the
// httpOnly session cookie server-side; the caller then navigates (router.push)
// to a page that reads the fresh session on its own.
//
// Deliberately NOT calling router.refresh() here: callers immediately do a
// router.push() right after login/register succeeds, and firing refresh()
// and push() back-to-back races the Next.js router cache — refresh()'s
// in-flight re-render of the *current* route can cancel the pending push(),
// silently stranding the user on the login/register page even though the
// account was created/authenticated. The destination page already fetches
// its own fresh session server-side on navigation, so refresh() is redundant.

import { createContext, useContext, useMemo, useState } from "react";
import { loginAction, registerAction, logoutAction } from "@/app/actions/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children, initialUser = null }) {
  const [user, setUser] = useState(initialUser);

  const login = async (email, password) => {
    const result = await loginAction(email, password);
    if (result.ok) {
      setUser(result.user);
    }
    return result;
  };

  const register = async (payload) => {
    const result = await registerAction(payload);
    if (result.ok) {
      setUser(result.user);
    }
    return result;
  };

  const logout = async () => {
    await logoutAction();
    setUser(null);
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

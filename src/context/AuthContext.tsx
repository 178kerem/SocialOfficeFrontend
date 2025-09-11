import React, { createContext, useContext, useState, useEffect, type ReactNode } from "react";

type AuthContextType = {
  token: string | null;
  email: string | null;
  isAuthenticated: boolean;
  login: (token: string, email: string, remember: boolean) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  // Sayfa açılırken storage’dan oku
  useEffect(() => {
    const storedToken = localStorage.getItem("token") || sessionStorage.getItem("token");
    const storedEmail = localStorage.getItem("email") || sessionStorage.getItem("email");
    if (storedToken && storedEmail) {
      setToken(storedToken);
      setEmail(storedEmail);
    }
  }, []);

  const login = (newToken: string, userEmail: string, remember: boolean) => {
    setToken(newToken);
    setEmail(userEmail);
    if (remember) {
      localStorage.setItem("token", newToken);
      localStorage.setItem("email", userEmail);
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("email");
    } else {
      sessionStorage.setItem("token", newToken);
      sessionStorage.setItem("email", userEmail);
      localStorage.removeItem("token");
      localStorage.removeItem("email");
    }
  };

  const logout = () => {
    setToken(null);
    setEmail(null);
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("email");
  };

  const value = {
    token,
    email,
    isAuthenticated: !!token,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

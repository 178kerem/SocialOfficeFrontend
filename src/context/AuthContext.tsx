import { createContext, useContext, useState, type ReactNode } from "react";

type AuthContextType = {
  token: string | null;
  email: string | null;
  userId: string | null;
  isAuthenticated: boolean;
  login: (token: string, email: string, userId: string, remember?: boolean) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"));
  const [email, setEmail] = useState<string | null>(() => localStorage.getItem("email"));
  const [userId, setUserId] = useState<string | null>(() => localStorage.getItem("userId"));

  const isAuthenticated = !!token;

  const login = (newToken: string, newEmail: string, newUserId: string, remember = true) => {
    setToken(newToken);
    setEmail(newEmail);
    setUserId(newUserId);

    if (remember) {
      localStorage.setItem("token", newToken);
      localStorage.setItem("email", newEmail);
      localStorage.setItem("userId", newUserId);
    }
  };

  const logout = () => {
    setToken(null);
    setEmail(null);
    setUserId(null);
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    localStorage.removeItem("userId");
  };

  return (
    <AuthContext.Provider value={{ token, email, userId, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

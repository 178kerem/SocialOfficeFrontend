import { createContext, useContext, useState, type ReactNode } from "react";

type AuthContextType = {
  token: string | null;
  email: string | null;
  userId: string | null;
  type: string | null; // ✅ ekleme
  isAuthenticated: boolean;
  login: (token: string, email: string, userId: string, type: string, remember?: boolean) => void;
  logout: () => void;
};


const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"));
  const [email, setEmail] = useState<string | null>(() => localStorage.getItem("email"));
  const [userId, setUserId] = useState<string | null>(() => localStorage.getItem("userId"));

  // ✅ Hem token hem userId varsa kullanıcı giriş yapmış sayılır
  const isAuthenticated = !!(token && userId);
  const [type, setType] = useState<string | null>(() => localStorage.getItem("type"));

  const login = (newToken: string, newEmail: string, newUserId: string, newType: string, remember = true) => {
  setToken(newToken);
  setEmail(newEmail);
  setUserId(newUserId);
  setType(newType);

  if (remember) {
    localStorage.setItem("token", newToken);
    localStorage.setItem("email", newEmail);
    localStorage.setItem("userId", newUserId);
    localStorage.setItem("type", newType);
  }
};


  const logout = () => {
  setToken(null);
  setEmail(null);
  setUserId(null);
  setType(null);
  localStorage.removeItem("token");
  localStorage.removeItem("email");
  localStorage.removeItem("userId");
  localStorage.removeItem("type");
};


  return (
    <AuthContext.Provider value={{ token, email, userId,type, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

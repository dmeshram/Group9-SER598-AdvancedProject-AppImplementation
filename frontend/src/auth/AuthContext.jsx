import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

const USER_KEY = "greenloop_user";
const TOKEN_KEY = "greenloop_token";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem(USER_KEY);
    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      } catch (e) {
        console.error("Failed to parse stored user:", e);
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem(TOKEN_KEY);
      }
    }
  }, []);

  const loginWithGoogle = (cred) => {
    if (!cred) return;
    const payloadJson = atob(cred.split(".")[1]);
    const payload = JSON.parse(payloadJson);
    const userData = {
        userId: payload.sub,
        name: payload.name,
        email: payload.email,
        picture: payload.picture,
    };
    setUser(userData);
    setToken(cred);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    localStorage.setItem(TOKEN_KEY, cred);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
  };

  const value = {
    user,
    token,
    isAuthenticated: !!user,
    loginWithGoogle,
    logout,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("User must be within an AuthProvider");
    }
    return context;
}
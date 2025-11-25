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

  const loginWithGoogle = async (cred) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/auth/google`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ credential: cred }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to authenticate");
      }
      const data = await response.json();
      setUser(data.user);
      setToken(data.token);

      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      localStorage.setItem(TOKEN_KEY, data.token);
    } catch (err) {
      console.error("Google login error:", err);
      throw err;
    }
  };

  const loginWithEmailPassword = async (email, password) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json"},
          body: JSON.stringify({email, password}),
        }
      );
      if (!response.ok){
        throw new Error("Invalid Credentials");
      }
      const data = await response.json();
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      localStorage.setItem(TOKEN_KEY, data.token);
    } catch (error) {
      console.error("Credentials login error", error);
      throw error;
    }
  }

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
    loginWithEmailPassword,
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

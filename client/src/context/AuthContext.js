import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const loadUser = useCallback(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setUser(null);
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));

      if (payload.exp * 1000 < Date.now()) {
        throw new Error("Token expired");
      }

      const storedUser = localStorage.getItem("auraUser");
      setUser(storedUser ? JSON.parse(storedUser) : null);
    } catch (err) {
      localStorage.removeItem("token");
      localStorage.removeItem("auraUser");
      setUser(null);
    }
  }, []);

  useEffect(() => {
    loadUser();

    const handleStorage = () => loadUser();

    window.addEventListener("storage", handleStorage);

    return () => window.removeEventListener("storage", handleStorage);
  }, [loadUser]);

  const login = (userData, token) => {
    localStorage.setItem("token", token);
    localStorage.setItem("auraUser", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("auraUser");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        refreshUser: loadUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
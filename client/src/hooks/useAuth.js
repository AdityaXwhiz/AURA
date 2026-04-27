import { useEffect, useState } from "react";

export default function useAuth() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setUser(null);
      return;
    }

    try {
      // Decode JWT payload
      const payload = JSON.parse(atob(token.split(".")[1]));

      // Check token expiry
      if (payload.exp * 1000 < Date.now()) {
        throw new Error("Token expired");
      }

      const storedUser = localStorage.getItem("auraUser");

      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error("Auth error:", err.message);
      localStorage.removeItem("token");
      localStorage.removeItem("auraUser");
      setUser(null);
    }
  }, []);

  const logout = () => {
    localStorage.removeItem("auraUser");
    localStorage.removeItem("token");
    setUser(null);
    window.location.href = "/";
  };

  return { user, setUser, logout };
}
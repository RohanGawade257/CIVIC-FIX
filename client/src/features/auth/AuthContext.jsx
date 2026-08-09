import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  getCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
  updateCurrentUser,
} from "../../services/authApi.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  const refreshUser = useCallback(async () => {
    setStatus("loading");

    try {
      const response = await getCurrentUser();
      setUser(response.user);
      setStatus("authenticated");
      setError("");
    } catch (requestError) {
      setUser(null);
      setStatus("anonymous");

      if (requestError.code !== "AUTH_REQUIRED") {
        setError(requestError.message);
      }
    }
  }, []);

  const register = useCallback(async (payload) => {
    setStatus("loading");
    const response = await registerUser(payload);
    setUser(response.user);
    setStatus("authenticated");
    setError("");
    return response.user;
  }, []);

  const login = useCallback(async (payload) => {
    setStatus("loading");
    const response = await loginUser(payload);
    setUser(response.user);
    setStatus("authenticated");
    setError("");
    return response.user;
  }, []);

  const logout = useCallback(async () => {
    await logoutUser();
    setUser(null);
    setStatus("anonymous");
    setError("");
  }, []);

  const updateProfile = useCallback(async (payload) => {
    const response = await updateCurrentUser(payload);
    setUser(response.user);
    setStatus("authenticated");
    setError("");
    return response.user;
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      refreshUser();
    }, 0);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [refreshUser]);

  const value = useMemo(
    () => ({
      error,
      login,
      logout,
      refreshUser,
      register,
      status,
      updateProfile,
      user,
    }),
    [error, login, logout, refreshUser, register, status, updateProfile, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}

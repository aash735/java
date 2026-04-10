import { createContext, useContext, useMemo, useState } from "react";
import {
  clearStoredTokens,
  getStoredTokens,
  isValidToken,
  login,
  normalizeTokens,
  refreshToken,
  register,
  setStoredTokens
} from "../services/authService";

const AuthContext = createContext(null);

function decodeJwt(token) {
  try {
    const payload = token.split(".")[1];
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
    return JSON.parse(atob(padded));
  } catch (_error) {
    return null;
  }
}

function deriveUserFromToken(accessToken, fallbackUser = null) {
  const payload = decodeJwt(accessToken);

  if (!payload) {
    return fallbackUser;
  }

  return {
    email: payload.sub ?? fallbackUser?.email ?? "",
    role: payload.role ?? fallbackUser?.role ?? "USER"
  };
}

export function AuthProvider({ children }) {
  const initialTokens = getStoredTokens();
  const hasValidInitialAccessToken = initialTokens?.accessToken && isValidToken(initialTokens.accessToken);

  const [tokens, setTokens] = useState(hasValidInitialAccessToken ? initialTokens : null);
  const [user, setUser] = useState(
    hasValidInitialAccessToken ? deriveUserFromToken(initialTokens.accessToken) : null
  );

  const applyTokens = (incomingTokens, fallbackUser = user) => {
    const normalized = normalizeTokens(incomingTokens);

    if (!normalized?.accessToken) {
      setTokens(null);
      setUser(null);
      clearStoredTokens();
      return;
    }

    setTokens(normalized);
    setUser(deriveUserFromToken(normalized.accessToken, fallbackUser));
    setStoredTokens(normalized);
  };

  const loginUser = async (credentials) => {
    const tokenResponse = await login(credentials);
    applyTokens(tokenResponse, null);
    return tokenResponse;
  };

  const registerUser = async (payload) => register(payload);

  const updateTokensFromRefresh = async () => {
    const current = getStoredTokens();

    if (!current?.refreshToken) {
      throw new Error("No refresh token available");
    }

    const refreshed = await refreshToken(current.refreshToken);
    applyTokens(refreshed);
    return refreshed;
  };

  const logout = () => {
    setTokens(null);
    setUser(null);
    clearStoredTokens();
  };

  const value = useMemo(
    () => ({
      user,
      tokens,
      role: user?.role ?? "",
      isAuthenticated: Boolean(tokens?.accessToken),
      loginUser,
      registerUser,
      updateTokensFromRefresh,
      logout
    }),
    [tokens, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}



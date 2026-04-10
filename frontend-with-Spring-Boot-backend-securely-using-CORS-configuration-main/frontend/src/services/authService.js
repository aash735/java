import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8082";
const TOKEN_STORAGE_KEY = "demo_auth_tokens";

export function stripBearerPrefix(token) {
  if (!token || typeof token !== "string") {
    return "";
  }

  return token.startsWith("Bearer ") ? token.slice(7) : token;
}

export function normalizeTokens(rawTokens) {
  if (!rawTokens) {
    return null;
  }

  return {
    accessToken: stripBearerPrefix(rawTokens.accessToken),
    refreshToken: rawTokens.refreshToken
  };
}

export function getStoredTokens() {
  const raw = localStorage.getItem(TOKEN_STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw);
    return normalizeTokens(parsed);
  } catch (_error) {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    return null;
  }
}

export function setStoredTokens(tokens) {
  const normalized = normalizeTokens(tokens);

  if (!normalized?.accessToken) {
    clearStoredTokens();
    return;
  }

  localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(normalized));
}

export function clearStoredTokens() {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

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

export function isValidToken(token) {
  if (!token) {
    return false;
  }

  const payload = decodeJwt(token);

  if (!payload?.exp) {
    return false;
  }

  return payload.exp * 1000 > Date.now() + 5000;
}

export async function login(credentials) {
  const response = await axios.post(`${API_BASE_URL}/api/user/login`, credentials);
  return normalizeTokens(response.data);
}

export async function register(payload) {
  const response = await axios.post(`${API_BASE_URL}/api/user/register`, payload);
  return response.data;
}

export async function refreshToken(refreshTokenValue) {
  const response = await axios.post(`${API_BASE_URL}/api/user/refresh-token`, {
    refreshToken: refreshTokenValue
  });
  return normalizeTokens(response.data);
}

export { API_BASE_URL };



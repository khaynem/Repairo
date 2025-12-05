"use client";

import RequestService from "./requestService";
import { endpoints } from "../constants/api";

const TOKEN_KEY = "token";

export const authStorage = {
  get() {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(TOKEN_KEY);
  },
  set(token) {
    if (typeof window === "undefined") return;
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  },
  clear() {
    if (typeof window === "undefined") return;
    localStorage.removeItem(TOKEN_KEY);
  },
};

/**
 * Login user with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<import('@/interfaces/api.types').AuthResponse>} Authentication response
 */
async function login(email, password) {
  const data = await devFallback(() =>
    RequestService.post(
      endpoints.auth.login,
      { email, password },
      { withAuth: false }
    )
  );
  authStorage.set(data.token || "dev-token");
  return data;
}

/**
 * Register new user
 * @param {Object} payload - Registration data
 * @param {string} payload.email - User email
 * @param {string} payload.password - User password
 * @param {string} payload.username - Username
 * @param {string} [payload.role] - User role
 * @returns {Promise<import('@/interfaces/api.types').AuthResponse>} Authentication response
 */
async function register(payload) {
  const data = await devFallback(() =>
    RequestService.post(endpoints.auth.register, payload, { withAuth: false })
  );
  authStorage.set(data.token || "dev-token");
  return data;
}

/**
 * Get current user profile
 * @returns {Promise<{user: import('@/interfaces/api.types').User}>} User profile response
 */
async function profile() {
  return devFallback(() => RequestService.get(endpoints.auth.profile));
}

/**
 * Logout current user and clear token
 * @returns {void}
 */
function logout() {
  authStorage.clear();
}

async function devFallback(fn) {
  try {
    return await fn();
  } catch (err) {
    if (err?.status === 404 || err?.message === "Failed to fetch") {
      return new Promise((resolve) =>
        setTimeout(
          () =>
            resolve({
              token: "dev-token",
              user: { email: "dev@example.com", role: "customer" },
            }),
          250
        )
      );
    }
    throw err;
  }
}

export const AuthService = { login, register, profile, logout, authStorage };
export default AuthService;

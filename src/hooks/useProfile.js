"use client";
import { useCallback, useEffect, useState } from "react";
import AuthService from "../services/authService";

/**
 * @typedef {import('@/interfaces/api.types').User} User
 */

/**
 * @typedef {Object} UseProfileOptions
 * @property {boolean} [immediate=true] - Whether to fetch immediately
 */

/**
 * @typedef {Object} UseProfileReturn
 * @property {User | null} profile - User profile data
 * @property {boolean} loading - Whether request is loading
 * @property {Error | null} error - Error if any
 * @property {() => Promise<User | null>} refresh - Refresh profile
 */

/**
 * Hook for managing user profile
 * @param {UseProfileOptions} [options] - Hook options
 * @returns {UseProfileReturn} Profile state and methods
 */
export function useProfile({ immediate = true } = {}) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    const token = AuthService.authStorage.get();
    if (!token) {
      setProfile(null);
      return null;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await AuthService.profile();
      if (res?.user) setProfile(res.user);
      return res?.user || null;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (immediate) refresh();
  }, [immediate, refresh]);

  return { profile, loading, error, refresh };
}

export default useProfile;

"use client";
import { useMemo } from "react";
import AuthService from "../services/authService";

export function useAuthorization({
  requireRoles = [],
  allowGuest = false,
} = {}) {
  const token = AuthService.authStorage.get();

  const allowed = useMemo(() => {
    if (!token) return allowGuest;
    return true;
  }, [token, allowGuest]);

  return { allowed };
}

export default useAuthorization;

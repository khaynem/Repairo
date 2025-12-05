export const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000/api";

export const endpoints = {
  auth: {
    login: "/auth/login",
    register: "/auth/register",
    profile: "/auth/profile",
    me: "/auth/me",
  },
  repairs: {
    list: "/repairs",
    create: "/repairs",
    available: "/repairs/available",
    claim: (id) => `/repairs/${id}/claim`,
    update: (id) => `/repairs/${id}`,
    delete: (id) => `/repairs/${id}`,
    get: (id) => `/repairs/${id}`,
  },
  messages: {
    list: "/messages",
    send: "/messages",
    conversation: (repairId) => `/messages?repairId=${repairId}`,
  },
};

export function buildUrl(path) {
  if (!path) return BASE_URL;
  if (/^https?:\/\//i.test(path)) return path;
  return `${BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

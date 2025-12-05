import { cache } from "react";

/**
 * Request deduplication utility for API calls using React's cache()
 * This ensures multiple components requesting the same data receive the same promise
 */

/**
 * Cached function to fetch user profile
 * @param {string} userId - User ID to fetch
 * @param {string} token - Authorization token
 * @returns {Promise<Object>} User profile data
 */
export const getCachedUserProfile = cache(async (userId, token) => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
  const response = await fetch(`${baseUrl}/api/auth/profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch user profile");
  }

  return response.json();
});

/**
 * Cached function to fetch repairs
 * @param {string} token - Authorization token
 * @returns {Promise<Array>} Array of repair jobs
 */
export const getCachedRepairs = cache(async (token) => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
  const response = await fetch(`${baseUrl}/api/repairs`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch repairs");
  }

  return response.json();
});

/**
 * Add cache control headers to API responses
 * @param {Object} options - Cache configuration
 * @returns {Object} Headers object
 */
export function getCacheHeaders(options = {}) {
  const {
    type = "private",
    maxAge = 0,
    staleWhileRevalidate = 0,
    mustRevalidate = true,
  } = options;

  const directives = [type];

  if (maxAge > 0) {
    directives.push(`max-age=${maxAge}`);
  } else {
    directives.push("no-cache", "no-store");
  }

  if (staleWhileRevalidate > 0) {
    directives.push(`stale-while-revalidate=${staleWhileRevalidate}`);
  }

  if (mustRevalidate) {
    directives.push("must-revalidate");
  }

  return {
    "Cache-Control": directives.join(", "),
    Pragma: maxAge === 0 ? "no-cache" : undefined,
    Expires: maxAge === 0 ? "0" : undefined,
  };
}

/**
 * Cache configurations for different data types
 */
export const CacheConfig = {
  // Static content - cache for 1 year
  STATIC: {
    type: "public",
    maxAge: 31536000,
    mustRevalidate: false,
  },

  // User-specific data - no cache
  PRIVATE: {
    type: "private",
    maxAge: 0,
    mustRevalidate: true,
  },

  // Public data with revalidation - cache for 60 seconds
  PUBLIC_SHORT: {
    type: "public",
    maxAge: 60,
    staleWhileRevalidate: 120,
    mustRevalidate: true,
  },

  // Public data with longer cache - cache for 5 minutes
  PUBLIC_MEDIUM: {
    type: "public",
    maxAge: 300,
    staleWhileRevalidate: 600,
    mustRevalidate: true,
  },
};

"use client";

import { buildUrl } from "../constants/api";

const getToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("token") : null;

/**
 * Make HTTP request
 * @template T
 * @param {string} path - API endpoint path
 * @param {Object} [options] - Request options
 * @param {string} [options.method='GET'] - HTTP method
 * @param {Object} [options.headers={}] - Request headers
 * @param {any} [options.body] - Request body
 * @param {Object} [options.params] - Query parameters
 * @param {boolean} [options.withAuth=true] - Include auth token
 * @returns {Promise<T>} Response data
 */
async function request(path, options = {}) {
  const {
    method = "GET",
    headers = {},
    body,
    params,
    withAuth = true,
  } = options;

  const url = new URL(buildUrl(path));
  if (params && typeof params === "object") {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    });
  }

  const token = withAuth ? getToken() : null;

  const init = { method, headers: { ...headers } };

  if (body !== undefined) {
    if (body instanceof FormData) {
      init.body = body; // browser sets proper boundary content-type
    } else {
      init.body = JSON.stringify(body);
      init.headers["Content-Type"] =
        init.headers["Content-Type"] || "application/json";
    }
  }

  if (token) {
    init.headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(url.toString(), init);
  let data;
  const text = await res.text();
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    const message = (data && (data.message || data.error)) || res.statusText;
    const error = new Error(message);
    error.status = res.status;
    error.data = data;
    throw error;
  }
  return data;
}

/**
 * Make GET request
 * @template T
 * @param {string} path - API endpoint path
 * @param {Object} [options] - Request options
 * @returns {Promise<T>} Response data
 */
const get = (path, options) => request(path, { ...options, method: "GET" });

/**
 * Make POST request
 * @template T
 * @param {string} path - API endpoint path
 * @param {any} body - Request body
 * @param {Object} [options] - Request options
 * @returns {Promise<T>} Response data
 */
const post = (path, body, options) =>
  request(path, { ...options, method: "POST", body });

/**
 * Make PUT request
 * @template T
 * @param {string} path - API endpoint path
 * @param {any} body - Request body
 * @param {Object} [options] - Request options
 * @returns {Promise<T>} Response data
 */
const put = (path, body, options) =>
  request(path, { ...options, method: "PUT", body });

/**
 * Make DELETE request
 * @template T
 * @param {string} path - API endpoint path
 * @param {Object} [options] - Request options
 * @returns {Promise<T>} Response data
 */
const del = (path, options) => request(path, { ...options, method: "DELETE" });

export const RequestService = { request, get, post, put, del };
export default RequestService;

import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|images/).*)",
  ],
  runtime: "edge",
};

const PUBLIC_ROUTES = ["/", "/login", "/api/auth/login", "/api/auth/register"];
const CUSTOMER_ROUTES = ["/dashboard"];
const TECHNICIAN_ROUTES = ["/technician"];

const SECURITY_HEADERS = {
  "X-DNS-Prefetch-Control": "on",
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
  "X-Frame-Options": "SAMEORIGIN",
  "X-Content-Type-Options": "nosniff",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
};

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Credentials": "true",
  "Access-Control-Max-Age": "86400",
};

/**
 * Verify JWT token using jose library
 * @param {string} token - JWT token to verify
 * @returns {Promise<{userId: string, role: string} | null>} Decoded token payload or null
 */
async function verifyToken(token) {
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    const userId = payload.userId || payload.id || payload.sub;
    const role = payload.role || "customer";

    if (!userId) return null;

    return { userId, role };
  } catch (error) {
    console.error("Token verification failed:", error.message);
    return null;
  }
}

/**
 * Check if route matches pattern
 * @param {string} pathname - Current pathname
 * @param {string[]} routes - Array of route patterns
 * @returns {boolean} True if route matches
 */
function matchesRoute(pathname, routes) {
  return routes.some((route) => {
    if (route === pathname) return true;
    if (route.endsWith("*")) {
      return pathname.startsWith(route.slice(0, -1));
    }
    if (pathname.startsWith(route + "/")) return true;
    return false;
  });
}

/**
 * Main middleware function
 * @param {Request} request - Incoming request
 * @returns {Promise<NextResponse>} Response
 */
export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Handle CORS preflight requests
  if (request.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 200,
      headers: CORS_HEADERS,
    });
  }

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    (pathname.includes(".") && !pathname.includes("/api/"))
  ) {
    return NextResponse.next();
  }

  const response = NextResponse.next();

  // Add CORS headers to all responses
  Object.entries(CORS_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Add security headers
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  if (matchesRoute(pathname, PUBLIC_ROUTES)) {
    return response;
  }

  let token = request.cookies.get("token")?.value;

  if (!token) {
    const authHeader = request.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }
  }

  if (token === "dev-token") {
    console.warn("⚠️  Using dev-token bypass - not for production!");
    return response;
  }

  if (!token) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "Unauthorized - No token provided" },
        { status: 401 }
      );
    }

    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const decoded = await verifyToken(token);

  if (!decoded) {
    if (pathname.startsWith("/api/")) {
      console.error("Middleware - Token verification failed for:", pathname);
      return NextResponse.json(
        { error: "Unauthorized - Invalid token" },
        { status: 401 }
      );
    }

    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    const redirectResponse = NextResponse.redirect(loginUrl);
    redirectResponse.cookies.delete("token");
    return redirectResponse;
  }

  const { role } = decoded;

  if (pathname.startsWith("/api/")) {
    console.log("Middleware - Setting headers for API route:", pathname, {
      userId: decoded.userId,
      role: decoded.role,
    });
    
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("X-User-Id", decoded.userId);
    requestHeaders.set("X-User-Role", decoded.role);
    
    const modifiedResponse = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
    
    Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
      modifiedResponse.headers.set(key, value);
    });
    
    return modifiedResponse;
  }

  if (matchesRoute(pathname, TECHNICIAN_ROUTES)) {
    if (role !== "technician" && role !== "admin") {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json(
          { error: "Forbidden - Technician access required" },
          { status: 403 }
        );
      }
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  if (matchesRoute(pathname, CUSTOMER_ROUTES)) {
    if (role === "technician" || role === "admin") {
      return NextResponse.redirect(new URL("/technician", request.url));
    }
  }

  if (pathname === "/login") {
    const dashboardUrl =
      role === "technician" || role === "admin"
        ? new URL("/technician", request.url)
        : new URL("/dashboard", request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return response;
}
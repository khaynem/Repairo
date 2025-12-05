import nextDynamic from "next/dynamic";
import { Suspense } from "react";

// Lazy load LoginClient with proper loading fallback
const LoginClient = nextDynamic(() => import("./LoginClient"), {
  loading: () => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      }}
    >
      <div
        style={{
          padding: "24px",
          background: "white",
          borderRadius: "12px",
          boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              border: "4px solid #e5e7eb",
              borderTop: "4px solid #3b82f6",
              borderRadius: "50%",
              margin: "0 auto 16px",
              animation: "spin 1s linear infinite",
            }}
          />
          <p style={{ color: "#64748b", fontSize: "14px" }}>Loading...</p>
        </div>
      </div>
    </div>
  ),
});

// Force static generation for login page (SSG)
export const dynamic = "force-static";
export const revalidate = false;

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata = {
  title: "Login",
  description:
    "Sign in to your Repairo account to manage repair requests, track device repairs, and connect with certified technicians.",
  keywords: [
    "login",
    "sign in",
    "account access",
    "repair dashboard",
    "technician portal",
  ],
  openGraph: {
    title: "Login — Repairo",
    description:
      "Sign in to your Repairo account to manage repair requests and track device repairs.",
    type: "website",
    url: "/login",
    siteName: "Repairo",
  },
  twitter: {
    card: "summary",
    title: "Login — Repairo",
    description: "Sign in to your Repairo account to manage repair requests.",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "/login",
  },
};

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          }}
        >
          <div
            style={{
              padding: "24px",
              background: "white",
              borderRadius: "12px",
              boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  border: "4px solid #e5e7eb",
                  borderTop: "4px solid #3b82f6",
                  borderRadius: "50%",
                  margin: "0 auto 16px",
                  animation: "spin 1s linear infinite",
                }}
              />
              <p style={{ color: "#64748b", fontSize: "14px" }}>Loading...</p>
            </div>
          </div>
        </div>
      }
    >
      <LoginClient />
    </Suspense>
  );
}

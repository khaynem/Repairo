import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import nextDynamic from "next/dynamic";
import { Suspense } from "react";

// Lazy load DashboardClient with loading state
const DashboardClient = nextDynamic(() => import("./DashboardClient"), {
  loading: () => (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f8fafc",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            width: "56px",
            height: "56px",
            border: "5px solid #e5e7eb",
            borderTop: "5px solid #3b82f6",
            borderRadius: "50%",
            margin: "0 auto 20px",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <p style={{ color: "#64748b", fontSize: "16px", fontWeight: "500" }}>
          Loading Dashboard...
        </p>
      </div>
    </div>
  ),
});

// Force dynamic rendering for authenticated pages (SSR for real-time data)
export const dynamic = "force-dynamic";
export const revalidate = 0;

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata = {
  title: "Dashboard",
  description:
    "Manage your repair requests, track device repair status, and communicate with certified technicians in real-time.",
  keywords: [
    "repair dashboard",
    "track repair",
    "repair status",
    "manage repairs",
    "repair history",
  ],
  openGraph: {
    title: "Dashboard — Repairo",
    description:
      "Manage your repair requests and track their status in real-time.",
    type: "website",
  },
  robots: {
    index: false, // Don't index authenticated pages
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default async function DashboardPage() {
  // Server-side auth check
  const cookieStore = await cookies();
  const token = cookieStore.get("token");

  if (!token) {
    redirect("/login?redirect=/dashboard");
  }

  // Fetch initial data on server
  let initialJobs = [];
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/repairs`, {
      headers: {
        Authorization: `Bearer ${token.value}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
      next: { revalidate: 0 },
    });

    if (response.ok) {
      initialJobs = await response.json();
    }
  } catch (error) {
    console.error("Failed to fetch initial jobs:", error);
    // Continue with empty array - client will handle it
  }

  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#f8fafc",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                width: "56px",
                height: "56px",
                border: "5px solid #e5e7eb",
                borderTop: "5px solid #3b82f6",
                borderRadius: "50%",
                margin: "0 auto 20px",
                animation: "spin 0.8s linear infinite",
              }}
            />
            <p
              style={{ color: "#64748b", fontSize: "16px", fontWeight: "500" }}
            >
              Loading Dashboard...
            </p>
          </div>
        </div>
      }
    >
      <DashboardClient initialJobs={initialJobs} />
    </Suspense>
  );
}

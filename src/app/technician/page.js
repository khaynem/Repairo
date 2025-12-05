import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import nextDynamic from "next/dynamic";
import { Suspense } from "react";

// Lazy load TechnicianClient with loading state
const TechnicianClient = nextDynamic(() => import("./TechnicianClient"), {
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
          Loading Technician Dashboard...
        </p>
      </div>
    </div>
  ),
});

// Force dynamic rendering for authenticated pages (SSR for real-time job data)
export const dynamic = "force-dynamic";
export const revalidate = 0;

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata = {
  title: "Technician Dashboard",
  description:
    "Manage your assigned repair jobs, view available requests, track job progress, and communicate with clients.",
  keywords: [
    "technician dashboard",
    "repair jobs",
    "assigned repairs",
    "job management",
    "technician portal",
  ],
  openGraph: {
    title: "Technician Dashboard — Repairo",
    description: "Manage your assigned repair jobs and track progress.",
    type: "website",
  },
  robots: {
    index: false, // Don't index authenticated technician pages
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default async function TechnicianPage() {
  // Server-side auth check
  const cookieStore = await cookies();
  const token = cookieStore.get("token");

  if (!token) {
    redirect("/login?redirect=/technician");
  }

  // Fetch initial assigned jobs on server
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
    // Continue with empty array - client will use fallback data
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
              Loading Technician Dashboard...
            </p>
          </div>
        </div>
      }
    >
      <TechnicianClient initialJobs={initialJobs} />
    </Suspense>
  );
}

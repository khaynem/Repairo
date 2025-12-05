import { Suspense } from "react";
import dynamic from "next/dynamic";

export const metadata = {
  title: "Messages",
  description:
    "Communicate with clients about repair jobs and provide real-time updates on job progress.",
  robots: {
    index: false,
    follow: false,
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

// Lazy load the client component
const TechnicianMessagesContent = dynamic(() => import("./MessagesContent"), {
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
            width: "48px",
            height: "48px",
            border: "4px solid #e5e7eb",
            borderTop: "4px solid #3b82f6",
            borderRadius: "50%",
            margin: "0 auto 16px",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <p style={{ color: "#64748b", fontSize: "14px" }}>
          Loading Messages...
        </p>
      </div>
    </div>
  ),
});

export default function TechnicianMessagesPage() {
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
                width: "48px",
                height: "48px",
                border: "4px solid #e5e7eb",
                borderTop: "4px solid #3b82f6",
                borderRadius: "50%",
                margin: "0 auto 16px",
                animation: "spin 0.8s linear infinite",
              }}
            />
            <p style={{ color: "#64748b", fontSize: "14px" }}>
              Loading Messages...
            </p>
          </div>
        </div>
      }
    >
      <TechnicianMessagesContent />
    </Suspense>
  );
}

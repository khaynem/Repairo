import nextDynamic from "next/dynamic";
import { Suspense } from "react";

export const metadata = {
  title: "Available Requests",
  description:
    "Browse and accept available repair requests from clients in your service area.",
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

const AvailableRequestsClient = nextDynamic(
  () => import("./AvailableRequestsClient"),
  {
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
            Loading Requests...
          </p>
        </div>
      </div>
    ),
  }
);

export default function AvailableRequests() {
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
              Loading Requests...
            </p>
          </div>
        </div>
      }
    >
      <AvailableRequestsClient />
    </Suspense>
  );
}

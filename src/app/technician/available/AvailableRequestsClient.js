"use client";
import { Suspense, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import styles from "../technician.module.css";
import {
  FaTools,
  FaMobileAlt,
  FaLaptop,
  FaBlender,
  FaClock,
} from "react-icons/fa";
import Badge from "@/components/atoms/Badge";

// Lazy load TechNavbar
const TechNavbar = dynamic(() => import("../TechNavbar"), {
  loading: () => (
    <div
      style={{
        height: "64px",
        background: "white",
        borderBottom: "1px solid #e5e7eb",
      }}
    />
  ),
  ssr: false,
});

export default function AvailableRequestsClient() {
  const [available, setAvailable] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAvailableJobs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found");
        return;
      }

      console.log("Fetching available jobs...");
      const response = await fetch("/api/repairs/available", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("Available jobs response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("Available jobs data:", data);
        
        // Log first item to check preferredDate
        if (data.length > 0) {
          console.log("First available job:", {
            id: data[0]._id,
            title: data[0].title,
            preferredDate: data[0].preferredDate,
            createdAt: data[0].createdAt,
            hasPreferredDate: !!data[0].preferredDate
          });
        }
        
        setAvailable(Array.isArray(data) ? data : []);
      } else {
        const error = await response.json();
        console.error("Failed to fetch available jobs:", error);
        toast.error(error.error || "Failed to fetch available jobs");
      }
    } catch (err) {
      console.error("Error fetching available jobs:", err);
      toast.error("Failed to fetch available jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailableJobs();
  }, []);

  async function claim(id) {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(`/api/repairs/${id}/claim`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        toast.success("Job claimed successfully!");
        fetchAvailableJobs(); // Refresh to remove claimed job from list
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to claim job");
      }
    } catch (err) {
      console.error("Error claiming job:", err);
      toast.error("Failed to claim job");
    }
  }



  const getDeviceIcon = (device) => {
    if (device === "Phone") return <FaMobileAlt />;
    if (device === "Laptop") return <FaLaptop />;
    if (device === "Appliance") return <FaBlender />;
    return <FaTools />;
  };

  const getPriorityBadge = (priority) => {
    if (priority === "high") return <Badge status="cancelled">High</Badge>;
    if (priority === "medium") return <Badge status="pending">Medium</Badge>;
    if (priority === "low") return <Badge status="completed">Low</Badge>;
    return <Badge>{priority}</Badge>;
  };

  return (
    <div className={styles.page}>
      <Suspense
        fallback={
          <div
            style={{
              height: "64px",
              background: "white",
              borderBottom: "1px solid #e5e7eb",
            }}
          />
        }
      >
        <TechNavbar />
      </Suspense>
      <main className={`container ${styles.main}`}>
        <div className={styles.welcome}>
          <div>
            <h1 className={styles.welcomeTitle}>Available Requests 🔧</h1>
            <p className={styles.welcomeSubtitle}>
              Claim jobs that match your skills
            </p>
          </div>
        </div>

        <section className={styles.tableSection}>
          <div className={styles.tableHeader}>
            <h2 className={styles.sectionTitle}>
              <FaClock /> Open Requests
            </h2>
            <span style={{ fontSize: 14, color: "#64748b" }}>
              {available.length} available
            </span>
          </div>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Device</th>
                  <th>Issue</th>
                  <th>Preferred Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: "center", padding: "20px" }}>
                      Loading available jobs...
                    </td>
                  </tr>
                ) : available.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: "center", padding: "20px" }}>
                      No available jobs at the moment
                    </td>
                  </tr>
                ) : (
                  available.map((r) => (
                    <tr key={r._id || r.id}>
                      <td>
                        <span className={styles.jobId}>
                          #{r._id?.toString().slice(-6) || r.id}
                        </span>
                      </td>
                      <td>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                          }}
                        >
                          <span style={{ color: "#2563eb", fontSize: 18 }}>
                            {getDeviceIcon(r.title?.split(" - ")[0] || r.device)}
                          </span>
                          <div>
                            <div style={{ fontWeight: 500 }}>
                              {r.title || r.device}
                            </div>
                            <div style={{ fontSize: 12, color: "#64748b" }}>
                              {r.userId?.username || "Customer"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className={styles.issueCell}>
                        {r.description || r.issue}
                      </td>
                      <td className={styles.dateCell}>
                        {r.preferredDate ? new Date(r.preferredDate).toLocaleDateString() : (r.createdAt ? new Date(r.createdAt).toLocaleDateString() : r.posted)}
                      </td>
                      <td>
                        <button
                          className={styles.btnGhost}
                          onClick={() => claim(r._id || r.id)}
                        >
                          Claim Job
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

"use client";
import { useState, useEffect, Suspense } from "react";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import styles from "./technician.module.css";
import {
  FaBriefcase,
  FaSpinner,
  FaClock,
  FaCheckCircle,
  FaTools,
  FaExclamationTriangle,
} from "react-icons/fa";
import Badge from "@/components/atoms/Badge";

// Lazy load TechNavbar
const TechNavbar = dynamic(() => import("./TechNavbar"), {
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

// Fallback sample data for when API fails
export default function TechnicianClient({ initialJobs = [] }) {
  const [jobs, setJobs] = useState(initialJobs);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch("/api/repairs", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setJobs(Array.isArray(data) ? data : []);
      } else {
        setError("Failed to fetch jobs");
      }
    } catch (err) {
      console.error("Error fetching jobs:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 30000);
    return () => clearInterval(interval);
  }, []);

  async function markCompleted(id) {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(`/api/repairs/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "Completed" }),
      });

      if (response.ok) {
        toast.success("Job marked as completed!");
        fetchJobs(); // Refresh the list
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to mark job as completed");
      }
    } catch (err) {
      console.error("Error marking job as completed:", err);
      toast.error("Failed to mark job as completed");
    }
  }

  function goToMessages() {
    window.location.href = `/technician/messages`;
  }

  const assigned = Array.isArray(jobs) ? jobs : [];

  const stats = {
    total: assigned.length,
    assigned: assigned.filter(
      (a) => a.status === "Assigned" || a.status === "Pending"
    ).length,
    completed: assigned.filter((a) => a.status === "Completed").length,
  };

  const getStatusBadge = (status) => {
    if (status === "In Progress")
      return <Badge status="in_progress">{status}</Badge>;
    if (status === "Completed")
      return <Badge status="completed">{status}</Badge>;
    if (status === "Pending") return <Badge status="pending">{status}</Badge>;
    return <Badge>{status}</Badge>;
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
            <h1 className={styles.welcomeTitle}>
              Welcome back, Technician! 👋
            </h1>
            <p className={styles.welcomeSubtitle}>
              Here&apos;s your overview for today
            </p>
          </div>
          {error && (
            <div className={styles.errorBanner}>
              <FaExclamationTriangle />
              <span>Failed to load from API. Showing sample data.</span>
            </div>
          )}
        </div>

        <section className={styles.cards}>
          <div className={`${styles.card} ${styles.cardTotal}`}>
            <div className={styles.cardIcon}>
              <FaBriefcase size={24} />
            </div>
            <div className={styles.cardContent}>
              <strong className={styles.cardLabel}>Total Jobs</strong>
              <span className={styles.cardValue}>{stats.total}</span>
            </div>
          </div>
          <div className={`${styles.card} ${styles.cardAssigned}`}>
            <div className={styles.cardIcon}>
              <FaClock size={24} />
            </div>
            <div className={styles.cardContent}>
              <strong className={styles.cardLabel}>Assigned</strong>
              <span className={styles.cardValue}>{stats.assigned}</span>
            </div>
          </div>
          <div className={`${styles.card} ${styles.cardCompleted}`}>
            <div className={styles.cardIcon}>
              <FaCheckCircle size={24} />
            </div>
            <div className={styles.cardContent}>
              <strong className={styles.cardLabel}>Completed</strong>
              <span className={styles.cardValue}>{stats.completed}</span>
            </div>
          </div>
        </section>

        <section className={styles.tableSection}>
          <div className={styles.tableHeader}>
            <h2 className={styles.sectionTitle}>
              <FaTools /> My Assigned Jobs
            </h2>
            {loading && (
              <span className={styles.loadingText}>
                <FaSpinner className={styles.spinIcon} /> Loading...
              </span>
            )}
          </div>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Client</th>
                  <th>Device</th>
                  <th>Issue</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {assigned.length === 0 ? (
                  <tr>
                    <td colSpan={7} className={styles.emptyState}>
                      <FaTools size={48} />
                      <p>No jobs assigned yet</p>
                      <span>Check the Available tab for new requests</span>
                    </td>
                  </tr>
                ) : (
                  assigned.map((row) => (
                    <tr key={row._id || row.id}>
                      <td>
                        <span className={styles.jobId}>#{row._id?.toString().slice(-6) || row.id}</span>
                      </td>
                      <td className={styles.clientCell}>
                        {row.userId?.username || row.client || "Unknown"}
                      </td>
                      <td>{row.title || row.device}</td>
                      <td className={styles.issueCell}>
                        {row.description || row.issue}
                      </td>
                      <td>{getStatusBadge(row.status)}</td>
                      <td className={styles.dateCell}>
                        {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : row.date}
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
                          {row.status !== "Completed" && (
                            <button
                              className={styles.btn}
                              onClick={() => markCompleted(row._id || row.id)}
                              style={{ fontSize: "13px", padding: "6px 12px" }}
                            >
                              Job Completed
                            </button>
                          )}
                          <button
                            className={styles.btnGhost}
                            onClick={goToMessages}
                            style={{ fontSize: "13px", padding: "6px 12px" }}
                          >
                            View Messages
                          </button>
                        </div>
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

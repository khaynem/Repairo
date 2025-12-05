"use client";
import { useState, useEffect, Suspense } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./dashboard.module.css";
import { FaUserCircle, FaChevronDown } from "react-icons/fa";
import { useAuth } from "../../hooks/useAuth";
import Badge from "@/components/atoms/Badge";
import { JobStatus } from "@/interfaces/api.types";

const NewRepairRequest = dynamic(
  () => import("../components/NewRepairRequest"),
  {
    loading: () => (
      <div
        style={{
          padding: "24px",
          background: "white",
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <div
          style={{
            height: "400px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                border: "4px solid #e5e7eb",
                borderTop: "4px solid #3b82f6",
                borderRadius: "50%",
                margin: "0 auto 12px",
                animation: "spin 0.8s linear infinite",
              }}
            />
            <p style={{ color: "#94a3b8", fontSize: "14px" }}>
              Loading form...
            </p>
          </div>
        </div>
      </div>
    ),
    ssr: false,
  }
);

const RepairHistory = dynamic(() => import("../components/RepairHistory"), {
  loading: () => (
    <div
      style={{
        padding: "24px",
        background: "white",
        borderRadius: "12px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      }}
    >
      <div
        style={{
          height: "300px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              border: "4px solid #e5e7eb",
              borderTop: "4px solid #3b82f6",
              borderRadius: "50%",
              margin: "0 auto 12px",
              animation: "spin 0.8s linear infinite",
            }}
          />
          <p style={{ color: "#94a3b8", fontSize: "14px" }}>
            Loading history...
          </p>
        </div>
      </div>
    </div>
  ),
  ssr: false,
});

export default function DashboardClient({ initialJobs = [] }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { logout } = useAuth();
  const [jobs, setJobs] = useState(initialJobs);
  const [loading, setLoading] = useState(false);
  
  const isActive = (path) => {
    if (path === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname?.startsWith(path);
  };

  const fetchJobs = async () => {
    try {
      setLoading(true);
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
      }
    } catch (err) {
      console.error("Error fetching jobs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 30000);
    return () => clearInterval(interval);
  }, []);

  const [statusFilter, setStatusFilter] = useState(null);

  const handleNewRepairSubmit = (newRepair) => {
    setJobs((prev) => [newRepair, ...prev]);
  };

  const mapStatus = (status) => {
    const statusMap = {
      pending: "Pending",
      assigned: "Assigned",
      in_progress: "In Progress",
      completed: "Completed",
      cancelled: "Cancelled"
    };
    return statusMap[status?.toLowerCase()] || status;
  };

  const repairItems = jobs.map(job => ({
    id: job._id,
    device: job.title?.split(' - ')[0] || "Unknown",
    model: job.title?.split(' - ')[1] || "",
    issue: job.description,
    date: new Date(job.createdAt).toISOString().split('T')[0],
    status: mapStatus(job.status)
  }));

  const localStats = {
    pending: repairItems.filter((item) => item.status === "Pending" || item.status === "Assigned").length,
    inProgress: repairItems.filter((item) => item.status === "In Progress").length,
    completed: repairItems.filter((item) => item.status === "Completed").length,
  };

  const filteredItems = statusFilter
    ? repairItems.filter((item) => item.status === statusFilter)
    : repairItems;

  const handleStatusClick = (status) => {
    setStatusFilter(statusFilter === status ? null : status);
  };

  return (
    <div className={styles.page}>
      <header className={styles.navbar}>
        <div className={`container ${styles.navInner}`}>
          <Link href="/dashboard" className={styles.brand}>
            <img
              className={styles.logoImg}
              src="/images/logo.png"
              alt="Repairo logo"
            />
            <span>Repairo</span>
          </Link>
          <nav className={styles.navLinks}>
            <Link 
              href="/dashboard"
              className={isActive("/dashboard") ? styles.active : ""}
            >
              Dashboard
            </Link>
            <Link 
              href="/dashboard/messages"
              className={isActive("/dashboard/messages") ? styles.active : ""}
            >
              Messages
            </Link>
            <Link 
              href="/dashboard/profile"
              className={isActive("/dashboard/profile") ? styles.active : ""}
            >
              Profile
            </Link>
          </nav>
          <div className={styles.user}>
            <button
              className={styles.userBtn}
              onClick={() => setOpen((o) => !o)}
            >
              <FaUserCircle size={22} /> <FaChevronDown />
            </button>
            {open && (
              <div className={styles.dropdown}>
                <button
                  onClick={() => {
                    setOpen(false);
                    logout();
                  }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className={`container ${styles.main}`}>
        <section className={styles.left}>
          <Suspense
            fallback={
              <div
                style={{
                  padding: "24px",
                  background: "white",
                  borderRadius: "12px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                }}
              >
                <div
                  style={{
                    height: "400px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div style={{ textAlign: "center" }}>
                    <div
                      style={{
                        width: "40px",
                        height: "40px",
                        border: "4px solid #e5e7eb",
                        borderTop: "4px solid #3b82f6",
                        borderRadius: "50%",
                        margin: "0 auto 12px",
                        animation: "spin 0.8s linear infinite",
                      }}
                    />
                    <p style={{ color: "#94a3b8", fontSize: "14px" }}>
                      Loading form...
                    </p>
                  </div>
                </div>
              </div>
            }
          >
            <NewRepairRequest onSubmit={handleNewRepairSubmit} />
          </Suspense>
        </section>
        <section className={styles.right}>
          <div className={styles.stats}>
            <div
              className={`${styles.stat} ${styles.pending} ${
                styles.clickableStat
              } ${statusFilter === "Pending" ? styles.activeStat : ""}`}
              onClick={() => handleStatusClick("Pending")}
              role="button"
              tabIndex={0}
              onKeyPress={(e) =>
                e.key === "Enter" && handleStatusClick("Pending")
              }
            >
              <span className={styles.statLabel}>
                Pending
                <Badge status={JobStatus.PENDING} style={{ marginLeft: "8px" }}>
                </Badge>
              </span>
              <span className={styles.statValue}>{localStats.pending}</span>
            </div>
            <div
              className={`${styles.stat} ${styles.inProgress} ${
                styles.clickableStat
              } ${statusFilter === "In Progress" ? styles.activeStat : ""}`}
              onClick={() => handleStatusClick("In Progress")}
              role="button"
              tabIndex={0}
              onKeyPress={(e) =>
                e.key === "Enter" && handleStatusClick("In Progress")
              }
            >
              <span className={styles.statLabel}>
                In Progress
                <Badge
                  status={JobStatus.IN_PROGRESS}
                  style={{ marginLeft: "8px" }}
                >
                </Badge>
              </span>
              <span className={styles.statValue}>{localStats.inProgress}</span>
            </div>
            <div
              className={`${styles.stat} ${styles.completed} ${
                styles.clickableStat
              } ${statusFilter === "Completed" ? styles.activeStat : ""}`}
              onClick={() => handleStatusClick("Completed")}
              role="button"
              tabIndex={0}
              onKeyPress={(e) =>
                e.key === "Enter" && handleStatusClick("Completed")
              }
            >
              <span className={styles.statLabel}>
                Completed
                <Badge
                  status={JobStatus.COMPLETED}
                  style={{ marginLeft: "8px" }}
                >
                </Badge>
              </span>
              <span className={styles.statValue}>{localStats.completed}</span>
            </div>
          </div>
          <Suspense
            fallback={
              <div
                style={{
                  padding: "24px",
                  background: "white",
                  borderRadius: "12px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                }}
              >
                <div
                  style={{
                    height: "300px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div style={{ textAlign: "center" }}>
                    <div
                      style={{
                        width: "40px",
                        height: "40px",
                        border: "4px solid #e5e7eb",
                        borderTop: "4px solid #3b82f6",
                        borderRadius: "50%",
                        margin: "0 auto 12px",
                        animation: "spin 0.8s linear infinite",
                      }}
                    />
                    <p style={{ color: "#94a3b8", fontSize: "14px" }}>
                      Loading history...
                    </p>
                  </div>
                </div>
              </div>
            }
          >
            <RepairHistory items={filteredItems} filterStatus={statusFilter} />
          </Suspense>
        </section>
      </main>
    </div>
  );
}

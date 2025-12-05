"use client";
import { useState, useEffect } from "react";
import {
  FaMobileAlt,
  FaLaptop,
  FaTabletAlt,
  FaTv,
  FaClock,
  FaSpinner,
  FaCheckCircle,
  FaTimes,
} from "react-icons/fa";
import styles from "./RepairHistory.module.css";

const deviceIcons = {
  Phone: <FaMobileAlt className={styles.deviceIconSvg} size={24} />,
  Laptop: <FaLaptop className={styles.deviceIconSvg} size={24} />,
  Tablet: <FaTabletAlt className={styles.deviceIconSvg} size={24} />,
  Appliance: <FaTv className={styles.deviceIconSvg} size={24} />,
};

const statusIcons = {
  Pending: (
    <FaClock
      className={`${styles.statusIcon} ${styles.statusIconPending}`}
      size={16}
    />
  ),
  "In Progress": (
    <FaSpinner
      className={`${styles.statusIcon} ${styles.statusIconProgress}`}
      size={16}
    />
  ),
  Completed: (
    <FaCheckCircle
      className={`${styles.statusIcon} ${styles.statusIconCompleted}`}
      size={16}
    />
  ),
};

function formatDate(dateStr) {
  const d = new Date(dateStr);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${mm}/${dd}/${yyyy}`;
}

export default function RepairHistory({ items = [], filterStatus = null }) {
  const [selectedItem, setSelectedItem] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (selectedItem && mounted) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [selectedItem, mounted]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && selectedItem) {
        closeModal();
      }
    };

    if (mounted) {
      window.addEventListener("keydown", handleEscape);
      return () => window.removeEventListener("keydown", handleEscape);
    }
  }, [selectedItem, mounted]);

  const tagClass = (status) =>
    status === "Pending"
      ? `${styles.tag} ${styles.tagPending}`
      : status === "In Progress"
      ? `${styles.tag} ${styles.tagProgress}`
      : `${styles.tag} ${styles.tagCompleted}`;

  const handleItemClick = (item) => {
    setSelectedItem(item);
  };

  const closeModal = () => {
    setSelectedItem(null);
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3>Repair History</h3>
        {filterStatus && (
          <span className={styles.filterBadge}>Showing: {filterStatus}</span>
        )}
      </div>
      <div className={styles.list}>
        {items.length === 0 ? (
          <p className={styles.emptyMessage}>
            {filterStatus
              ? `No ${filterStatus.toLowerCase()} requests found.`
              : "No repair history yet. Submit a request to get started!"}
          </p>
        ) : null}
        {items.map((item) => (
          <div
            key={item.id}
            className={`${styles.item} ${styles.clickable}`}
            onClick={() => handleItemClick(item)}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => e.key === "Enter" && handleItemClick(item)}
          >
            <div className={styles.row}>
              <div className={styles.infoLeft}>
                <div className={styles.deviceIcon}>
                  {deviceIcons[item.device] || (
                    <FaTv className={styles.deviceIconSvg} size={24} />
                  )}
                </div>
                <div className={styles.meta}>
                  <h4 className={styles.title}>
                    {item.device} • {item.model}
                  </h4>
                  <p className={styles.desc}>{item.issue}</p>
                  <p className={styles.date}>{formatDate(item.date)}</p>
                </div>
              </div>
              <div className={styles.statusWrap}>
                <span className={tagClass(item.status)}>
                  {statusIcons[item.status]}
                  {item.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal - Only render when mounted on client */}
      {mounted && selectedItem && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h3>Repair Request Details</h3>
              <button
                className={styles.closeBtn}
                onClick={closeModal}
                aria-label="Close"
              >
                <FaTimes size={20} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Device Type:</span>
                <span className={styles.detailValue}>
                  {selectedItem.device}
                </span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Model:</span>
                <span className={styles.detailValue}>{selectedItem.model}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Issue Description:</span>
                <span className={styles.detailValue}>{selectedItem.issue}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Preferred Date:</span>
                <span className={styles.detailValue}>
                  {formatDate(selectedItem.date)}
                </span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Status:</span>
                <span className={tagClass(selectedItem.status)}>
                  {statusIcons[selectedItem.status]}
                  {selectedItem.status}
                </span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Request ID:</span>
                <span className={styles.detailValue}>#{selectedItem.id}</span>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.modalCloseBtn} onClick={closeModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import React from "react";
import styles from "./authLoader.module.css";

export default function AuthLoader({
  visible = false,
  message = "Signing you in",
}) {
  if (!visible) return null;

  return (
    <div className={styles.overlay} role="status" aria-live="polite">
      <div className={styles.card}>
        <div className={styles.spinner} aria-hidden="true">
          <svg viewBox="0 0 50 50" className={styles.ring}>
            <circle cx="25" cy="25" r="20" className={styles.ringBg} />
            <circle cx="25" cy="25" r="20" className={styles.ringProgress} />
          </svg>
        </div>
        <div className={styles.text}>
          <strong>{message}</strong>
          <span className={styles.sub}>This only takes a moment.</span>
        </div>
      </div>
    </div>
  );
}

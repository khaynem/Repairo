"use client";
import { useState } from "react";
import { toast } from "sonner";
import styles from "./NewRepairRequest.module.css";

export default function NewRepairRequest({ onSubmit: onSubmitCallback }) {
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const initial = { deviceType: "", model: "", issue: "", date: "" };
  const [form, setForm] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [minDate] = useState(getTodayDate());

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  
  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.deviceType || !form.model || !form.issue || !form.date) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/repairs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: `${form.deviceType} - ${form.model}`,
          description: form.issue,
          status: "Pending",
          preferredDate: form.date,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create repair request");
      }

      const newRepair = await response.json();
      console.log("NewRepairRequest - Created repair:", newRepair);
      console.log("NewRepairRequest - preferredDate in response:", newRepair.preferredDate);
      toast.success("Repair request submitted successfully!");
      
      if (onSubmitCallback) {
        onSubmitCallback(newRepair);
      }

      setForm(initial);
    } catch (err) {
      console.error("Error submitting repair request:", err);
      toast.error(err.message || "Failed to submit repair request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.card}>
      <h3>New Repair Request</h3>
      <form onSubmit={onSubmit} className={styles.form}>
        <label>
          <span>Device Type</span>
          <div className={styles.selectWrap}>
            <select
              className={styles.select}
              name="deviceType"
              value={form.deviceType}
              onChange={onChange}
              required
            >
              <option value="" disabled>
                Select device
              </option>
              <option>Phone</option>
              <option>Laptop</option>
              <option>Tablet</option>
              <option>Appliance</option>
            </select>
          </div>
        </label>

        <label>
          <span>Model</span>
          <input
            name="model"
            value={form.model}
            onChange={onChange}
            placeholder="e.g., iPhone 12"
            required
          />
        </label>

        <label>
          <span>Issue Description</span>
          <textarea
            name="issue"
            value={form.issue}
            onChange={onChange}
            placeholder="Briefly describe the issue"
            rows={4}
            required
          />
        </label>

        <label>
          <span>Preferred Date *</span>
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={onChange}
            min={minDate}
            required
          />
          <small style={{ color: "#64748b", fontSize: "0.875rem" }}>
            Select your preferred date for the repair
          </small>
        </label>

        <button type="submit" className={styles.submit} disabled={loading}>
          {loading ? "Submitting..." : "Submit Request"}
        </button>
      </form>
    </div>
  );
}

"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import styles from "./profile.module.css";

export default function ProfileClient() {
  const [form, setForm] = useState({
    username: "",
    email: "",
  });
  const [avatarUrl, setAvatarUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch("/api/auth/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setForm({
          username: data.user.username || "",
          email: data.user.email || "",
        });
        setAvatarUrl(data.user.avatarUrl || "");
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  }

  function onChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }
  
  async function saveProfile(e) {
    e.preventDefault();
    
    if (!form.username || !form.email) {
      toast.error("Username and email are required");
      return;
    }
    
    try {
      setSaving(true);
      const token = localStorage.getItem("token");
      
      if (!token) {
        toast.error("Not authenticated");
        return;
      }
      
      const response = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: form.username.trim(),
          email: form.email.trim(),
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        toast.success(data.message || "Profile updated successfully!");
        await fetchProfile();
      } else {
        toast.error(data.error || "Failed to update profile");
      }
    } catch (err) {
      console.error("Error saving profile:", err);
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className={styles.page}>
        <header className={styles.header}>
          <div className={`container ${styles.headerInner}`}>
            <Link href="/dashboard" className={styles.brand}>
              ← Back to Dashboard
            </Link>
            <h1 className={styles.title}>Profile & Settings</h1>
          </div>
        </header>
        <div style={{ padding: "40px", textAlign: "center" }}>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={`container ${styles.headerInner}`}>
          <Link href="/dashboard" className={styles.brand}>
            ← Back to Dashboard
          </Link>
          <h1 className={styles.title}>Profile & Settings</h1>
        </div>
      </header>
      <main className={`container ${styles.main}`}>
        <div style={{ maxWidth: '600px', margin: '0 auto', paddingTop: '24px' }}>
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Profile Information</h2>
            
            {/* Avatar Display */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              marginBottom: '24px' 
            }}>
              <div style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                overflow: 'hidden',
                border: '4px solid #3b82f6',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                position: 'relative'
              }}>
                {avatarUrl ? (
                  <Image 
                    src={avatarUrl} 
                    alt="Profile Avatar" 
                    fill
                    style={{ 
                      objectFit: 'cover' 
                    }} 
                  />
                ) : (
                  <div style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    fontSize: '48px',
                    fontWeight: 'bold'
                  }}>
                    {form.username ? form.username.charAt(0).toUpperCase() : '?'}
                  </div>
                )}
              </div>
            </div>

            <form onSubmit={saveProfile} className={styles.form}>
              <label className={styles.field}>
                <span>Username</span>
                <input
                  name="username"
                  value={form.username}
                  onChange={onChange}
                  required
                  minLength={3}
                  maxLength={50}
                />
              </label>
              <label className={styles.field}>
                <span>Email</span>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={onChange}
                  required
                />
              </label>
              <button 
                className={styles.primaryBtn} 
                type="submit"
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}

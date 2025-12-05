"use client";
import { useState, useEffect, Suspense } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import styles from "./profile.module.css";
import {
  FaPlus,
  FaRegTrashAlt,
  FaUserCircle,
  FaCog,
  FaClock,
} from "react-icons/fa";

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

export default function TechnicianProfileContent() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState("");

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch("/api/auth/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        const user = data.user || data;
        setUsername(user.username || "");
        setEmail(user.email || "");
        setPhone(user.phone || "");
        setAvatarUrl(user.avatarUrl || "");
        setSkills(user.skills || []);
      } else {
        toast.error("Failed to load profile");
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  function addSkill() {
    if (!newSkill.trim()) return;
    setSkills((prev) => [...prev, newSkill.trim()]);
    setNewSkill("");
  }

  function removeSkill(skill) {
    setSkills((prev) => prev.filter((s) => s !== skill));
  }

  async function saveProfile() {
    try {
      setSaving(true);
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          email,
          phone,
          skills,
        }),
      });

      if (response.ok) {
        toast.success("Profile saved successfully!");
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to save profile");
      }
    } catch (err) {
      console.error("Error saving profile:", err);
      toast.error("Failed to save profile");
    } finally {
      setSaving(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem("token");
    toast.success("Logged out successfully");
    router.push("/login");
  }

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

      <div className={`container ${styles.grid}`} style={{ paddingTop: '24px' }}>
        <section className={styles.card}>
          <h3>
            <FaUserCircle style={{ color: "#3b82f6" }} /> Technician Identity
          </h3>
          
          {/* Avatar Display */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            marginBottom: '24px',
            marginTop: '16px'
          }}>
            <div style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              overflow: 'hidden',
              border: '4px solid #3b82f6',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}>
              {avatarUrl ? (
                <img 
                  src={avatarUrl} 
                  alt="Profile Avatar" 
                  style={{ 
                    width: '100%', 
                    height: '100%', 
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
                  {username ? username.charAt(0).toUpperCase() : '?'}
                </div>
              )}
            </div>
          </div>

          <div className={styles.section}>
            <div className={styles.row}>
              <label>Username <span style={{ color: '#ef4444' }}>*</span></label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                minLength={3}
                maxLength={50}
              />
            </div>
            <div className={styles.row}>
              <label>Email <span style={{ color: '#ef4444' }}>*</span></label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                minLength={5}
                maxLength={100}
              />
            </div>
            <div className={styles.row}>
              <label>Phone Number <span style={{ color: '#ef4444' }}>*</span></label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  padding: '10px 12px',
                  background: '#f3f4f6',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px 0 0 8px',
                  fontWeight: '500'
                }}>+63</span>
                <input
                  type="tel"
                  placeholder="9171234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  required
                  style={{ borderRadius: '0 8px 8px 0', flex: 1 }}
                />
              </div>
            </div>
          </div>
        </section>

        <section className={styles.card}>
          <h3>
            <FaCog style={{ color: "#8b5cf6" }} /> Skills
          </h3>
          <div className={styles.row}>
            <label>Skills <span style={{ color: '#ef4444' }}>*</span></label>
            <div className={styles.skillsList}>
              {skills.map((skill) => (
                <span key={skill} className={styles.skillTag}>
                  {skill}{" "}
                  <button
                    className={styles.removeSkill}
                    onClick={() => removeSkill(skill)}
                    aria-label={`Remove ${skill}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className={styles.addSkillWrap}>
              <input
                placeholder="Enter a skill"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSkill();
                  }
                }}
              />
              <button
                onClick={addSkill}
                className={styles.saveBtn}
                style={{ padding: "10px 16px" }}
              >
                <FaPlus /> Add
              </button>
            </div>
          </div>
        </section>
      </div>


      <div
        className="container"
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 22,
        }}
      >
        <button
          onClick={saveProfile}
          className={styles.saveBtn}
          disabled={saving}
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}

"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import styles from "./messages.module.css";

export default function MessagesClient() {
  const [conversations, setConversations] = useState([]);
  const [activeRepairId, setActiveRepairId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    fetchConversations();
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (activeRepairId) {
      fetchMessages(activeRepairId);
    }
  }, [activeRepairId]);

  async function fetchCurrentUser() {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/auth/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setCurrentUser(data.user);
      }
    } catch (err) {
      console.error("Error fetching user:", err);
    }
  }

  async function fetchConversations() {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch("/api/messages", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setConversations(data);
        if (data.length > 0 && !activeRepairId) {
          setActiveRepairId(data[0].repairId);
        }
      }
    } catch (err) {
      console.error("Error fetching conversations:", err);
      toast.error("Failed to load conversations");
    } finally {
      setLoading(false);
    }
  }

  async function fetchMessages(repairId) {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/messages?repairId=${repairId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  }

  async function sendMessage(e) {
    e.preventDefault();
    if (!input.trim() || !activeRepairId) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          repairId: activeRepairId,
          content: input.trim(),
        }),
      });

      if (response.ok) {
        const newMessage = await response.json();
        setMessages(prev => [...prev, newMessage]);
        setInput("");
        fetchConversations();
      } else {
        toast.error("Failed to send message");
      }
    } catch (err) {
      console.error("Error sending message:", err);
      toast.error("Failed to send message");
    }
  }

  const activeConversation = conversations.find(c => c.repairId === activeRepairId);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={`container ${styles.headerInner}`}>
          <Link href="/dashboard" className={styles.brand}>
            ← Back to Dashboard
          </Link>
          <h1 className={styles.title}>Messages</h1>
        </div>
      </header>
      <div className={`container ${styles.frame}`}>
        <main className={styles.main}>
          <aside className={styles.sidebar}>
            <h2 className={styles.sidebarTitle}>Conversations</h2>
            <div className={styles.search}>
              <input type="text" placeholder="Search technicians" />
            </div>
            {conversations.length === 0 ? (
              <div style={{ padding: "20px", textAlign: "center", color: "#64748b" }}>
                <p>No conversations yet</p>
                <p style={{ fontSize: "0.875rem", marginTop: "8px" }}>
                  Messages will appear here once a technician accepts your repair request
                </p>
              </div>
            ) : (
              <ul className={styles.threadList}>
                {conversations.map((conv) => (
                  <li key={conv.repairId}>
                    <button
                      className={`${styles.threadBtn} ${
                        conv.repairId === activeRepairId ? styles.threadActive : ""
                      }`}
                      onClick={() => setActiveRepairId(conv.repairId)}
                    >
                      <span className={styles.threadName}>
                        {conv.technician?.username || "Technician"}
                      </span>
                      <span className={styles.threadLast}>
                        {conv.repair?.title || "Repair Request"}
                      </span>
                      {conv.unreadCount > 0 && (
                        <span className={styles.badge}>{conv.unreadCount}</span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </aside>
          <section className={styles.chat}>
            {activeConversation ? (
              <div className={styles.chatInner}>
                <div className={styles.chatHeader}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span className={styles.statusDot} />
                    <h2 className={styles.chatTitle}>
                      {activeConversation.technician?.username || "Technician"}
                    </h2>
                  </div>
                  <div className={styles.chatMeta}>
                    {activeConversation.repair?.title}
                  </div>
                </div>
                <div className={styles.messages}>
                  {messages.map((m, i) => {
                    const senderId = typeof m.senderId === 'object' ? m.senderId._id : m.senderId;
                    const isCurrentUser = String(senderId) === String(currentUser?._id);
                    return (
                      <div
                        key={m._id || i}
                        className={`${styles.msg} ${
                          isCurrentUser ? styles.msgUser : styles.msgTech
                        }`}
                      >
                        <div>{m.content}</div>
                        <time>
                          {new Date(m.createdAt).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })} {new Date(m.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                        </time>
                      </div>
                    );
                  })}
                </div>
                <form onSubmit={sendMessage} className={styles.inputBar}>
                  <textarea
                    className={styles.input}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your message..."
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage(e);
                      }
                    }}
                  />
                  <button className={styles.sendBtn} type="submit">
                    Send
                  </button>
                </form>
              </div>
            ) : (
              <div className={styles.empty}>
                {conversations.length > 0 ? "Select a conversation" : "No conversations available"}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

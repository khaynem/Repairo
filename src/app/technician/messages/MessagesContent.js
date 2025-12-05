"use client";
import { useState, useEffect, Suspense } from "react";
import dynamic from "next/dynamic";
import styles from "./messages.module.css";
import techStyles from "../technician.module.css";
import {
  FaComments,
  FaSearch,
  FaPaperPlane,
  FaUserCircle,
} from "react-icons/fa";
import { toast } from "sonner";

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

export default function TechnicianMessagesContent() {
  const [conversations, setConversations] = useState([]);
  const [activeRepairId, setActiveRepairId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch("/api/messages", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setConversations(Array.isArray(data) ? data : []);
        
        // Check if there's a repairId in the URL query params
        const urlParams = new URLSearchParams(window.location.search);
        const repairIdFromUrl = urlParams.get("repairId");
        
        if (repairIdFromUrl) {
          setActiveRepairId(repairIdFromUrl);
        } else if (data.length > 0 && !activeRepairId) {
          setActiveRepairId(data[0].repairId);
        }
      }
    } catch (err) {
      console.error("Error fetching conversations:", err);
    }
  };

  const fetchMessages = async (repairId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(`/api/messages?repairId=${repairId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

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
  };

  useEffect(() => {
    fetchConversations();
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (activeRepairId) {
      fetchMessages(activeRepairId);
    }
  }, [activeRepairId]);

  useEffect(() => {
    if (activeRepairId && conversations.length > 0) {
      // If we don't have this conversation in our list, fetch the repair details
      const existingConv = conversations.find(c => c.repairId === activeRepairId);
      if (!existingConv) {
        fetchRepairDetails(activeRepairId);
      }
    }
  }, [activeRepairId, conversations]);

  const fetchRepairDetails = async (repairId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(`/api/repairs/${repairId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const repair = await response.json();
        // Add this repair as a new conversation placeholder
        setConversations(prev => {
          const exists = prev.find(c => c.repairId === repairId);
          if (!exists && repair.userId) {
            return [...prev, {
              repairId: repair._id,
              otherParty: repair.userId,
              lastMessage: "Start a conversation...",
              unreadCount: 0,
            }];
          }
          return prev;
        });
      }
    } catch (err) {
      console.error("Error fetching repair details:", err);
    }
  };

  const activeConversation = conversations.find(
    (c) => c.repairId === activeRepairId
  );

  function send(e) {
    e.preventDefault();
    sendMessage();
  }

  async function sendMessage() {
    if (!input.trim() || !activeRepairId) return;

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          repairId: activeRepairId,
          content: input.trim(),
        }),
      });

      if (response.ok) {
        setInput("");
        await fetchMessages(activeRepairId);
        await fetchConversations();
      } else {
        toast.error("Failed to send message");
      }
    } catch (err) {
      console.error("Error sending message:", err);
      toast.error("Failed to send message");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={techStyles.page}>
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

      <div className={`container ${styles.frame}`}>
        <main className={styles.main}>
          <aside className={styles.sidebar}>
            <h2 className={styles.sidebarTitle}>
              <FaComments style={{ color: "#3b82f6" }} /> Clients
            </h2>
            <div className={styles.sidebarActions}>
              <button
                type="button"
                className={styles.newChatBtn}
                onClick={() => alert("New chat (placeholder)")}
              >
                New Chat
              </button>
            </div>
            <div className={styles.search}>
              <FaSearch className={styles.searchIcon} />
              <input type="text" placeholder="Search clients..." />
            </div>
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
                      {conv.otherParty?.username || "Unknown"}
                    </span>
                    <span className={styles.threadLast}>
                      {conv.lastMessage || "No messages"}
                    </span>
                    {conv.unreadCount > 0 && (
                      <span className={styles.unreadBadge}>
                        {conv.unreadCount}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          <section className={styles.chat}>
            {activeConversation ? (
              <div className={styles.chatInner}>
                <div className={styles.chatHeader}>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    <FaUserCircle style={{ fontSize: 32, color: "#3b82f6" }} />
                    <div>
                      <h2 className={styles.chatTitle}>
                        {activeConversation.otherParty?.username || "Unknown"}
                      </h2>
                      <div className={styles.chatMeta}>
                        <span className={styles.statusDot} /> Online
                      </div>
                    </div>
                  </div>
                </div>

                <div className={styles.messages}>
                  {messages.map((msg, i) => {
                    const senderId = typeof msg.senderId === 'object' ? msg.senderId._id : msg.senderId;
                    const isCurrentUser = String(senderId) === String(currentUser?._id);
                    return (
                      <div
                        key={msg._id || i}
                        className={`${styles.msg} ${
                          isCurrentUser ? styles.msgUser : styles.msgTech
                        }`}
                      >
                        <div>{msg.content}</div>
                        <time>{new Date(msg.createdAt).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })} {new Date(msg.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}</time>
                      </div>
                    );
                  })}
                </div>

                <form onSubmit={send} className={styles.inputBar}>
                  <textarea
                    className={styles.input}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    placeholder="Type your message..."
                  />
                  <button className={styles.sendBtn} type="submit">
                    <FaPaperPlane /> Send
                  </button>
                </form>
              </div>
            ) : (
              <div className={styles.empty}>Select a conversation.</div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

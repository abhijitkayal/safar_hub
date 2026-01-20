"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../../components/Pages/admin/Sidebar";

export default function AdminSupportPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState<"all" | "open" | "replied" | "closed">("all");

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await fetch("/api/auth/verify", { credentials: "include" });
        if (res.status !== 200) return router.replace("/login");
        const data = await res.json().catch(() => null);
        const verifiedUser = data?.user;
        if (!res.ok || !verifiedUser) return router.replace("/login");
        if (verifiedUser.accountType !== "admin") return router.replace("/login");
        setAuthorized(true);
        loadMessages();
      } catch {
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    };
    verify();
  }, [router]);

  const loadMessages = async () => {
    try {
      setLoadingMessages(true);
      const url = filter === "all" ? "/api/admin/support" : `/api/admin/support?status=${filter}`;
      const res = await fetch(url, { credentials: "include" });
      const data = await res.json();
      if (data.success) {
        setMessages(data.messages || []);
      }
    } catch (err) {
      console.error("Failed to load messages", err);
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    if (authorized) {
      loadMessages();
    }
  }, [filter, authorized]);

  const handleReply = async (messageId: string) => {
    if (!replyText.trim()) {
      alert("Please enter a reply message");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/support/${messageId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ reply: replyText }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to send reply");
      }

      setReplyText("");
      setSelectedMessage(null);
      await loadMessages();
      alert("Reply sent successfully!");
    } catch (err: any) {
      alert(err.message || "Failed to send reply");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (messageId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/support/${messageId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to update status");
      }

      await loadMessages();
    } catch (err: any) {
      alert(err.message || "Failed to update status");
    }
  };

  if (loading)
    return (
      <div className="fixed inset-0 z-100 flex items-center justify-center bg-white">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-green-500 border-t-transparent" />
      </div>
    );
  if (!authorized) return null;

  return (
    <div className="flex h-screen bg-gray-50 relative overflow-hidden">
      {/* <div className="hidden lg:block lg:flex-shrink-0">
        <Sidebar />
      </div> */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="sticky top-0 z-40 bg-sky-50">
          <div className="flex items-center gap-3 p-3 border-b">
            {/* <button
              className="lg:hidden px-3 py-2 rounded border text-gray-900"
              onClick={() => setMobileSidebarOpen(true)}
              aria-label="Open menu"
            >
              ☰
            </button> */}
            <h1 className="text-2xl font-bold text-gray-800">Customer Support</h1>
          </div>
        </div>
        <main className="flex-1 overflow-y-auto overflow-x-auto lg:overflow-x-hidden p-6">
          {/* Filter Buttons */}
          <div className="mb-6 flex gap-2 flex-wrap text-black">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === "all"
                  ? "bg-indigo-600 text-black"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("open")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors text-black ${
                filter === "open"
                  ? "bg-indigo-600 text-black"
                  : "bg-white text-gray-900 hover:bg-gray-50"
              }`}
            >
              Open
            </button>
            <button
              onClick={() => setFilter("replied")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === "replied"
                  ? "bg-indigo-600 text-black"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Replied
            </button>
            <button
              onClick={() => setFilter("closed")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === "closed"
                  ? "bg-indigo-600 text-black"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Closed
            </button>
          </div>

          {loadingMessages ? (
            <div className="flex justify-center py-16">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-green-500 border-t-transparent" />
            </div>
          ) : messages.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-800">No support messages found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {messages.map((msg: any) => (
                <div
                  key={msg._id}
                  className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-800 mb-1">{msg.subject}</h3>
                      <p className="text-sm text-gray-500">
                        From: {msg.userId && typeof msg.userId === "object" ? msg.userId.fullName : "Unknown"}
                      </p>
                      <p className="text-xs text-gray-800 mt-1">
                        {new Date(msg.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        msg.status === "open"
                          ? "bg-yellow-100 text-yellow-700"
                          : msg.status === "replied"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {msg.status}
                    </span>
                  </div>

                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">{msg.message}</p>
                  </div>

                  {msg.adminReply && (
                    <div className="mb-4 p-3 bg-green-50 border-l-4 border-green-500 rounded-lg">
                      <p className="text-sm font-medium text-green-800 mb-1">Admin Reply:</p>
                      <p className="text-sm text-gray-800">{msg.adminReply}</p>
                      <p className="text-xs text-gray-800 mt-1">
                        Replied on {new Date(msg.repliedAt).toLocaleString()}
                        {msg.repliedBy && typeof msg.repliedBy === "object" && (
                          <span> by {msg.repliedBy.fullName}</span>
                        )}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2 flex-wrap">
                    {!msg.adminReply && (
                      <button
                        onClick={() => setSelectedMessage(msg)}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-black px-4 py-2 rounded-lg font-medium transition-colors"
                      >
                        Reply
                      </button>
                    )}
                    <select
                      value={msg.status}
                      onChange={(e) => handleStatusChange(msg._id, e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-black"
                    >
                      <option value="open">Open</option>
                      <option value="replied">Replied</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Reply Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-2xl p-6 max-w-2xl w-full mx-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Reply to Support Request</h2>
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-1">Subject:</p>
              <p className="text-gray-600">{selectedMessage.subject}</p>
            </div>
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-1">Original Message:</p>
              <p className="text-gray-800">{selectedMessage.message}</p>
            </div>
            <div className="mb-4">
              <label htmlFor="reply" className="block text-sm font-medium text-gray-700 mb-2">
                Your Reply:
              </label>
              <textarea
                id="reply"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter your reply here..."
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setSelectedMessage(null);
                  setReplyText("");
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                onClick={() => handleReply(selectedMessage._id)}
                disabled={submitting || !replyText.trim()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-black rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Sending..." : "Send Reply"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Sidebar */}
      {mobileSidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-72 bg-white shadow-2xl z-50 p-0 lg:hidden overflow-y-auto">
            <div className="p-4 border-b flex items-center justify-between">
              <span className="text-lg font-semibold text-gray-800">Menu</span>
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="px-3 py-1.5 rounded-md border text-gray-700"
              >
                Close
              </button>
            </div>
            <Sidebar />
          </div>
        </>
      )}
    </div>
  );
}


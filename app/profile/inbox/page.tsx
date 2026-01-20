"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import PageLoader from "../../components/common/PageLoader";
import { useProfileLayout } from "../ProfileLayoutContext";

type InboxMessage = {
  _id: string;
  subject?: string;
  message?: string;
  response?: string;
  createdAt?: string;
  updatedAt?: string;
};

const formatDateLabel = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
  });
};

export default function ProfileInboxPage() {
  const { user } = useProfileLayout();
  const router = useRouter();
  const [inboxMessages, setInboxMessages] = useState<InboxMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(true);

  const loadInbox = useCallback(async () => {
    try {
      setLoadingMessages(true);
      const res = await fetch("/api/profile/inbox", { credentials: "include" });
      const data = await res.json().catch(() => null);
      if (data?.success) {
        setInboxMessages(data.inbox || []);
      }
    } catch (error) {
      console.error("Failed to load inbox", error);
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  useEffect(() => {
    loadInbox();
  }, [loadInbox]);

  if (!user) return null;

  return (
    <div className="space-y-6 pt-15">
      <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Inbox</h1>
          <p className="text-gray-500 mt-1">Follow-up on conversations with our support team.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadInbox}
            className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:border-gray-300"
          >
            Refresh
          </button>
          <button
            onClick={() => router.push("/profile/support")}
            className="rounded-xl bg-linear-to-r from-green-500 to-green-600 px-4 py-2 text-sm font-medium text-white shadow transition hover:from-green-600 hover:to-green-700"
          >
            Contact Support
          </button>
        </div>
      </header>

      {loadingMessages ? (
        <PageLoader fullscreen={false} className="py-16" />
      ) : inboxMessages.length === 0 ? (
        <div className="rounded-3xl bg-white p-8 text-center shadow">
          <svg className="mx-auto h-16 w-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8m-18 8h18a2 2 0 002-2V8a2 2 0 00-2-2H3a2 2 0 00-2 2v6a2 2 0 002 2z"
            />
          </svg>
          <h2 className="mt-4 text-xl font-semibold text-gray-900">No messages yet</h2>
          <p className="mt-2 text-sm text-gray-600">
            You&apos;ll see admin replies to your support requests right here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {inboxMessages.map((message) => (
            <div key={message._id} className="rounded-3xl bg-white p-6 shadow">
              <div className="flex flex-col gap-2 text-sm text-gray-500 md:flex-row md:items-center md:justify-between">
                <span>Ticket #{message._id.slice(-6)}</span>
                <span>{formatDateLabel(message.updatedAt || message.createdAt)}</span>
              </div>
              <h3 className="mt-3 text-lg font-semibold text-gray-900">
                {message.subject || "Support conversation"}
              </h3>
              {message.message && <p className="mt-2 text-gray-700">{message.message}</p>}

              {message.response && (
                <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-800">Latest reply</p>
                  <p className="mt-1 text-slate-700">{message.response}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


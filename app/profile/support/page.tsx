"use client";

import { useState } from "react";

import PageLoader from "../../components/common/PageLoader";
import { useProfileLayout } from "../ProfileLayoutContext";

export default function ProfileSupportPage() {
  const { user } = useProfileLayout();
  const [formData, setFormData] = useState({ subject: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  if (!user) return <PageLoader fullscreen={false} />;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!formData.subject.trim() || !formData.message.trim()) {
      alert("Please fill in all fields");
      return;
    }

    setSubmitting(true);
    setSubmitSuccess(false);

    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data?.message || "Failed to send message");
      }
      setSubmitSuccess(true);
      setFormData({ subject: "", message: "" });
    } catch (error) {
      console.error("Failed to send message", error);
      alert("Failed to send message, please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 min-h-screen pt-15">
      <header>
        <h1 className="text-3xl font-bold text-gray-800">Customer Support</h1>
        <p className="text-gray-500 mt-2">
          Tell us what you need help with and our team will reach out in your inbox.
        </p>
      </header>

      <div className="rounded-3xl bg-white p-6 shadow">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700" htmlFor="subject">
              Subject
            </label>
            <input
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder="e.g. Need help with my booking"
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-gray-700 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-100"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700" htmlFor="message">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              rows={6}
              value={formData.message}
              onChange={handleChange}
              placeholder="Share every detail that can help us resolve your issue."
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-gray-700 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-100"
            />
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            {submitSuccess ? (
              <p className="text-sm font-medium text-green-600">
                Thanks! We received your request and will reply shortly.
              </p>
            ) : (
              <p className="text-sm text-gray-500">
                We usually reply within a few hours. You&apos;ll see updates in the inbox tab.
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="rounded-2xl bg-linear-to-r from-green-500 to-green-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:from-green-600 hover:to-green-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? "Sending..." : "Send message"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


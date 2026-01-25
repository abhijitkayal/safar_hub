"use client";

import { useEffect, useState } from "react";

type Requirement = {
  _id: string;
  title: string;
  description: string;
  categories: string[];
  comments: { message: string }[];
};

export default function VendorRequirementsPage() {
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [comment, setComment] = useState("");

  const loadRequirements = async () => {
    const res = await fetch("/api/vendor/requirements", {
      credentials: "include",
    });
    const data = await res.json();
    setRequirements(data.requirements || []);
  };

  useEffect(() => {
    loadRequirements();
  }, []);

  const sendComment = async (id: string) => {
    if (!comment.trim()) return;

    await fetch(`/api/vendor/requirements/${id}/comment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ message: comment }),
    });

    setComment("");
    loadRequirements();
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">User Requirements</h1>

      {requirements.map((req) => (
        <div key={req._id} className="border rounded-lg p-4 space-y-3">
          <h2 className="font-semibold">{req.title}</h2>
          <p className="text-gray-600">{req.description}</p>

          <div className="flex gap-2 flex-wrap">
            {req.categories.map((c) => (
              <span key={c} className="bg-green-100 px-2 py-1 text-xs rounded">
                {c}
              </span>
            ))}
          </div>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Write a comment..."
            className="w-full border rounded p-2"
          />

          <button
            onClick={() => sendComment(req._id)}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Comment
          </button>
        </div>
      ))}
    </div>
  );
}

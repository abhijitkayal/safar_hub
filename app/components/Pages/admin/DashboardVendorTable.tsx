// app/components/Pages/admin/DashboardVendorTable.tsx
"use client";
import React, { useEffect, useState } from "react";
import { FaEye, FaCheck, FaTrash } from "react-icons/fa";

interface Vendor {
  _id: string;
  fullName: string;
  email: string;
  contactNumber: string;
  vendorServices: string[];
  createdAt: string;
  isVendorApproved: boolean;
  isVendorLocked?: boolean;
  accountType?: string;
}

const DashboardVendorTable: React.FC = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVendors = async () => {
    try {
      // Fetch latest vendors (pending and recently added)
      const res = await fetch("/api/admin/vendors?limit=10");
      const data = await res.json();
      if (data.success) setVendors(data.vendors || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (vendorId: string, action: "accept" | "reject") => {
    const res = await fetch("/api/admin/vendors", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vendorId, action }),
    });

    const data = await res.json();
    if (data.success) {
      fetchVendors();
    } else {
      alert(data.message || "Failed to update vendor status");
    }
  };

  const handleDelete = async (vendorId: string, vendorName: string) => {
    if (!confirm(`Are you sure you want to permanently delete vendor "${vendorName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/vendors?vendorId=${vendorId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        fetchVendors();
      } else {
        alert(data.message || "Failed to delete vendor");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete vendor");
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  if (loading) return <p className="text-center py-8">Loading vendors...</p>;

  const pendingVendors = vendors.filter((v) => !v.isVendorApproved);

  return (
    <div className="bg-white rounded-xl shadow p-6 mt-6 overflow-y-auto overflow-x-auto">
      <h2 className="text-lg font-semibold mb-4 text-black">Newly Added Vendors (Latest 10)</h2>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-gray-600">
          <thead>
            <tr className="border-b text-sm text-gray-700">
              <th className="py-2">Name</th>
              <th>Email</th>
              <th>Mobile</th>
              <th>Signup Date</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {vendors.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-500">
                  No vendors found
                </td>
              </tr>
            ) : (
              vendors.map((v) => (
                <tr key={v._id} className="border-b hover:bg-gray-50">
                  <td className="py-3 font-medium text-gray-800">{v.fullName}</td>
                  <td>{v.email}</td>
                  <td>{v.contactNumber || "—"}</td>
                  <td>{new Date(v.createdAt).toLocaleString("en-IN")}</td>
                  <td>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        v.isVendorApproved
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {v.isVendorApproved ? "Approved" : "Pending"}
                    </span>
                  </td>
                  <td className="text-right py-3">
                    <div className="flex justify-end gap-2">
                      {!v.isVendorApproved && (
                        <button
                          onClick={() => handleAction(v._id, "accept")}
                          className="text-green-600 hover:text-green-700 p-1"
                          title="Approve"
                        >
                          <FaCheck />
                        </button>
                      )}
                      {!v.isVendorApproved && (
                        <button
                          onClick={() => handleAction(v._id, "reject")}
                          className="text-yellow-600 hover:text-yellow-700 p-1"
                          title="Reject"
                        >
                          ✕
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(v._id, v.fullName)}
                        className="text-red-500 hover:text-red-600 p-1"
                        title="Delete Vendor"
                      >
                        <FaTrash />
                      </button>
                      <button
                        onClick={() => alert("View functionality coming soon")}
                        className="text-indigo-600 hover:text-indigo-700 p-1"
                        title="View"
                      >
                        <FaEye />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pendingVendors.length === 0 && (
        <p className="text-sm text-gray-500 mt-4">No pending vendors awaiting approval.</p>
      )}
    </div>
  );
};

export default DashboardVendorTable;


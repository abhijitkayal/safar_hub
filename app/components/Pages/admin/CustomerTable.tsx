"use client";
import React, { useEffect, useState } from "react";

type Customer = {
  _id: string;
  fullName: string;
  email: string;
  contactNumber?: string;
  age?: number;
  createdAt: string;
};

const CustomerTable: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await fetch("/api/admin/users");
        const data = await res.json();
        if (data.success) {
          setCustomers(data.users || []);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-500 border-t-transparent" />
      </div>
    );

  return (
    <div className="bg-white rounded-xl shadow p-6 mt-6  overflow-y-auto overflow-x-auto">
      <h2 className="text-lg font-semibold mb-4 text-black">All Customers</h2>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-gray-700">
          <thead>
            <tr className="border-b text-sm text-gray-700">
              <th className="py-2">Name</th>
              <th>Email</th>
              <th>Mobile</th>
              <th>Age</th>
              <th>Signup Date</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c._id} className="border-b hover:bg-gray-50">
                <td className="py-3 font-medium text-gray-800">{c.fullName}</td>
                <td>{c.email}</td>
                <td>{c.contactNumber || "—"}</td>
                <td>{typeof c.age === "number" ? c.age : "—"}</td>
                <td>{new Date(c.createdAt).toLocaleString("en-IN")}</td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr>
                <td colSpan={5} className="py-6 text-center text-gray-500">
                  No customers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CustomerTable;



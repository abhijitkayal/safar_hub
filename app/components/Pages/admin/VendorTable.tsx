// app/components/Pages/admin/VendorTable.tsx
"use client";
import React, { useEffect, useState } from "react";
import { FaEye, FaCheck, FaTimes, FaLock, FaUnlock, FaTrash, FaTimes as FaClose } from "react-icons/fa";

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
  isSeller?: boolean;
}

interface VendorDetails {
  stays: any[];
  tours: any[];
  adventures: any[];
  vehicleRentals: any[];
}

const VendorTable: React.FC = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [vendorDetails, setVendorDetails] = useState<VendorDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const fetchVendors = async () => {
    try {
      // Fetch all vendors so both pending and approved/locked show
      const res = await fetch("/api/admin/vendors");
      const data = await res.json();
      if (data.success) setVendors(data.vendors || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (vendorId: string, action: "accept" | "reject" | "lock" | "unlock", vendorEmail?: string) => {
    const res = await fetch("/api/admin/vendors", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vendorId, action }),
    });

    const data = await res.json();

    if (data.success) {
      // Show alert when locking
      if (action === "lock" && vendorEmail) {
        alert(`${vendorEmail} account has been locked`);
      }

      // If the updated vendor is the currently logged-in user, merge updates into localStorage
      try {
        const stored = JSON.parse(localStorage.getItem("user") || "{}");
        if (stored?._id === vendorId || stored?.id === vendorId) {
          const merged = {
            ...stored,
            isVendorApproved: data.vendor.isVendorApproved,
            isVendorLocked: data.vendor.isVendorLocked,
            vendorServices: data.vendor.vendorServices || [],
          } as any;
          localStorage.setItem("user", JSON.stringify(merged));
        }
      } catch (e) {
        console.warn("Could not merge localStorage user:", e);
      }

      // refresh list
      fetchVendors();
    } else {
      alert(data.message || "Action failed");
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
        alert("This vendor account permanently deleted");
        fetchVendors();
      } else {
        alert(data.message || "Failed to delete vendor");
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete vendor");
    }
  };

  const fetchVendorDetails = async (vendorId: string) => {
    setLoadingDetails(true);
    try {
      const [staysRes, toursRes, adventuresRes, rentalsRes] = await Promise.all([
        fetch(`/api/vendor/stays?vendorId=${vendorId}&all=true`),
        fetch(`/api/vendor/tours?vendorId=${vendorId}&all=true`),
        fetch(`/api/vendor/adventures?vendorId=${vendorId}&all=true`),
        fetch(`/api/vendor/vehicle-rental?vendorId=${vendorId}&all=true`),
      ]);

      const [staysData, toursData, adventuresData, rentalsData] = await Promise.all([
        staysRes.json(),
        toursRes.json(),
        adventuresRes.json(),
        rentalsRes.json(),
      ]);

      setVendorDetails({
        stays: staysData.success ? staysData.stays : [],
        tours: toursData.success ? toursData.tours : [],
        adventures: adventuresData.success ? adventuresData.adventures : [],
        vehicleRentals: rentalsData.success ? rentalsData.rentals : [],
      });
    } catch (err) {
      console.error("Error fetching vendor details", err);
      setVendorDetails({ stays: [], tours: [], adventures: [], vehicleRentals: [] });
    } finally {
      setLoadingDetails(false);
    }
  };

  const toggleViewDetails = (vendor: Vendor) => {
    if (selectedVendor?._id === vendor._id) {
      setSelectedVendor(null);
      setVendorDetails(null);
      return;
    }
    setSelectedVendor(vendor);
    fetchVendorDetails(vendor._id);
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  if (loading) return <p className="text-center py-8">Loading vendors...</p>;

  return (
    <div className="bg-white rounded-xl shadow p-6 mt-6 overflow-y-auto overflow-x-auto">
      <h2 className="text-lg font-semibold mb-4 text-black">All Accepted Partners</h2>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-gray-600">
          <thead>
            <tr className="border-b text-sm text-gray-700">
              <th className="py-2">Name</th>
              <th>Email</th>
              <th>Mobile</th>
              <th>Services</th>
              <th>Seller?</th>
              <th>Signup Date</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {vendors.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-8 text-gray-500">
                  No accepted vendors found
                </td>
              </tr>
            ) : (
              vendors.map((v) => (
                <>
                  <tr key={v._id} className="border-b hover:bg-gray-50">
                    <td className="py-3 font-medium text-gray-800">{v.fullName}</td>
                    <td>{v.email}</td>
                    <td>{v.contactNumber || "—"}</td>
                    <td className="py-3">
                      {v.vendorServices && v.vendorServices.length > 0
                        ? v.vendorServices.join(", ")
                        : "—"}
                    </td>
                    <td>
                      {v.isSeller ? (
                        <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700">
                          Yes
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700">
                          No
                        </span>
                      )}
                    </td>
                    <td>{new Date(v.createdAt).toLocaleString("en-IN")}</td>
                    <td>
                      <div className="flex flex-col gap-1">
                        <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700">
                          {v.isVendorApproved ? "Approved" : "Pending"}
                        </span>
                        {v.isVendorLocked && (
                          <span className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-700">
                            Locked
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="text-right py-3">
                      {v.isVendorApproved ? (
                        <div className="flex justify-end gap-2">
                          {v.isVendorLocked ? (
                            <button
                              onClick={() => handleAction(v._id, "unlock")}
                              className="text-green-600 hover:text-green-700 p-1"
                              title="Unlock Dashboard"
                            >
                              <FaUnlock />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleAction(v._id, "lock", v.email)}
                              className="text-yellow-600 hover:text-yellow-700 p-1"
                              title="Lock Dashboard"
                            >
                              <FaLock />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(v._id, v.fullName)}
                            className="text-red-500 hover:text-red-600 p-1"
                            title="Permanently Delete"
                          >
                            <FaTrash />
                          </button>
                          <button
                            onClick={() => toggleViewDetails(v)}
                            className="text-indigo-600 hover:text-indigo-700 p-1"
                            title="View Details"
                          >
                            <FaEye />
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-end gap-3">
                          <button
                            onClick={() => handleAction(v._id, "accept")}
                            className="text-green-600 hover:text-green-700"
                            title="Accept"
                          >
                            <FaCheck />
                          </button>
                          <button
                            onClick={() => handleAction(v._id, "reject")}
                            className="text-red-500 hover:text-red-600"
                            title="Reject"
                          >
                            <FaTimes />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>

                  {selectedVendor?._id === v._id && (
                    <tr>
                      <td colSpan={8} className="bg-gray-50">
                        <div className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-base font-semibold text-gray-800">Vendor details</h3>
                            <button
                              onClick={() => {
                                setSelectedVendor(null);
                                setVendorDetails(null);
                              }}
                              className="text-gray-500 hover:text-gray-700"
                              title="Close"
                            >
                              <FaClose />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <p className="text-xs text-gray-600">Name</p>
                              <p className="font-medium text-gray-800">{v.fullName}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600">Email</p>
                              <p className="font-medium text-gray-800">{v.email}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600">Contact</p>
                              <p className="font-medium text-gray-800">{v.contactNumber || "—"}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600">Signup Date</p>
                              <p className="font-medium text-gray-800">{new Date(v.createdAt).toLocaleString("en-IN")}</p>
                            </div>
                          </div>

                          <div className="mb-4">
                            <p className="text-xs text-gray-600 mb-1">Services Provided</p>
                            <div className="flex flex-wrap gap-2">
                              {v.vendorServices?.length ? (
                                v.vendorServices.map((service) => (
                                  <span key={service} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                    {service === "vehicle-rental" ? "Vehicle Rental" : service.charAt(0).toUpperCase() + service.slice(1)}
                                  </span>
                                ))
                              ) : (
                                <span className="text-sm text-gray-500">No services selected</span>
                              )}
                            </div>
                          </div>

                          <div>
                            <p className="text-xs text-gray-600 mb-2">Added Items</p>
                            {loadingDetails ? (
                              <p className="text-sm text-gray-500">Loading items...</p>
                            ) : vendorDetails && (vendorDetails.stays.length || vendorDetails.tours.length || vendorDetails.adventures.length || vendorDetails.vehicleRentals.length) ? (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {!!vendorDetails.stays.length && (
                                  <div>
                                    <p className="text-sm font-semibold text-gray-800 mb-1">Stays ({vendorDetails.stays.length})</p>
                                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                                      {vendorDetails.stays.slice(0, 5).map((s: any) => (
                                        <li key={s._id}>{s.name}</li>
                                      ))}
                                      {vendorDetails.stays.length > 5 && (
                                        <li className="text-gray-500">+{vendorDetails.stays.length - 5} more</li>
                                      )}
                                    </ul>
                                  </div>
                                )}

                                {!!vendorDetails.tours.length && (
                                  <div>
                                    <p className="text-sm font-semibold text-gray-800 mb-1">Tours ({vendorDetails.tours.length})</p>
                                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                                      {vendorDetails.tours.slice(0, 5).map((t: any) => (
                                        <li key={t._id}>{t.name}</li>
                                      ))}
                                      {vendorDetails.tours.length > 5 && (
                                        <li className="text-gray-500">+{vendorDetails.tours.length - 5} more</li>
                                      )}
                                    </ul>
                                  </div>
                                )}

                                {!!vendorDetails.adventures.length && (
                                  <div>
                                    <p className="text-sm font-semibold text-gray-800 mb-1">Adventures ({vendorDetails.adventures.length})</p>
                                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                                      {vendorDetails.adventures.slice(0, 5).map((a: any) => (
                                        <li key={a._id}>{a.name}</li>
                                      ))}
                                      {vendorDetails.adventures.length > 5 && (
                                        <li className="text-gray-500">+{vendorDetails.adventures.length - 5} more</li>
                                      )}
                                    </ul>
                                  </div>
                                )}

                                {!!vendorDetails.vehicleRentals.length && (
                                  <div>
                                    <p className="text-sm font-semibold text-gray-800 mb-1">Vehicle Rentals ({vendorDetails.vehicleRentals.length})</p>
                                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                                      {vendorDetails.vehicleRentals.slice(0, 5).map((r: any) => (
                                        <li key={r._id}>{r.name}</li>
                                      ))}
                                      {vendorDetails.vehicleRentals.length > 5 && (
                                        <li className="text-gray-500">+{vendorDetails.vehicleRentals.length - 5} more</li>
                                      )}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-500">Not added any items</p>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VendorTable;
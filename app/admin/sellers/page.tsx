"use client";
import React, { useState, useEffect } from "react";
import Sidebar from "@/app/components/Pages/admin/Sidebar";
import { FaEye, FaShoppingCart } from "react-icons/fa";

interface Vendor {
  _id: string;
  fullName: string;
  email: string;
  isSeller: boolean;
  createdAt: string;
}

interface Product {
  _id: string;
  name: string;
  category: string;
  basePrice: number;
  isActive: boolean;
  createdAt: string;
  variants?: any[];
  stock?: number;
}

const SellersPage: React.FC = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [vendorProducts, setVendorProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const fetchSellers = async () => {
    try {
      const res = await fetch("/api/admin/vendors?onlySellers=true");
      const data = await res.json();
      if (data.success) {
        setVendors(data.vendors || []);
      } else {
        setError(data.message || "Failed to fetch sellers");
      }
    } catch (err: any) {
      setError(err?.message || "Failed to fetch sellers");
    } finally {
      setLoading(false);
    }
  };

  const fetchVendorProducts = async (vendorId: string) => {
    setLoadingProducts(true);
    try {
      const res = await fetch(`/api/products?sellerId=${vendorId}`);
      const data = await res.json();
      if (data.success) {
        setVendorProducts(data.products || []);
      } else {
        setVendorProducts([]);
      }
    } catch (err) {
      console.error("Error fetching vendor products:", err);
      setVendorProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleViewProducts = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    fetchVendorProducts(vendor._id);
  };

  const handleBackToList = () => {
    setSelectedVendor(null);
    setVendorProducts([]);
  };

  useEffect(() => {
    fetchSellers();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen bg-sky-50 text-black overflow-hidden">
        {/* <div className="hidden lg:block lg:shrink-0">
          <Sidebar />
        </div> */}
        <div className="flex-1 flex flex-col  overflow-hidden">
          <div className="sticky top-0 z-40 bg-sky-50">
            <div className="flex items-center justify-between gap-3 p-3 border-b">
              <div className="flex items-center gap-3">
                {/* <button
                  className="lg:hidden px-3 py-2 rounded border text-gray-700"
                  onClick={() => setMobileSidebarOpen(true)}
                  aria-label="Open menu"
                >
                  ☰
                </button> */}
                <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Sellers</h1>
              </div>
            </div>
          </div>
          <main className="flex-1 overflow-y-auto overflow-x-auto lg:overflow-x-hidden p-4 sm:p-6">
            <div className="flex justify-center py-10">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-green-500 border-t-transparent" />
            </div>
          </main>
        </div>
        {/* {mobileSidebarOpen && (
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
        )} */}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-sky-50 text-black overflow-hidden">
        {/* <div className="hidden lg:block lg:shrink-0">
          <Sidebar />
        </div> */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="sticky top-0 z-40 bg-sky-50">
            <div className="flex items-center justify-between gap-3 p-3 border-b">
              <div className="flex items-center gap-3">
                {/* <button
                  className="lg:hidden px-3 py-2 rounded border text-gray-700"
                  onClick={() => setMobileSidebarOpen(true)}
                  aria-label="Open menu"
                >
                  ☰
                </button> */}
                <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Sellers</h1>
              </div>
            </div>
          </div>
          <main className="flex-1 overflow-y-auto overflow-x-auto lg:overflow-x-hidden p-4 sm:p-6">
            <div className="rounded-xl bg-red-50 p-6 text-red-700">{error}</div>
          </main>
        </div>
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

  return (
    <div className="flex h-screen bg-sky-50 text-black overflow-hidden">
      {/* <div className="hidden lg:block lg:shrink-0">
        <Sidebar />
      </div> */}

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="sticky top-0 z-40 bg-sky-50">
          <div className="flex items-center justify-between gap-3 p-3 border-b">
            <div className="flex items-center gap-3">
              {/* <button
                className="lg:hidden px-3 py-2 rounded border text-gray-700"
                onClick={() => setMobileSidebarOpen(true)}
                aria-label="Open menu"
              >
                ☰
              </button> */}
              <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
                {selectedVendor ? `${selectedVendor.fullName}'s Products` : "Sellers"}
              </h1>
            </div>
          </div>
        </div>

        <main className="flex-1 overflow-y-auto overflow-x-auto lg:overflow-x-hidden p-4 sm:p-6">
          {selectedVendor ? (
            <div>
              <div className="mb-6">
                <button
                  onClick={handleBackToList}
                  className="inline-flex items-center gap-2 rounded-full bg-gray-600 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700"
                >
                  ← Back to Sellers
                </button>
                <div className="mt-4 p-4 bg-white rounded-xl shadow">
                  <h2 className="text-xl font-semibold text-gray-900">{selectedVendor.fullName}</h2>
                  <p className="text-gray-600">{selectedVendor.email}</p>
                  <div className="mt-2 flex items-center gap-4">
                    <span className="text-sm text-gray-500">
                      Joined: {new Date(selectedVendor.createdAt).toLocaleDateString()}
                    </span>
                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                      Seller
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow p-6">
                <h2 className="text-lg font-semibold mb-4 text-black">Products</h2>
                {loadingProducts ? (
                  <div className="flex justify-center py-10">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-green-500 border-t-transparent" />
                  </div>
                ) : vendorProducts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    This seller hasn't added any products yet.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-700">
                      <thead className="bg-gray-100 text-xs uppercase text-gray-600">
                        <tr>
                          <th className="px-4 py-3">Product</th>
                          <th className="px-4 py-3">Category</th>
                          <th className="px-4 py-3">Price</th>
                          <th className="px-4 py-3">Stock</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3">Added Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {vendorProducts.map((product) => {
                          const variantList = product.variants ?? [];
                          const variantCount = variantList.length;
                          const hasVariants = variantCount > 0;
                          const totalStock = hasVariants
                            ? variantList.reduce((sum: number, v: any) => sum + (v.stock || 0), 0)
                            : product.stock || 0;
                            
                          return (
                            <tr key={product._id} className="hover:bg-gray-50">
                              <td className="px-4 py-4 font-medium text-gray-900">{product.name}</td>
                              <td className="px-4 py-4">
                                <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                                  {product.category}
                                </span>
                              </td>
                              <td className="px-4 py-4">₹{product.basePrice.toLocaleString()}</td>
                              <td className="px-4 py-4">
                                {hasVariants ? (
                                  <span className="text-xs text-gray-600">
                                    {variantCount} variant{variantCount !== 1 ? 's' : ''} • {totalStock} in stock
                                  </span>
                                ) : (
                                  <span className={`text-xs font-semibold ${totalStock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {totalStock > 0 ? `${totalStock} in stock` : 'Out of stock'}
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-4">
                                <span
                                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                    product.isActive
                                      ? "bg-green-50 text-green-700"
                                      : "bg-red-50 text-red-700"
                                  }`}
                                >
                                  {product.isActive ? "Active" : "Inactive"}
                                </span>
                              </td>
                              <td className="px-4 py-4 text-sm text-gray-500">
                                {new Date(product.createdAt).toLocaleDateString()}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-lg font-semibold mb-4 text-black">All Sellers</h2>
              {vendors.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No sellers found.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-gray-700">
                    <thead className="bg-gray-100 text-xs uppercase text-gray-600">
                      <tr>
                        <th className="px-4 py-3">Vendor</th>
                        <th className="px-4 py-3">Email</th>
                        <th className="px-4 py-3">Products</th>
                        <th className="px-4 py-3">Joined Date</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {vendors.map((vendor) => (
                        <tr key={vendor._id} className="hover:bg-gray-50">
                          <td className="px-4 py-4 font-medium text-gray-900">{vendor.fullName}</td>
                          <td className="px-4 py-4">{vendor.email}</td>
                          <td className="px-4 py-4">
                            <button
                              onClick={() => handleViewProducts(vendor)}
                              className="inline-flex items-center gap-1 rounded-full bg-blue-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-600"
                            >
                              <FaShoppingCart /> View Products
                            </button>
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-500">
                            {new Date(vendor.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-4 text-right">
                            <button
                              onClick={() => handleViewProducts(vendor)}
                              className="inline-flex items-center gap-1 rounded-full bg-indigo-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-600"
                            >
                              <FaEye /> View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

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
};

export default SellersPage;
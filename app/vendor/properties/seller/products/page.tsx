"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/app/components/Pages/vendor/Sidebar";
import { FaPlus, FaEdit, FaTrash, FaEye, FaShoppingCart } from "react-icons/fa";

interface Product {
  _id: string;
  name: string;
  category: string;
  description: string;
  basePrice: number;
  images: string[];
  variants: any[];
  tags: string[];
  isActive: boolean;
  sellerId: string;
  createdAt: string;
  updatedAt: string;
  stock?: number;
  outOfStock?: boolean;
}

interface Category {
  _id: string;
  name: string;
  slug: string;
  requiresVariants: boolean;
  image?: string;
  displayOrder: number;
  isActive: boolean;
  ownerType?: string;
  owner?: string;
}

const VendorProductsPage: React.FC = () => {
  const router = useRouter();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Get navigation function from global context
  const navigate = typeof window !== 'undefined' ? (window as any).__VENDOR_NAVIGATE__?.navigate : null;

  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/products?mine=true", {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data?.message || "Failed to fetch products");
      setProducts(data.products || []);
    } catch (err: any) {
      setError(err?.message || "Unable to fetch products");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data?.message || "Failed to delete product");
      loadProducts();
    } catch (err: any) {
      alert(err?.message || "Failed to delete product");
    }
  };

  const getCategoryLabel = (category: string) => {
    // Capitalize first letter and replace hyphens with spaces
    return category
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  useEffect(() => {
    loadProducts();
  }, []);

  return (
    <div className="flex h-screen bg-sky-50 text-black overflow-hidden">
      {/* <div className="hidden lg:block lg:flex-shrink-0">
        <Sidebar />
      </div> */}

      <div className="flex-1 flex flex-col  overflow-hidden lg:pt-15 pt-0">
     <div className="sticky top-0 z-40 bg-sky-50">

  {/* Top Bar — only menu button */}
  {/* <div className="p-3  flex items-center">
    <button
      className="lg:hidden px-3 py-2 rounded border text-gray-700"
      onClick={() => setMobileSidebarOpen(true)}
      aria-label="Open menu"
    >
      ☰
    </button>
  </div> */}

  {/* Title + Add Product */}
  <div className="flex items-center justify-between gap-3 p-3 border-b">
    <div className="flex items-center gap-3">
      <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">My Products</h1>
    </div>

    <div className="flex items-center gap-3">
      <p className="hidden sm:block text-sm text-gray-600">Manage your products and variants.</p>
      
      <button
        onClick={() =>
          navigate
            ? navigate("/vendor/properties/seller/products/add")
            : router.push("/vendor/properties/seller/products/add")
        }
        className="inline-flex items-center gap-2 rounded-full bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
      >
        <FaPlus /> Add Product
      </button>
    </div>
  </div>

</div>


        <main className="flex-1 overflow-y-auto overflow-x-auto lg:overflow-x-hidden p-4 sm:p-6">
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-green-500 border-t-transparent" />
            </div>
          ) : error ? (
            <div className="rounded-xl bg-red-50 p-6 text-red-700">{error}</div>
          ) : products.length === 0 ? (
            <div className="rounded-xl bg-white p-8 text-center shadow">
              <FaShoppingCart className="mx-auto mb-4 text-4xl text-gray-400" />
              <p className="text-gray-600 mb-4">You have not added any products yet.</p>
              <button
                onClick={() => navigate ? navigate("/vendor/properties/seller/products/add") : router.push("/vendor/properties/seller/products/add")}
                className="inline-flex items-center gap-2 rounded-full bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
              >
                <FaPlus /> Add First Product
              </button>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl bg-white shadow">
              <div className="hidden w-full min-w-[900px] lg:block">
                <table className="w-full text-left text-sm text-gray-700">
                  <thead className="bg-gray-100 text-xs uppercase text-gray-600">
                    <tr>
                      <th className="px-4 py-3">Product</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">Price</th>
                      <th className="px-4 py-3">Variants</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {products.map((product) => {
                      const variantCount = product.variants?.length || 0;
                      const totalStock = product.variants?.reduce((sum, v) => sum + v.stock, 0) || 0;
                      const productStock = product.stock ?? 0;
                      return (
                        <tr key={product._id} className="hover:bg-gray-50">
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              {product.images && product.images.length > 0 && (
                                <img
                                  src={product.images[0]}
                                  alt={product.name}
                                  className="h-16 w-16 rounded-lg object-cover"
                                />
                              )}
                              <div>
                                <p className="font-semibold text-gray-900">{product.name}</p>
                                {product.outOfStock && (
                                  <span className="mt-1 inline-flex rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-red-700">
                                    Out of Stock
                                  </span>
                                )}
                                <p className="text-xs text-gray-500 line-clamp-1">{product.description}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                              {getCategoryLabel(product.category)}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-700">
                            <p className="font-semibold text-gray-900">₹{product.basePrice.toLocaleString()}</p>
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-700">
                            {variantCount > 0 ? (
                              <div>
                                <p className="text-gray-900">{variantCount} variant(s)</p>
                                <p className="text-xs text-gray-500">Total stock: {totalStock}</p>
                              </div>
                            ) : (
                              <div>
                                <p className="text-gray-900">No variants</p>
                                <p
                                  className={`text-xs font-semibold ${
                                    productStock > 0 && !product.outOfStock ? "text-green-600" : "text-red-600"
                                  }`}
                                >
                                  {productStock > 0 && !product.outOfStock ? `${productStock} in stock` : "Out of stock"}
                                </p>
                              </div>
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
                          <td className="px-4 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => navigate ? navigate(`/products/${product._id}`) : router.push(`/products/${product._id}`)}
                                className="inline-flex items-center gap-1 rounded-full bg-blue-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-600"
                              >
                                <FaEye /> View
                              </button>
                              <button
                                onClick={() => navigate ? navigate(`/vendor/properties/seller/products/edit/${product._id}`) : router.push(`/vendor/properties/seller/products/edit/${product._id}`)}
                                className="inline-flex items-center gap-1 rounded-full bg-yellow-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-yellow-600"
                              >
                                <FaEdit /> Edit
                              </button>
                              <button
                                onClick={() => handleDelete(product._id)}
                                className="inline-flex items-center gap-1 rounded-full bg-red-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-600"
                              >
                                <FaTrash /> Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="grid gap-4 p-4 lg:hidden">
                {products.map((product) => {
                  const variantCount = product.variants?.length || 0;
                  const totalStock = product.variants?.reduce((sum, v) => sum + v.stock, 0) || 0;
                  const productStock = product.stock ?? 0;
                  return (
                    <div key={product._id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                      <div className="flex items-start gap-3">
                        {product.images && product.images.length > 0 && (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="h-20 w-20 rounded-lg object-cover"
                          />
                        )}
                        <div className="flex-1">
                          <p className="text-base font-semibold text-gray-900">{product.name}</p>
                          {product.outOfStock && (
                            <span className="mt-1 inline-flex rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-red-700">
                              Out of Stock
                            </span>
                          )}
                          <p className="text-xs text-gray-500 line-clamp-2 mt-1">{product.description}</p>
                          
                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-green-50 px-2 py-1 text-xs font-semibold text-green-700">
                              {getCategoryLabel(product.category)}
                            </span>
                            <span className="text-sm font-medium text-gray-900">₹{product.basePrice.toLocaleString()}</span>
                            <span
                              className={`rounded-full px-2 py-1 text-xs font-semibold ${
                                product.isActive
                                  ? "bg-green-50 text-green-700"
                                  : "bg-red-50 text-red-700"
                              }`}
                            >
                              {product.isActive ? "Active" : "Inactive"}
                            </span>
                          </div>
                          
                          <div className="mt-3 flex items-center justify-between">
                            <div>
                              {variantCount > 0 ? (
                                <p className="text-xs text-gray-600">
                                  {variantCount} variant{variantCount !== 1 ? "s" : ""} • {totalStock} in stock
                                </p>
                              ) : (
                                <p
                                  className={`text-xs font-semibold ${
                                    productStock > 0 && !product.outOfStock ? "text-green-600" : "text-red-600"
                                  }`}
                                >
                                  {productStock > 0 && !product.outOfStock ? `${productStock} in stock` : "Out of stock"}
                                </p>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => navigate ? navigate(`/products/${product._id}`) : router.push(`/products/${product._id}`)}
                                className="inline-flex items-center gap-1 rounded-full bg-blue-500 px-2 py-1 text-xs font-semibold text-white hover:bg-blue-600"
                              >
                                <FaEye size={10} />
                              </button>
                              <button
                                onClick={() => navigate ? navigate(`/vendor/properties/seller/products/edit/${product._id}`) : router.push(`/vendor/properties/seller/products/edit/${product._id}`)}
                                className="inline-flex items-center gap-1 rounded-full bg-yellow-500 px-2 py-1 text-xs font-semibold text-white hover:bg-yellow-600"
                              >
                                <FaEdit size={10} />
                              </button>
                              <button
                                onClick={() => handleDelete(product._id)}
                                className="inline-flex items-center gap-1 rounded-full bg-red-500 px-2 py-1 text-xs font-semibold text-white hover:bg-red-600"
                              >
                                <FaTrash size={10} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Sidebar Drawer */}
      {/* {mobileSidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-100 bg-black/40 lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-72 bg-white shadow-2xl z-100 p-0 lg:hidden overflow-y-auto">
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
};

export default VendorProductsPage;
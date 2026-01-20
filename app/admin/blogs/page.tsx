"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/app/components/Pages/admin/Sidebar";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaPlus, FaEdit, FaTrash, FaEye, FaFileAlt } from "react-icons/fa";
import Image from "next/image";

interface BlogSummary {
  _id: string;
  title: string;
  image?: string;
  published: boolean;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminBlogsPage() {
  const router = useRouter();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [blogs, setBlogs] = useState<BlogSummary[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBlogs();
  }, []);

  const loadBlogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/blogs?all=true", {
        cache: "no-store",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data?.message || "Failed to fetch blogs");
      setBlogs(data.blogs || []);
    } catch (err: any) {
      setError(err?.message || "Unable to fetch blogs");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this blog?")) return;

    try {
      const res = await fetch(`/api/admin/blogs/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data?.message || "Failed to delete blog");
      loadBlogs();
    } catch (err: any) {
      alert(err?.message || "Failed to delete blog");
    }
  };

  return (
    <div className="flex h-screen bg-sky-50 text-black">
      {/* <div className="hidden lg:block">
        <Sidebar />
      </div> */}

      <div className="flex-1 flex flex-col ">
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
              <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Blogs Management</h1>
            </div>
            <div className="flex items-center gap-3">
              <p className="hidden sm:block text-sm text-gray-600">Manage blog posts.</p>
              <Link
                href="/admin/blogs/add"
                className="inline-flex items-center gap-2 rounded-full bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
              >
                <FaPlus /> Add Blog
              </Link>
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
          ) : blogs.length === 0 ? (
            <div className="rounded-xl bg-white p-8 text-center shadow">
              <FaFileAlt className="mx-auto mb-4 text-4xl text-gray-400" />
              <p className="text-gray-600 mb-4">No blogs have been created yet.</p>
              <Link
                href="/admin/blogs/add"
                className="inline-flex items-center gap-2 rounded-full bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
              >
                <FaPlus /> Add First Blog
              </Link>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl bg-white shadow">
              <div className="hidden w-full min-w-[900px] lg:block">
                <table className="w-full text-left text-sm text-gray-700">
                  <thead className="bg-gray-100 text-xs uppercase text-gray-600">
                    <tr>
                      <th className="px-4 py-3">Blog</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Created</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {blogs.map((blog) => (
                      <tr key={blog._id} className="hover:bg-gray-50">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            {blog.image && (
                              <div className="relative h-16 w-24 rounded-lg overflow-hidden">
                                <Image
                                  src={blog.image}
                                  alt={blog.title}
                                  fill
                                  className="object-cover"
                                  sizes="96px"
                                />
                              </div>
                            )}
                            <div>
                              <p className="font-semibold text-gray-900">{blog.title}</p>
                              <p className="text-xs text-gray-500">/{blog.slug}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              blog.published
                                ? "bg-green-50 text-green-700"
                                : "bg-yellow-50 text-yellow-700"
                            }`}
                          >
                            {blog.published ? "Published" : "Draft"}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-700">
                          {new Date(blog.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/blogs/${blog.slug}`}
                              className="inline-flex items-center gap-1 rounded-full bg-blue-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-600"
                            >
                              <FaEye /> View
                            </Link>
                            <Link
                              href={`/admin/blogs/edit/${blog._id}`}
                              className="inline-flex items-center gap-1 rounded-full bg-yellow-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-yellow-600"
                            >
                              <FaEdit /> Edit
                            </Link>
                            <button
                              onClick={() => handleDelete(blog._id)}
                              className="inline-flex items-center gap-1 rounded-full bg-red-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-600"
                            >
                              <FaTrash /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="grid gap-4 p-4 lg:hidden">
                {blogs.map((blog) => (
                  <div key={blog._id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="flex items-start gap-3">
                      {blog.image && (
                        <div className="relative h-20 w-32 rounded-lg overflow-hidden shrink-0">
                          <Image
                            src={blog.image}
                            alt={blog.title}
                            fill
                            className="object-cover"
                            sizes="128px"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="text-base font-semibold text-gray-900">{blog.title}</p>
                        <p className="text-xs text-gray-500">/{blog.slug}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              blog.published
                                ? "bg-green-50 text-green-700"
                                : "bg-yellow-50 text-yellow-700"
                            }`}
                          >
                            {blog.published ? "Published" : "Draft"}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(blog.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Link
                        href={`/blogs/${blog.slug}`}
                        className="flex-1 inline-flex items-center justify-center gap-1 rounded-full bg-blue-500 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-600"
                      >
                        <FaEye /> View
                      </Link>
                      <Link
                        href={`/admin/blogs/edit/${blog._id}`}
                        className="flex-1 inline-flex items-center justify-center gap-1 rounded-full bg-yellow-500 px-3 py-2 text-xs font-semibold text-white hover:bg-yellow-600"
                      >
                        <FaEdit /> Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(blog._id)}
                        className="flex-1 inline-flex items-center justify-center gap-1 rounded-full bg-red-500 px-3 py-2 text-xs font-semibold text-white hover:bg-red-600"
                      >
                        <FaTrash /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Sidebar */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileSidebarOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-64 bg-white shadow-xl">
            <Sidebar />
          </div>
        </div>
      )}
    </div>
  );
}


"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaCalendar, FaArrowRight } from "react-icons/fa";
import PageLoader from "../components/common/PageLoader";

type Blog = {
  _id: string;
  title: string;
  image?: string;
  slug: string;
  published: boolean;
  createdAt: string;
};

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const res = await fetch("/api/blogs");
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data?.message || "Failed to fetch blogs");
      }
      setBlogs(data.blogs || []);
    } catch (err: any) {
      setError(err?.message || "Failed to load blogs");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="mx-auto max-w-7xl px-6 lg:px-2">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Blog</h1>
          <p className="text-lg text-gray-600">Discover travel stories, tips, and insights</p>
        </div>

        {/* Blogs Grid */}
        {loading ? (
          <PageLoader fullscreen={false} className="py-20" />
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20">
            <p className="text-lg text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchBlogs}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Try Again
            </button>
          </div>
        ) : blogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <p className="text-lg text-gray-600">No blogs available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((blog) => (
              <Link
                key={blog._id}
                href={`/blogs/${blog.slug}`}
                className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-md transition hover:-translate-y-1 hover:shadow-xl"
              >
                {/* Image */}
                <div className="relative h-64 w-full">
                  {blog.image ? (
                    <Image
                      src={blog.image}
                      alt={blog.title}
                      fill
                      className="object-cover transition duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-green-100 to-lime-100">
                      <span className="text-4xl text-green-600">📝</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col gap-3 p-6">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <FaCalendar className="text-green-600" />
                    <span>{formatDate(blog.createdAt)}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 line-clamp-2 group-hover:text-green-600 transition">
                    {blog.title}
                  </h3>
                  <div className="mt-auto pt-4">
                    <span className="inline-flex items-center gap-2 text-green-600 font-semibold group-hover:gap-3 transition-all">
                      Read More <FaArrowRight />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { FaArrowLeft, FaCalendar } from "react-icons/fa";
import PageLoader from "../../components/common/PageLoader";

type Blog = {
  _id: string;
  title: string;
  image?: string;
  content: string;
  slug: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
};

export default function BlogDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [loading, setLoading] = useState(true);
  const [blog, setBlog] = useState<Blog | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      loadBlog();
    }
  }, [slug]);

  const loadBlog = async () => {
    try {
      const res = await fetch(`/api/blogs/${slug}`, {
        cache: "no-store",
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData?.message || `Failed to load blog: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      if (!data.success) {
        throw new Error(data?.message || "Failed to load blog");
      }

      if (!data.blog) {
        throw new Error("Blog data is missing");
      }

      setBlog(data.blog);
    } catch (err: any) {
      console.error("Failed to load blog:", err);
      setError(err?.message || "Failed to load blog");
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

  if (loading) {
    return <PageLoader />;
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 pb-12 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600 mb-4">{error || "Blog not found"}</p>
          <Link
            href="/blogs"
            className="inline-flex items-center gap-2 text-green-600 hover:text-green-700"
          >
            <FaArrowLeft /> Back to Blogs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <Link
          href="/blogs"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <FaArrowLeft /> Back to Blogs
        </Link>

        <article className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Featured Image */}
          {blog.image && (
            <div className="relative h-96 w-full">
              <Image
                src={blog.image}
                alt={blog.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 896px"
                priority
              />
            </div>
          )}

          {/* Content */}
          <div className="p-8 md:p-12">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                <FaCalendar className="text-green-600" />
                <span>{formatDate(blog.createdAt)}</span>
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">{blog.title}</h1>
            </div>

            {/* Blog Content */}
            <div
              className="blog-content text-gray-700 leading-relaxed text-lg"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />
          </div>
        </article>

        {/* Back to Blogs */}
        <div className="mt-8 text-center">
          <Link
            href="/blogs"
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            <FaArrowLeft /> View All Blogs
          </Link>
        </div>
      </div>
    </div>
  );
}


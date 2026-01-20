"use client";

import React, { useEffect, useState } from "react";
import { Star, Trash2, ExternalLink, MessageSquare, Image as ImageIcon, User } from "lucide-react";
import Image from "next/image";
import { toast } from "react-hot-toast";
import LocalLoader from "../../components/common/LocalLoader";

const AdminReviewsPage = () => {
      const [reviews, setReviews] = useState<any[]>([]);
      const [loading, setLoading] = useState(true);
      const [total, setTotal] = useState(0);
      const [page, setPage] = useState(1);

      const fetchReviews = async () => {
            setLoading(true);
            try {
                  const response = await fetch(`/api/reviews?page=${page}&limit=20`);
                  const data = await response.json();
                  if (data.success) {
                        setReviews(data.reviews);
                        setTotal(data.total);
                  }
            } catch (error) {
                  console.error("Fetch reviews error:", error);
                  toast.error("Failed to load reviews");
            } finally {
                  setLoading(false);
            }
      };

      useEffect(() => {
            fetchReviews();
      }, [page]);

      const deleteReview = async (id: string) => {
            if (!confirm("Are you sure you want to delete this review?")) return;

            try {
                  const response = await fetch(`/api/reviews/${id}`, { method: "DELETE" });
                  const data = await response.json();
                  if (data.success) {
                        toast.success("Review deleted successfully");
                        fetchReviews();
                  } else {
                        toast.error(data.message || "Failed to delete review");
                  }
            } catch (error) {
                  console.error("Delete review error:", error);
                  toast.error("An error occurred while deleting review");
            }
      };

      if (loading && page === 1) return <LocalLoader />;

      return (
            <div className="space-y-6">
                  <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold text-gray-900">Review Management</h1>
                        <span className="text-sm text-gray-500">{total} reviews found</span>
                  </div>

                  <div className="grid gap-6">
                        {reviews.length === 0 ? (
                              <div className="bg-white p-12 rounded-2xl text-center border border-dashed border-gray-200">
                                    <MessageSquare size={48} className="mx-auto text-gray-300 mb-4" />
                                    <p className="text-gray-500">No reviews found</p>
                              </div>
                        ) : (
                              reviews.map((review) => (
                                    <div key={review._id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6">
                                          {/* Target Info */}
                                          <div className="w-full md:w-48 shrink-0">
                                                <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 mb-3">
                                                      <Image
                                                            src={review.target?.images?.[0] || "/placeholder-image.png"}
                                                            alt={review.target?.name || "Target"}
                                                            fill
                                                            className="object-cover"
                                                            sizes="(max-width: 768px) 192px, 192px"
                                                      />
                                                </div>
                                                <h4 className="font-semibold text-gray-900 text-sm line-clamp-2">{review.target?.name || "Unknown Item"}</h4>
                                                <span className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-md mt-1 inline-block">
                                                      {review.targetType}
                                                </span>
                                          </div>

                                          {/* Review Content */}
                                          <div className="flex-1 space-y-4">
                                                <div className="flex items-start justify-between">
                                                      <div className="flex items-center gap-3">
                                                            <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                                                                  {review.userId?.avatar ? (
                                                                        <Image
                                                                              src={review.userId.avatar}
                                                                              alt={review.userId?.fullName || "User"}
                                                                              fill
                                                                              className="object-cover"
                                                                              sizes="40px"
                                                                        />
                                                                  ) : (
                                                                        <User className="text-gray-400" size={20} />
                                                                  )}
                                                            </div>
                                                            <div>
                                                                  <p className="font-semibold text-gray-900">{review.userId?.fullName || "Deleted User"}</p>
                                                                  <p className="text-xs text-gray-500">Reviewed on {new Date(review.createdAt).toLocaleDateString()}</p>
                                                            </div>
                                                      </div>
                                                      <div className="flex gap-1">
                                                            {[1, 2, 3, 4, 5].map((s) => (
                                                                  <Star
                                                                        key={s}
                                                                        size={16}
                                                                        className={`${s <= review.rating ? "fill-orange-400 text-orange-400" : "text-gray-300"}`}
                                                                  />
                                                            ))}
                                                      </div>
                                                </div>

                                                <p className="text-gray-700 leading-relaxed italic">"{review.message}"</p>

                                                {review.images && review.images.length > 0 && (
                                                      <div className="flex flex-wrap gap-2">
                                                            {review.images.map((img: string, i: number) => (
                                                                  <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-100">
                                                                        <Image src={img} alt={`Review ${i}`} fill className="object-cover" sizes="80px" />
                                                                  </div>
                                                            ))}
                                                      </div>
                                                )}
                                          </div>

                                          {/* Actions */}
                                          <div className="flex md:flex-col gap-2 shrink-0 justify-end md:justify-start">
                                                <button
                                                      type="button"
                                                      onClick={() => deleteReview(review._id)}
                                                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                      title="Delete Review"
                                                >
                                                      <Trash2 size={20} />
                                                </button>
                                                <button
                                                      type="button"
                                                      onClick={() => window.open(`/${review.targetType.toLowerCase()}s/${review.targetId}`, "_blank")}
                                                      className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                                      title="View Item"
                                                >
                                                      <ExternalLink size={20} />
                                                </button>
                                          </div>
                                    </div>
                              ))
                        )}
                  </div>

                  {total > reviews.length && (
                        <div className="flex justify-center pt-6">
                              <button
                                    onClick={() => setPage(page + 1)}
                                    disabled={loading}
                                    className="bg-white border border-gray-200 px-6 py-2 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
                              >
                                    {loading ? "Loading..." : "Load More"}
                              </button>
                        </div>
                  )}
            </div>
      );
};

export default AdminReviewsPage;

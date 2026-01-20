"use client";

import React, { useEffect, useState } from "react";
import { Star, MessageSquare, Image as ImageIcon, User } from "lucide-react";
import Image from "next/image";
import LocalLoader from "../common/LocalLoader";

interface ReviewDisplayProps {
      targetId: string;
      targetType: "Product" | "Stay" | "Tour" | "Adventure" | "VehicleRental";
}

const ReviewDisplay: React.FC<ReviewDisplayProps> = ({ targetId, targetType }) => {
      const [reviews, setReviews] = useState<any[]>([]);
      const [loading, setLoading] = useState(true);
      const [total, setTotal] = useState(0);

      useEffect(() => {
            const fetchReviews = async () => {
                  try {
                        const response = await fetch(`/api/reviews?targetId=${targetId}&targetType=${targetType}`);
                        const data = await response.json();
                        if (data.success) {
                              setReviews(data.reviews);
                              setTotal(data.total);
                        }
                  } catch (error) {
                        console.error("Fetch reviews error:", error);
                  } finally {
                        setLoading(false);
                  }
            };

            if (targetId) {
                  fetchReviews();
            }
      }, [targetId, targetType]);

      if (loading) return <LocalLoader />;

      return (
            <div className="mt-12 space-y-8">
                  <div className="flex items-center justify-between border-b pb-4">
                        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                              Customer Reviews ({total})
                        </h2>
                  </div>

                  {reviews.length === 0 ? (
                        <div className="bg-gray-50 p-8 rounded-2xl text-center border border-dashed border-gray-200">
                              <MessageSquare className="mx-auto text-gray-300 mb-4" size={40} />
                              <p className="text-gray-500 font-medium">No reviews yet. Be the first to share your experience!</p>
                        </div>
                  ) : (
                        <div className="grid gap-6">
                              {reviews.map((review) => (
                                    <div key={review._id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm transition-shadow hover:shadow-md">
                                          <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                      <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center">
                                                            {review.userId?.avatar ? (
                                                                  <Image
                                                                        src={review.userId.avatar}
                                                                        alt={review.userId?.fullName || "User"}
                                                                        fill
                                                                        className="object-cover"
                                                                        sizes="48px"
                                                                  />
                                                            ) : (
                                                                  <User className="text-gray-400" size={24} />
                                                            )}
                                                      </div>
                                                      <div>
                                                            <p className="font-bold text-gray-900">{review.userId?.fullName || "Verified Traveler"}</p>
                                                            <p className="text-xs text-gray-400 font-medium">
                                                                  {new Date(review.createdAt).toLocaleDateString("en-US", {
                                                                        year: "numeric",
                                                                        month: "long",
                                                                        day: "numeric",
                                                                  })}
                                                            </p>
                                                      </div>
                                                </div>
                                                <div className="flex gap-0.5">
                                                      {[1, 2, 3, 4, 5].map((s) => (
                                                            <Star
                                                                  key={s}
                                                                  size={18}
                                                                  className={`${s <= review.rating ? "fill-orange-400 text-orange-400" : "text-gray-200"}`}
                                                            />
                                                      ))}
                                                </div>
                                          </div>

                                          <p className="text-gray-700 leading-relaxed mb-4 italic">"{review.message}"</p>

                                          {review.images && review.images.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mt-4">
                                                      {review.images.map((img: string, i: number) => (
                                                            <div
                                                                  key={i}
                                                                  className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 cursor-zoom-in hover:brightness-95 transition-all"
                                                            >
                                                                  <Image
                                                                        src={img}
                                                                        alt={`Review thumbnail ${i}`}
                                                                        fill
                                                                        className="object-cover"
                                                                        sizes="(max-width: 768px) 100px, 150px"
                                                                  />
                                                            </div>
                                                      ))}
                                                </div>
                                          )}
                                    </div>
                              ))}
                        </div>
                  )}
            </div>
      );
};

export default ReviewDisplay;

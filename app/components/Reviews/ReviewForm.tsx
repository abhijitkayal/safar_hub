"use client";

import React, { useState } from "react";
import { Star, Upload, X, Loader2 } from "lucide-react";
import Image from "next/image";
import { toast } from "react-hot-toast";

interface ReviewFormProps {
      targetId: string;
      targetType: "Product" | "Stay" | "Tour" | "Adventure" | "VehicleRental";
      onSuccess?: () => void;
      onCancel?: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ targetId, targetType, onSuccess, onCancel }) => {
      const [rating, setRating] = useState(0);
      const [hover, setHover] = useState(0);
      const [message, setMessage] = useState("");
      const [images, setImages] = useState<string[]>([]);
      const [isUploading, setIsUploading] = useState(false);
      const [isSubmitting, setIsSubmitting] = useState(false);

      const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
            const files = e.target.files;
            if (!files || files.length === 0) return;

            setIsUploading(true);
            const formData = new FormData();
            for (let i = 0; i < files.length; i++) {
                  formData.append("files", files[i]);
            }

            try {
                  const response = await fetch("/api/uploads/reviews", {
                        method: "POST",
                        body: formData,
                  });

                  const data = await response.json();
                  if (data.success) {
                        setImages((prev) => [...prev, ...data.uploads.map((u: any) => u.url)]);
                        toast.success("Images uploaded successfully");
                  } else {
                        toast.error(data.message || "Failed to upload images");
                  }
            } catch (error) {
                  console.error("Upload error:", error);
                  toast.error("An error occurred while uploading images");
            } finally {
                  setIsUploading(false);
            }
      };

      const removeImage = (index: number) => {
            setImages((prev) => prev.filter((_, i) => i !== index));
      };

      const handleSubmit = async (e: React.FormEvent) => {
            e.preventDefault();
            if (rating === 0) {
                  toast.error("Please provide a rating");
                  return;
            }
            if (!message.trim()) {
                  toast.error("Please provide a review message");
                  return;
            }

            setIsSubmitting(true);
            try {
                  const response = await fetch("/api/reviews", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                              targetId,
                              targetType,
                              rating,
                              message,
                              images,
                        }),
                  });

                  const data = await response.json();
                  if (data.success) {
                        toast.success("Review submitted successfully");
                        if (onSuccess) onSuccess();
                  } else {
                        toast.error(data.message || "Failed to submit review");
                  }
            } catch (error) {
                  console.error("Submit error:", error);
                  toast.error("An error occurred while submitting review");
            } finally {
                  setIsSubmitting(false);
            }
      };

      return (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-orange-100">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Write a Review</h3>

                  <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Star Rating */}
                        <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                              <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                          <button
                                                key={star}
                                                type="button"
                                                className="focus:outline-none transition-transform active:scale-90"
                                                onClick={() => setRating(star)}
                                                onMouseEnter={() => setHover(star)}
                                                onMouseLeave={() => setHover(0)}
                                          >
                                                <Star
                                                      size={32}
                                                      className={`transition-colors ${(hover || rating) >= star
                                                                  ? "fill-orange-400 text-orange-400"
                                                                  : "text-gray-300"
                                                            }`}
                                                />
                                          </button>
                                    ))}
                              </div>
                        </div>

                        {/* Message */}
                        <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                              <textarea
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all outline-none min-h-[120px]"
                                    placeholder="Share your experience..."
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                              ></textarea>
                        </div>

                        {/* Image Upload */}
                        <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Add Images</label>
                              <div className="flex flex-wrap gap-4">
                                    {images.map((url, index) => (
                                          <div key={index} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-100 group">
                                                <Image
                                                      src={url}
                                                      alt={`Review ${index}`}
                                                      fill
                                                      className="object-cover"
                                                />
                                                <button
                                                      type="button"
                                                      onClick={() => removeImage(index)}
                                                      className="absolute top-1 right-1 bg-white/80 hover:bg-white p-1 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                      <X size={14} className="text-red-500" />
                                                </button>
                                          </div>
                                    ))}

                                    <label className="w-20 h-20 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-orange-400 hover:bg-orange-50 transition-all text-gray-400">
                                          {isUploading ? (
                                                <Loader2 className="animate-spin" size={24} />
                                          ) : (
                                                <>
                                                      <Upload size={24} />
                                                      <span className="text-[10px] mt-1">Upload</span>
                                                </>
                                          )}
                                          <input
                                                type="file"
                                                multiple
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handleImageUpload}
                                                disabled={isUploading}
                                          />
                                    </label>
                              </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-4 pt-2">
                              <button
                                    type="submit"
                                    disabled={isSubmitting || isUploading}
                                    className="flex-1 bg-orange-600 text-white py-3 rounded-xl font-semibold hover:bg-orange-700 disabled:bg-gray-400 transition-colors flex items-center justify-center gap-2"
                              >
                                    {isSubmitting && <Loader2 className="animate-spin" size={20} />}
                                    Submit Review
                              </button>
                              {onCancel && (
                                    <button
                                          type="button"
                                          onClick={onCancel}
                                          className="px-6 py-3 rounded-xl font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                                    >
                                          Cancel
                                    </button>
                              )}
                        </div>
                  </form>
            </div>
      );
};

export default ReviewForm;

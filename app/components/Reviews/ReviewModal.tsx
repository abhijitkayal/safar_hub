"use client";

import React from "react";
import ReviewForm from "./ReviewForm";
import { X } from "lucide-react";

interface ReviewModalProps {
      isOpen: boolean;
      onClose: () => void;
      targetId: string;
      targetType: "Product" | "Stay" | "Tour" | "Adventure" | "VehicleRental";
      onSuccess?: () => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({ isOpen, onClose, targetId, targetType, onSuccess }) => {
      if (!isOpen) return null;

      return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                  <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <button
                              onClick={onClose}
                              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all z-10"
                        >
                              <X size={24} />
                        </button>

                        <div className="max-h-[90vh] overflow-y-auto">
                              <ReviewForm
                                    targetId={targetId}
                                    targetType={targetType}
                                    onSuccess={() => {
                                          if (onSuccess) onSuccess();
                                          onClose();
                                    }}
                                    onCancel={onClose}
                              />
                        </div>
                  </div>
            </div>
      );
};

export default ReviewModal;

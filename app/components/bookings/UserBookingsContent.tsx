//app/components/bookings/UserBookingsContent.tsx
"use client";

import { useEffect, useState } from "react";

import BookingTable, { type BookingRecord } from "./BookingTable";
import PageLoader from "../common/PageLoader";
import { useProfileLayout } from "@/app/profile/ProfileLayoutContext";
import CancellationModal from "../common/CancellationModal";
import ReviewModal from "../Reviews/ReviewModal";


const PRESET_BOOKING_REASONS = [
  "Change of travel plans",
  "Found better dates or pricing",
  "Booking created by mistake",
  "Vendor is unresponsive",
  "Health or emergency reasons",
];

const UserBookingsContent: React.FC = () => {
  const { user } = useProfileLayout();
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [tableLoadingId, setTableLoadingId] = useState<string | null>(null);
  const [tableRefreshing, setTableRefreshing] = useState(false);
  const [initialFetch, setInitialFetch] = useState(true);
  const [cancellationModalOpen, setCancellationModalOpen] = useState(false);
  const [pendingCancellationId, setPendingCancellationId] = useState<string | null>(null);
  const [modalSubmitting, setModalSubmitting] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewTarget, setReviewTarget] = useState<{ id: string; type: any } | null>(null);


  const loadBookings = async (isInitial = false) => {
    try {
      if (!isInitial) {
        setTableRefreshing(true);
      }
      const res = await fetch("/api/bookings", { credentials: "include" });
      const data = await res.json();
      if (res.ok && data.success) {
        setBookings(data.bookings || []);
      } else {
        console.warn("Failed to load bookings", data?.message);
      }
    } catch (error) {
      console.error("Unable to load bookings", error);
    } finally {
      setTableRefreshing(false);
      setTableLoadingId(null);
      if (isInitial) {
        setInitialFetch(false);
      }
    }
  };

  useEffect(() => {
    loadBookings(true);
  }, []);

  const openCancellationModal = (bookingId: string) => {
    setPendingCancellationId(bookingId);
    setCancellationModalOpen(true);
  };

  const handleConfirmCancellation = async (reason: string) => {
    if (!pendingCancellationId) return;
    try {
      setModalSubmitting(true);
      setTableLoadingId(pendingCancellationId);
      const res = await fetch(`/api/bookings/${pendingCancellationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: "cancelled", reason }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data?.message || "Failed to cancel booking");
      }
      await loadBookings();
      setCancellationModalOpen(false);
      setPendingCancellationId(null);
    } catch (error: any) {
      alert(error?.message || "Unable to cancel booking. Please try again.");
      setTableLoadingId(null);
    } finally {
      setModalSubmitting(false);
    }
  };

  if (!user) {
    return <PageLoader fullscreen={false} />;
  }

  return (
    <div className="space-y-6 pt-15">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-gray-800">Booking History</h1>
        <p className="text-sm text-gray-600">
          Keep track of every stay you reserve across the platform. You can view details, totals, and cancel if plans change.
        </p>
        {tableRefreshing && (
          <span className="inline-flex items-center gap-2 text-xs text-gray-500">
            <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
            Updating your bookings…
          </span>
        )}
      </header>

      {initialFetch ? (
        <PageLoader fullscreen={false} className="py-16" />
      ) : (
        <>
          <BookingTable
            bookings={bookings}
            variant="user"
            onCancel={openCancellationModal}
            onReview={(bookingId, serviceType, targetId) => {
              setReviewTarget({
                id: targetId,
                type:
                  serviceType === "stay"
                    ? "Stay"
                    : serviceType === "tour"
                      ? "Tour"
                      : serviceType === "adventure"
                        ? "Adventure"
                        : "VehicleRental",
              });
              setReviewModalOpen(true);
            }}
            loadingBookingId={tableLoadingId}
            emptyMessage="Once you confirm a stay, it will appear here with the reference number and stay details."
          />
          <CancellationModal
            open={cancellationModalOpen}
            title="Cancel this booking"
            subtitle="Selected bookings are cancelled instantly and the vendor is notified."
            presetReasons={PRESET_BOOKING_REASONS}
            submitting={modalSubmitting}
            onClose={() => {
              if (modalSubmitting) return;
              setCancellationModalOpen(false);
              setPendingCancellationId(null);
            }}
            onConfirm={handleConfirmCancellation}
          />
          {reviewTarget && (
            <ReviewModal
              isOpen={reviewModalOpen}
              onClose={() => setReviewModalOpen(false)}
              targetId={reviewTarget.id}
              targetType={reviewTarget.type}
              onSuccess={() => {
                loadBookings();
              }}
            />
          )}
        </>
      )}
    </div>
  );
};

export default UserBookingsContent;
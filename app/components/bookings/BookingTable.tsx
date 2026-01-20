"use client";

import { useMemo } from "react";

export type BookingRecord = {
  _id: string;
  serviceType?: "stay" | "tour" | "adventure" | "vehicle";
  stayId?: {
    _id: string;
    name: string;
    category?: string;
    location?: {
      city?: string;
      state?: string;
      country?: string;
    };
  };
  tourId?: {
    _id: string;
    name: string;
    category?: string;
    location?: {
      city?: string;
      state?: string;
      country?: string;
    };
  };
  adventureId?: {
    _id: string;
    name: string;
    category?: string;
    location?: {
      city?: string;
      state?: string;
      country?: string;
    };
  };
  vehicleRentalId?: {
    _id: string;
    name: string;
    category?: string;
    location?: {
      city?: string;
      state?: string;
      country?: string;
    };
  };
  checkIn: string;
  checkOut: string;
  nights: number;
  startDate?: string;
  endDate?: string;
  pickupDate?: string;
  dropoffDate?: string;
  guests: {
    adults: number;
    children: number;
    infants: number;
  };
  rooms: Array<{
    roomId?: string;
    roomName: string;
    quantity: number;
  }>;
  items?: Array<{
    itemId?: string;
    itemName: string;
    quantity: number;
  }>;
  currency?: string;
  subtotal: number;
  taxes: number;
  fees: number;
  totalAmount: number;
  status?: string;
  paymentStatus?: string;
  customer?: {
    fullName: string;
    email: string;
    phone?: string;
  };
  vendorId?: {
    _id: string;
    fullName?: string;
    email?: string;
    contactNumber?: string;
  } | string;
  cancelledBy?: {
    _id: string;
    fullName?: string;
    email?: string;
    accountType?: string;
  } | string;
  createdAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  cancelledByRole?: "user" | "vendor" | "admin";
};

type BookingTableProps = {
  bookings: BookingRecord[];
  emptyMessage: string;
  variant?: "user" | "vendor" | "admin";
  onUpdateStatus?: (bookingId: string, status: string) => void | Promise<void>;
  onCancel?: (bookingId: string) => void | Promise<void>;
  onReview?: (bookingId: string, serviceType: any, targetId: string) => void;
  loadingBookingId?: string | null;
  showCancellationMeta?: boolean;
};

const formatDate = (value?: string) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatGuests = (record: BookingRecord) => {
  const parts: string[] = [];
  if (record.guests?.adults) parts.push(`${record.guests.adults} adult${record.guests.adults === 1 ? "" : "s"}`);
  if (record.guests?.children) parts.push(`${record.guests.children} child${record.guests.children === 1 ? "" : "ren"}`);
  if (record.guests?.infants) parts.push(`${record.guests.infants} infant${record.guests.infants === 1 ? "" : "s"}`);
  return parts.length ? parts.join(" · ") : "—";
};

const BookingTable: React.FC<BookingTableProps> = ({
  bookings,
  emptyMessage,
  variant = "user",
  onUpdateStatus,
  onCancel,
  onReview,
  loadingBookingId,
  showCancellationMeta = false,
}) => {
  const rows = useMemo(() => bookings || [], [bookings]);

  const showVendorActions = variant === "vendor" && typeof onUpdateStatus === "function";
  const showUserActions = variant === "user" && typeof onCancel === "function";

  if (!rows.length) {
    return (
      <div className="flex h-64 w-full items-center justify-center rounded-3xl border border-dashed border-gray-200 bg-white text-center">
        <div>
          <p className="text-lg font-semibold text-gray-800">No bookings to display</p>
          <p className="mt-2 text-sm text-gray-500">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-3xl border border-gray-200 bg-white shadow">
      <div className="">
        <table className="min-w-full divide-y divide-gray-200 text-sm text-gray-700">
          <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3 text-left">Reference</th>
              <th className="px-4 py-3 text-left">Service</th>
              {variant !== "user" && <th className="px-4 py-3 text-left">Guest</th>}
              <th className="px-4 py-3 text-left">Start</th>
              <th className="px-4 py-3 text-left">End</th>
              <th className="px-4 py-3 text-left">Guests</th>
              <th className="px-4 py-3 text-left">Selection</th>
              <th className="px-4 py-3 text-left">Total</th>
              <th className="px-4 py-3 text-left">Status</th>
              {variant === "admin" && <th className="px-4 py-3 text-left">Vendor</th>}
              <th className="px-4 py-3 text-left">Created</th>
              {showCancellationMeta && (
                <>
                  <th className="px-4 py-3 text-left">Cancelled By</th>
                  <th className="px-4 py-3 text-left">Reason</th>
                  <th className="px-4 py-3 text-left">Cancelled On</th>
                </>
              )}
              {(showVendorActions || showUserActions) && <th className="px-4 py-3 text-left">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {rows.map((booking) => {
              const serviceType =
                booking.serviceType ||
                (booking.stayId
                  ? "stay"
                  : booking.tourId
                    ? "tour"
                    : booking.adventureId
                      ? "adventure"
                      : booking.vehicleRentalId
                        ? "vehicle"
                        : "stay");

              const serviceName =
                booking.stayId?.name ||
                booking.tourId?.name ||
                booking.adventureId?.name ||
                booking.vehicleRentalId?.name ||
                "Service unavailable";

              const locationInfo =
                booking.stayId?.location ||
                booking.tourId?.location ||
                booking.adventureId?.location ||
                booking.vehicleRentalId?.location;

              const locationLabel = locationInfo?.city
                ? `${locationInfo.city}${locationInfo.state ? `, ${locationInfo.state}` : ""}`
                : "—";

              const startDate = booking.checkIn || booking.startDate || booking.pickupDate;
              const endDate = booking.checkOut || booking.endDate || booking.dropoffDate;

              const lineItems =
                serviceType === "stay"
                  ? booking.rooms?.map((room) => ({
                    name: room.roomName,
                    quantity: room.quantity,
                  }))
                  : booking.items?.map((item) => ({
                    name: item.itemName,
                    quantity: item.quantity,
                  }));

              const totalUnits = lineItems?.reduce((sum, item) => sum + (item.quantity ?? 0), 0) ?? 0;
              const lineItemsLabel = lineItems
                ?.map((item) => `${item.name} × ${item.quantity}`)
                .slice(0, 3)
                .join(", ");
              const hasMoreLineItems = (lineItems?.length ?? 0) > 3;

              return (
                <tr key={booking._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 align-top font-semibold text-gray-900">#{booking._id.slice(-8).toUpperCase()}</td>
                  <td className="px-4 py-3 align-top">
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900">{serviceName}</span>
                      <span className="text-xs text-gray-500 capitalize">{serviceType}</span>
                      <span className="text-xs text-gray-500">{locationLabel}</span>
                    </div>
                  </td>
                  {variant !== "user" && (
                    <td className="px-4 py-3 align-top">
                      <div className="flex flex-col text-xs">
                        <span className="font-medium text-gray-900">{booking.customer?.fullName ?? "—"}</span>
                        <span className="text-gray-500">{booking.customer?.email ?? "—"}</span>
                        {booking.customer?.phone && <span className="text-gray-500">{booking.customer.phone}</span>}
                      </div>
                    </td>
                  )}
                  <td className="px-4 py-3 align-top">{formatDate(startDate)}</td>
                  <td className="px-4 py-3 align-top">{formatDate(endDate)}</td>
                  <td className="px-4 py-3 align-top">{formatGuests(booking)}</td>
                  <td className="px-4 py-3 align-top text-xs">
                    <span className="font-semibold text-gray-900">
                      {totalUnits} {serviceType === "vehicle" ? "vehicle" : serviceType === "stay" ? "room" : "option"}
                      {totalUnits === 1 ? "" : "s"}
                    </span>
                    <div className="text-gray-500">{lineItemsLabel || "—"}</div>
                    {hasMoreLineItems && (
                      <div className="text-gray-400">
                        +{(lineItems?.length ?? 0) - 3} more
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 align-top font-semibold text-gray-900">
                    {booking.currency ?? "₹"}
                    {booking.totalAmount.toLocaleString()}
                    {booking.fees ? (
                      <div className="text-xs text-gray-500">
                        Includes ₹{booking.fees.toLocaleString()} platform fee
                      </div>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 align-top">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${booking.status === "confirmed"
                          ? "bg-green-100 text-green-700"
                          : booking.status === "cancelled"
                            ? "bg-rose-100 text-rose-700"
                            : booking.status === "completed"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-amber-100 text-amber-700"
                        }`}
                    >
                      {booking.status ?? "pending"}
                    </span>
                    <div className="mt-1 text-[11px] uppercase tracking-wide text-gray-400">
                      {booking.paymentStatus ?? "unpaid"}
                    </div>
                    {booking.status === "cancelled" && booking.cancelledAt && (
                      <div className="mt-1 text-[11px] text-gray-400">Cancelled {formatDate(booking.cancelledAt)}</div>
                    )}
                  </td>
                  {variant === "admin" && (
                    <td className="px-4 py-3 align-top text-xs text-gray-500">
                      {typeof booking.vendorId === "object" && booking.vendorId
                        ? (
                          <>
                            <div className="font-semibold text-gray-900">{booking.vendorId.fullName ?? "—"}</div>
                            <div>{booking.vendorId.email ?? "—"}</div>
                            {booking.vendorId.contactNumber && <div>{booking.vendorId.contactNumber}</div>}
                          </>
                        )
                        : "—"}
                    </td>
                  )}
                  <td className="px-4 py-3 align-top text-xs text-gray-500">{formatDate(booking.createdAt)}</td>
                  {showCancellationMeta && (
                    <>
                      <td className="px-4 py-3 align-top text-xs text-gray-600">
                        {booking.cancelledByRole ? (
                          <div className="flex flex-col">
                            <span className="font-semibold capitalize">{booking.cancelledByRole}</span>
                            {typeof booking.cancelledBy === "object" && booking.cancelledBy ? (
                              <>
                                <span>{booking.cancelledBy.fullName ?? "—"}</span>
                                {booking.cancelledBy.email && (
                                  <span className="text-gray-400">{booking.cancelledBy.email}</span>
                                )}
                              </>
                            ) : null}
                          </div>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-4 py-3 align-top text-xs text-gray-600">
                        {booking.cancellationReason ? (
                          <span className="line-clamp-2">{booking.cancellationReason}</span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-4 py-3 align-top text-xs text-gray-500">{formatDate(booking.cancelledAt)}</td>
                    </>
                  )}
                  {(showVendorActions || showUserActions) && (
                    <td className="px-4 py-3 align-top">
                      {showVendorActions ? (
                        <div className="flex items-center gap-2">
                          <select
                            disabled={!!loadingBookingId && loadingBookingId === booking._id}
                            value={booking.status ?? "pending"}
                            onChange={(event) => {
                              const value = event.target.value;
                              onUpdateStatus?.(booking._id, value);
                            }}
                            className="rounded-lg border border-gray-200 px-3 py-1 text-xs focus:border-indigo-500 focus:outline-none"
                          >
                            {["pending", "confirmed", "completed", "cancelled"].map((statusOption) => (
                              <option key={statusOption} value={statusOption}>
                                {statusOption}
                              </option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <button
                          type="button"
                          disabled={
                            booking.status === "cancelled" ||
                            booking.status === "completed" ||
                            (loadingBookingId ? loadingBookingId === booking._id : false)
                          }
                          onClick={() => onCancel?.(booking._id)}
                          className="rounded-full border border-rose-300 px-3 py-1 text-xs font-semibold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-400"
                        >
                          Cancel booking
                        </button>
                      )}
                      {variant === "user" && booking.status === "completed" && (
                        <button
                          type="button"
                          onClick={() => {
                            const targetId =
                              booking.stayId?._id ||
                              booking.tourId?._id ||
                              booking.adventureId?._id ||
                              booking.vehicleRentalId?._id;
                            if (targetId) {
                              onReview?.(booking._id, serviceType, targetId);
                            }
                          }}
                          className="mt-2 block w-full rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-600 transition hover:bg-orange-100"
                        >
                          Write a Review
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BookingTable;


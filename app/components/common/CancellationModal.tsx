"use client";

import { useEffect, useMemo, useState } from "react";

type CancellationModalProps = {
  open: boolean;
  title: string;
  subtitle?: string;
  presetReasons: string[];
  submitting?: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
};

const CancellationModal = ({
  open,
  title,
  subtitle,
  presetReasons,
  submitting = false,
  onClose,
  onConfirm,
}: CancellationModalProps) => {
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [customReason, setCustomReason] = useState("");
  const [error, setError] = useState("");

  const hasCustomSelection = selectedReason === "__custom__";

  const resolvedReason = useMemo(() => {
    if (hasCustomSelection) {
      return customReason.trim();
    }
    return selectedReason.trim();
  }, [customReason, hasCustomSelection, selectedReason]);

  useEffect(() => {
    if (!open) {
      setSelectedReason("");
      setCustomReason("");
      setError("");
    } else if (presetReasons.length && !selectedReason) {
      setSelectedReason(presetReasons[0]);
    }
  }, [open, presetReasons, selectedReason]);

  if (!open) return null;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!resolvedReason) {
      setError("Please pick or enter a cancellation reason.");
      return;
    }
    setError("");
    onConfirm(resolvedReason);
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-green-600 font-semibold">Cancellation reason</p>
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            {subtitle && <p className="mt-1 text-sm text-gray-600">{subtitle}</p>}
          </div>
          <button
            type="button"
            className="rounded-full border border-gray-200 px-3 py-1 text-sm text-gray-500 hover:border-gray-300"
            onClick={onClose}
            disabled={submitting}
            aria-label="Close cancellation modal"
          >
            ×
          </button>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <fieldset className="space-y-2">
            <legend className="text-xs font-semibold uppercase tracking-wide text-gray-500">Choose a reason</legend>
            <div className="space-y-2">
              {presetReasons.map((reason) => (
                <label
                  key={reason}
                  className={`flex cursor-pointer items-start gap-3 rounded-2xl border px-3 py-2 text-sm ${
                    selectedReason === reason ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="cancellation-reason"
                    value={reason}
                    checked={selectedReason === reason}
                    onChange={() => setSelectedReason(reason)}
                    className="mt-1"
                  />
                  <span className="text-gray-800">{reason}</span>
                </label>
              ))}
              <label
                className={`flex cursor-pointer items-start gap-3 rounded-2xl border px-3 py-2 text-sm ${
                  hasCustomSelection ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="cancellation-reason"
                  value="__custom__"
                  checked={hasCustomSelection}
                  onChange={() => setSelectedReason("__custom__")}
                  className="mt-1"
                />
                <div className="flex-1">
                  <span className="text-gray-800 font-medium">Other</span>
                  <textarea
                    className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:border-green-500 focus:outline-none"
                    rows={3}
                    placeholder="Share more details..."
                    value={customReason}
                    onChange={(event) => {
                      setCustomReason(event.target.value);
                      if (!hasCustomSelection) {
                        setSelectedReason("__custom__");
                      }
                    }}
                  />
                </div>
              </label>
            </div>
          </fieldset>

          {error && <p className="text-sm text-rose-600">{error}</p>}

          <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:border-gray-300"
              disabled={submitting}
            >
              Keep booking
            </button>
            <button
              type="submit"
              className="rounded-full bg-rose-600 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-rose-700 disabled:opacity-60"
              disabled={submitting}
            >
              {submitting ? "Cancelling…" : "Confirm cancellation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CancellationModal;


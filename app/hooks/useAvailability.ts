"use client";

import { useEffect, useMemo, useState } from "react";

type ServiceType = "stay" | "tour" | "adventure" | "vehicle";

export type BookedRange = { start: string; end: string };

type AvailabilityState = {
  loading: boolean;
  isAvailable: boolean;
  error: string | null;
  bookedRanges: BookedRange[];
  availableOptionKeys: string[];
};

const initialState: AvailabilityState = {
  loading: false,
  isAvailable: true,
  error: null,
  bookedRanges: [],
  availableOptionKeys: [],
};

export function useAvailability(
  serviceType: ServiceType,
  listingId: string,
  startDate?: string,
  endDate?: string
) {
  const [state, setState] = useState<AvailabilityState>(initialState);

  const paramsKey = useMemo(() => {
    if (!listingId || !startDate || !endDate) return null;
    return `${serviceType}-${listingId}-${startDate}-${endDate}`;
  }, [serviceType, listingId, startDate, endDate]);

  useEffect(() => {
    if (!paramsKey) {
      setState(initialState);
      return;
    }

    let ignore = false;

    const fetchAvailability = async () => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const searchParams = new URLSearchParams({
          serviceType,
          id: listingId,
          start: startDate!,
          end: endDate!,
        });

        const res = await fetch(`/api/availability?${searchParams.toString()}`, {
          cache: "no-store",
        });

        const data = await res.json();

        if (ignore) return;

        if (!res.ok || !data.success) {
          throw new Error(data?.message || "Unable to fetch availability");
        }

        setState({
          loading: false,
          isAvailable: data.isAvailable !== false,
          error: null,
          bookedRanges: Array.isArray(data.bookedRanges) ? data.bookedRanges : [],
          availableOptionKeys: Array.isArray(data.availableOptionKeys) ? data.availableOptionKeys : [],
        });
      } catch (error: any) {
        if (ignore) return;
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error?.message || "Unable to load availability",
        }));
      }
    };

    fetchAvailability();

    return () => {
      ignore = true;
    };
  }, [paramsKey, serviceType, listingId, startDate, endDate]);

  return state;
}



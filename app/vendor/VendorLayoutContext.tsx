"use client";

import { createContext, useContext } from "react";

type VendorLayoutContextValue = {
  user: any;
  refreshUser: () => Promise<void>;
  locked: boolean;
};

const VendorLayoutContext = createContext<VendorLayoutContextValue | null>(null);

export const useVendorLayout = () => {
  const context = useContext(VendorLayoutContext);
  if (!context) {
    throw new Error("useVendorLayout must be used within VendorLayout");
  }
  return context;
};

export default VendorLayoutContext;


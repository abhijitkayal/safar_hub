// app/vendor/page.tsx
"use client";

import Dashboard from "@/app/components/Pages/vendor/Dashboard";
import { useVendorLayout } from "./VendorLayoutContext";

export default function VendorPage() {
  const { user, locked } = useVendorLayout();

  return <Dashboard locked={locked} isSeller={user?.isSeller || false} />;
}
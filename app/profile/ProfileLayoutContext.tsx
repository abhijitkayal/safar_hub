"use client";

import { createContext, useContext } from "react";

type ProfileLayoutContextValue = {
  user: any;
  refreshUser: () => Promise<void>;
};

const ProfileLayoutContext = createContext<ProfileLayoutContextValue | null>(null);

export const useProfileLayout = () => {
  const context = useContext(ProfileLayoutContext);
  if (!context) {
    throw new Error("useProfileLayout must be used within ProfileLayout");
  }
  return context;
};

export default ProfileLayoutContext;


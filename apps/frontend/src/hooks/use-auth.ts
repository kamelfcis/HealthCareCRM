"use client";

import { useMemo, useState } from "react";
import { AuthUser } from "@/types";
import { storage } from "@/lib/storage";

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(storage.getUser());

  const isAuthenticated = !!user;

  return useMemo(
    () => ({
      user,
      setUser,
      isAuthenticated,
      clearSession: () => {
        storage.clearSession();
        setUser(null);
      }
    }),
    [user, isAuthenticated]
  );
};

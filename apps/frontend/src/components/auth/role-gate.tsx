"use client";

import { useEffect, useState } from "react";
import { RoleName } from "@/types";
import { storage } from "@/lib/storage";
import { hasAllPermissions } from "@/lib/permissions";

interface RoleGateProps {
  allowed?: RoleName[];
  requiredPermissions?: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RoleGate({ allowed, requiredPermissions, children, fallback = null }: RoleGateProps) {
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState(() => storage.getUser());

  useEffect(() => {
    setMounted(true);
    setUser(storage.getUser());
  }, []);

  if (!mounted) return fallback;
  if (!user) return fallback;
  if (allowed?.length && !allowed.includes(user.role)) {
    return <>{fallback}</>;
  }
  if (requiredPermissions?.length && !hasAllPermissions(user, requiredPermissions)) {
    return <>{fallback}</>;
  }
  return <>{children}</>;
}

"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { RoleName } from "@/types";
import { storage } from "@/lib/storage";
import { hasAllPermissions } from "@/lib/permissions";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: RoleName[];
  requiredPermissions?: string[];
}

export default function ProtectedRoute({ children, allowedRoles, requiredPermissions }: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const user = storage.getUser();
    if (!user) {
      router.replace("/login");
      return;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
      router.replace("/dashboard");
      return;
    }

    if (requiredPermissions && !hasAllPermissions(user, requiredPermissions)) {
      router.replace("/dashboard");
    }
  }, [allowedRoles, requiredPermissions, pathname, router]);

  return <>{children}</>;
}

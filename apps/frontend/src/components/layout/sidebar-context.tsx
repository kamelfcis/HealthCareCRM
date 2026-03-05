"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

interface SidebarContextValue {
  collapsed: boolean;
  mobileOpen: boolean;
  toggleCollapsed: () => void;
  openMobile: () => void;
  closeMobile: () => void;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("hc-sidebar-collapsed");
    if (stored) setCollapsed(stored === "1");
  }, []);

  const value = useMemo(
    () => ({
      collapsed,
      mobileOpen,
      toggleCollapsed: () =>
        setCollapsed((value) => {
          const next = !value;
          localStorage.setItem("hc-sidebar-collapsed", next ? "1" : "0");
          return next;
        }),
      openMobile: () => setMobileOpen(true),
      closeMobile: () => setMobileOpen(false)
    }),
    [collapsed, mobileOpen]
  );

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar must be used inside SidebarProvider");
  return ctx;
}

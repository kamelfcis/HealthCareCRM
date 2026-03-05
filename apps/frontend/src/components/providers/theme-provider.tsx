"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const Provider = NextThemesProvider as React.ComponentType<
    React.PropsWithChildren<{
      attribute: "class";
      defaultTheme: string;
      enableSystem: boolean;
      disableTransitionOnChange: boolean;
    }>
  >;

  return (
    <Provider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
      {children}
    </Provider>
  );
}

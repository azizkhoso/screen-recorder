// src/components/ui/provider.tsx
"use client";

import React from "react";
import { ChakraProvider } from "@chakra-ui/react";
import { ThemeProvider as NextThemeProvider } from "next-themes";
import system from "@/theme";

export default function Provider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemeProvider attribute="class" defaultTheme="system">
      <ChakraProvider value={system}>
        {children}
      </ChakraProvider>
    </NextThemeProvider>
  );
}

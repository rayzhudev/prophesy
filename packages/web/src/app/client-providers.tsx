"use client";

import { ReactNode } from "react";
import { FollowerProvider } from "../context/FollowerContext";
import { OAuthHandler } from "../components/OAuthHandler";

export default function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <FollowerProvider>
      <OAuthHandler />
      {children}
    </FollowerProvider>
  );
}

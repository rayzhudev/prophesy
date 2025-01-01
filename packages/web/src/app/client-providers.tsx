"use client";

import { ReactNode } from "react";
import { OAuthHandler } from "../components/OAuthHandler";

export default function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <>
      <OAuthHandler />
      {children}
    </>
  );
}

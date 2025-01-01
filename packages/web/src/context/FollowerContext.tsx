"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

interface FollowerContextValue {
  followerCount: number | null;
  setFollowerCount: (count: number | null) => void;
}

const defaultValue: FollowerContextValue = {
  followerCount: null,
  setFollowerCount: () => {},
};

const FollowerContext = createContext<FollowerContextValue>(defaultValue);

export function FollowerProvider({ children }: { children: ReactNode }) {
  const [followerCount, setFollowerCount] = useState<number | null>(null);

  return (
    <FollowerContext.Provider value={{ followerCount, setFollowerCount }}>
      {children}
    </FollowerContext.Provider>
  );
}

export function useFollowerCount() {
  const context = useContext(FollowerContext);
  if (!context) {
    throw new Error("useFollowerCount must be used within a FollowerProvider");
  }
  return context;
}

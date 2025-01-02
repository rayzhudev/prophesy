"use client";

import { WagmiProvider } from "wagmi";
import { createConfig } from "wagmi";
import { http } from "viem";
import { base, baseSepolia } from "viem/chains";

// Create wagmi config specifically for admin
const adminConfig = createConfig({
  chains: [base, baseSepolia],
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http(),
  },
});

export function AdminProvider({ children }: { children: React.ReactNode }) {
  return <WagmiProvider config={adminConfig}>{children}</WagmiProvider>;
}

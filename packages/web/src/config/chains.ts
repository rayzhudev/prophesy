import { createPublicClient, http } from "viem";
import { base, baseSepolia } from "viem/chains";

// Use Base for production, Base Sepolia for development
export const activeChain =
  process.env.NODE_ENV === "production" ? base : baseSepolia;

// Chain ID for the active chain
export const chainId = activeChain.id;

// Chain name for display
export const chainName = activeChain.name;

// RPC URL for the active chain
export const rpcUrl = activeChain.rpcUrls.default.http[0];

// Create a public client for the appropriate chain
export const publicClient = createPublicClient({
  chain: activeChain,
  transport: http(),
});

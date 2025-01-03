import { createPublicClient, http, type PublicClient } from "viem";
import { base, baseSepolia } from "viem/chains";
import { createCreatorClient } from "@zoralabs/protocol-sdk";

// Log current environment
console.log("Current NODE_ENV:", process.env.NODE_ENV);

// Choose chain based on environment
export const chain = process.env.NODE_ENV === "production" ? base : baseSepolia;

// Hardcoded contract addresses
export const contractAddress =
  process.env.NODE_ENV === "production"
    ? "0x44784EbfCF0868a60AB807D92854c55417d3e03a" // Production contract
    : "0x20eA0C9BD6588a76f72aB149AC03B176B6bD4D47"; // Testnet contract

console.log("Using chain:", chain.name);
console.log("Using contract:", contractAddress);

// Create public client
export const publicClient = createPublicClient({
  chain,
  transport: http(),
}) as PublicClient;

// Create Zora client
export const zoraClient = createCreatorClient({
  chainId: chain.id,
  publicClient,
});

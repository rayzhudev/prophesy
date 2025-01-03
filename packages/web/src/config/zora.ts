import { createCreatorClient } from "@zoralabs/protocol-sdk";
import { activeChain, publicClient } from "./chains";
import { PublicClient } from "viem";

// Hardcoded contract addresses
export const prophesy1155ContractAddress =
  process.env.NODE_ENV === "production"
    ? "0x44784EbfCF0868a60AB807D92854c55417d3e03a" // Production contract
    : "0x20eA0C9BD6588a76f72aB149AC03B176B6bD4D47"; // Testnet contract

// Create Zora client factory
export function createZora() {
  return createCreatorClient({
    chainId: activeChain.id,
    publicClient: publicClient as PublicClient,
  });
}

const config = {
  prophesy1155ContractAddress,
  createZora,
};

export default config;

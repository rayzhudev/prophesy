import { usePrivy } from "@privy-io/react-auth";
import { useMemo, useState, useCallback } from "react";
import Web3 from "web3";
import type { Address } from "viem";

// Interface for our wallet provider
export interface WalletProvider {
  web3: Web3 | null;
  address: Address | null;
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
}

// Hook for admin wallet (Web3)
export function useAdminWallet(): WalletProvider {
  const [address, setAddress] = useState<Address | null>(null);
  const [web3, setWeb3] = useState<Web3 | null>(null);

  const connect = useCallback(async () => {
    if (typeof window.ethereum === "undefined") {
      throw new Error("Please install MetaMask or another Web3 wallet");
    }

    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      // Create Web3 instance
      const web3Instance = new Web3(window.ethereum);
      setWeb3(web3Instance);
      setAddress(accounts[0] as Address);
    } catch (error) {
      console.error("Error connecting wallet:", error);
      throw error;
    }
  }, []);

  const disconnect = useCallback(async () => {
    setWeb3(null);
    setAddress(null);
  }, []);

  return {
    web3,
    address,
    isConnected: !!address,
    connect,
    disconnect,
  };
}

// Hook for regular user wallet (Privy smart wallet)
export function useUserWallet(): WalletProvider {
  const { user, ready, login, logout } = usePrivy();

  // Get the smart wallet address
  const address = useMemo(() => {
    if (!ready || !user?.wallet?.address) return null;
    return user.wallet.address as Address;
  }, [ready, user?.wallet?.address]);

  const connect = async () => {
    await login();
  };

  const disconnect = async () => {
    await logout();
  };

  return {
    web3: null, // Privy handles the wallet internally
    address,
    isConnected: !!address,
    connect,
    disconnect,
  };
}

// Hook that provides the appropriate wallet based on context
export function useWallet(isAdmin: boolean = false): WalletProvider {
  const adminWallet = useAdminWallet();
  const userWallet = useUserWallet();

  return isAdmin ? adminWallet : userWallet;
}

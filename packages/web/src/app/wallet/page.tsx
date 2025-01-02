"use client";

import { useEffect, useState } from "react";
import { usePrivy, useFundWallet } from "@privy-io/react-auth";
import Navigation from "../../components/Navigation";
import { formatEther, createPublicClient, http } from "viem";
import { activeChain, chainName } from "@/config/chains";

export default function Wallet() {
  const { ready, authenticated, user } = usePrivy();
  const { fundWallet } = useFundWallet();
  const [balance, setBalance] = useState<string>();
  const [walletAddress, setWalletAddress] = useState<`0x${string}`>();

  useEffect(() => {
    if (!user?.wallet?.address) return;
    setWalletAddress(user.wallet.address as `0x${string}`);
  }, [user?.wallet?.address]);

  useEffect(() => {
    if (!walletAddress) return;

    const client = createPublicClient({
      chain: activeChain,
      transport: http(),
    });

    const getBalance = async () => {
      const balance = await client.getBalance({ address: walletAddress });
      setBalance(formatEther(balance));
    };

    getBalance();
    const interval = setInterval(getBalance, 10000);
    return () => clearInterval(interval);
  }, [walletAddress]);

  const handleFundWallet = async () => {
    if (!walletAddress) return;
    await fundWallet(walletAddress, { chain: activeChain });
  };

  if (!walletAddress) {
    return (
      <div className="flex min-h-screen">
        <Navigation />
        <main className="flex-1 p-8">
          <div className="max-w-xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Wallet not connected</h1>
            <p className="text-gray-600">
              Please connect your wallet to continue.
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Navigation />
      <main className="flex-1 p-8 lg:p-8 pb-24 lg:pb-8">
        <div className="max-w-xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">My Wallet</h1>

          <div className="bg-white rounded-lg border border-amber-500/20 p-6 space-y-4">
            <div>
              <h2 className="text-sm font-medium text-gray-500 mb-1">
                Smart Wallet Address
              </h2>
              <div className="font-mono text-gray-900 break-all bg-gray-50 p-3 rounded">
                {walletAddress}
              </div>
            </div>

            <div>
              <h2 className="text-sm font-medium text-gray-500 mb-1">
                Balance
              </h2>
              <div className="text-2xl font-bold text-gray-900">
                {balance ? `${balance} ETH` : "Loading..."}
              </div>
              <div className="text-sm text-gray-500 mt-1">on {chainName}</div>
            </div>

            <div className="pt-4">
              <button
                onClick={handleFundWallet}
                className="w-full bg-amber-500 text-white px-6 py-3 rounded-full font-bold hover:bg-amber-600 transition shadow-lg shadow-amber-600/20 flex items-center justify-center"
              >
                Add Funds
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

import { useWallet } from "@/config/wallet";
import { Button } from "./ui/button";

export function ConnectWalletButton() {
  const { address, isConnected, connect, disconnect } = useWallet(true);

  return (
    <Button
      onClick={isConnected ? disconnect : connect}
      variant={isConnected ? "outline" : "default"}
    >
      {isConnected
        ? `Connected: ${address?.slice(0, 6)}...${address?.slice(-4)}`
        : "Connect Wallet"}
    </Button>
  );
}

"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { trpc, getClient } from "@/utils/trpc";
import { PrivyProvider } from "@privy-io/react-auth";
import {SmartWalletsProvider} from '@privy-io/react-auth/smart-wallets';


export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() => getClient());

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <PrivyProvider
          appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
          clientId={process.env.NEXT_PUBLIC_PRIVY_CLIENT_ID!}
          config={{
            appearance: {
              theme: "light",
              accentColor: "#676FFF",
              logo: "https://prophesy.fun/sparks.svg",
            },
            embeddedWallets: {
              createOnLogin: "users-without-wallets",
            },
          }}
        >
          <SmartWalletsProvider>
            {children}
          </SmartWalletsProvider>
        </PrivyProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
}

import { createTRPCReact, httpBatchLink } from "@trpc/react-query";
import type { AppRouter } from "../../../backend/trpc";
import { getApiUrl } from "@/config/api";

export const trpc = createTRPCReact<AppRouter>();

export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: getApiUrl("/trpc"),
      headers() {
        return {
          "Content-Type": "application/json",
        };
      },
    }),
  ],
});

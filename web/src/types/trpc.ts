import { initTRPC } from "@trpc/server";
import { z } from "zod";

// Initialize tRPC
const t = initTRPC.create();

// Define input schemas
const textInputSchema = z.object({
  text: z.string().min(1),
});

// Create router type
export const appRouter = t.router({
  hello: t.procedure.query(() => {
    return { message: "Hello from tRPC!" };
  }),
  spaceText: t.procedure.input(textInputSchema).mutation(({ input }) => {
    const spacedText = input.text.split("").join(" ");
    return { success: true, text: spacedText };
  }),
});

// Export type router type signature
export type AppRouter = typeof appRouter;

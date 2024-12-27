import { initTRPC } from "@trpc/server";
import { z } from "zod";

const t = initTRPC.create();

export const router = t.router;
export const publicProcedure = t.procedure;

// Define input schemas
const textInputSchema = z.object({
  text: z.string().min(1),
});

// Create the root router
export const appRouter = router({
  hello: publicProcedure.query(() => {
    return { message: "Hello from tRPC!" };
  }),

  spaceText: publicProcedure.input(textInputSchema).mutation(({ input }) => {
    const spacedText = input.text.split("").join(" ");
    console.log("Received text:", input.text);
    console.log("Spaced text:", spacedText);
    return { success: true, text: spacedText };
  }),
});

// Export type router type signature
export type AppRouter = typeof appRouter;

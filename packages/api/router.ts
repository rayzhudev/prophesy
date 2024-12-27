import { initTRPC } from "@trpc/server";
import { z } from "zod";

// Input schemas
export const textInputSchema = z.object({
  text: z.string().min(1),
});

// Output types
export interface HelloOutput {
  message: string;
}

export interface SpaceTextOutput {
  success: boolean;
  text: string;
}

// Initialize tRPC
const t = initTRPC.create();

// Create router type
export const router = t.router({
  hello: t.procedure.query(() => {
    return { message: "Hello from tRPC!" } as HelloOutput;
  }),
  spaceText: t.procedure.input(textInputSchema).mutation(({ input }) => {
    const spacedText = input.text.split("").join(" ");
    return { success: true, text: spacedText } as SpaceTextOutput;
  }),
});

// Export type router type signature
export type AppRouter = typeof router;

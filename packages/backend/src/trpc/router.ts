import { t } from "./init.js";
import { publicProcedures } from "./procedures/public.js";
import { protectedProcedures } from "./procedures/protected.js";

export const appRouter = t.router({
  ...publicProcedures,
  ...protectedProcedures,
});

export type AppRouter = typeof appRouter;

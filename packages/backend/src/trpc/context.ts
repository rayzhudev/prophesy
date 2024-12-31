import { inferAsyncReturnType } from "@trpc/server";
import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { prisma } from "../../lib/prisma.js";

export interface Context {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  prisma: typeof prisma;
  auth?: {
    userId: string;
  };
}

export const createContext = async ({
  req,
  res,
}: CreateExpressContextOptions): Promise<Context> => {
  return {
    req,
    res,
    prisma,
  };
};

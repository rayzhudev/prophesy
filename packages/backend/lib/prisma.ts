import { PrismaClient } from "@prisma/client";

// Ensure we're in a Node.js-like environment
if (
  typeof global === "undefined" ||
  !global.process ||
  !global.process.version
) {
  throw new Error("This module must be run in a Node.js environment");
}

// Create a singleton instance
const prismaClientSingleton = () => {
  return new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
    errorFormat: "pretty",
  });
};

// Use type declaration to ensure proper typing
declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

// Initialize the client
const prisma = globalThis.prisma ?? prismaClientSingleton();

// Save the instance in development for hot reload
if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}

export { prisma };

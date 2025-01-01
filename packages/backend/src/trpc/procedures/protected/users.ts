import { TRPCError } from "@trpc/server";
import { Prisma } from "@prisma/client";
import { createUserSchema } from "@prophesy/api/";
import { protectedProcedure } from "../../middleware.js";

export const userProcedures = {
  createUser: protectedProcedure
    .input(createUserSchema)
    .mutation(async ({ ctx, input }) => {
      // Verify that the user is creating their own account
      if (input.id !== ctx.auth?.userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only create an account for yourself",
        });
      }

      try {
        // Create or update user and related data in a transaction
        return await ctx.prisma.$transaction(async (tx) => {
          // Check if user exists
          const existingUser = await tx.user.findUnique({
            where: { id: input.id },
            include: {
              twitter: true,
              wallets: true,
            },
          });

          // Create or update user
          const user = existingUser
            ? await tx.user.update({
                where: { id: input.id },
                data: { authType: input.authType },
              })
            : await tx.user.create({
                data: {
                  id: input.id,
                  authType: input.authType,
                },
              });

          // Handle Twitter account
          if (input.twitter) {
            if (existingUser?.twitter) {
              await tx.twitterAccount.update({
                where: { userId: user.id },
                data: {
                  username: input.twitter.username,
                  name: input.twitter.name,
                  profilePictureUrl: input.twitter.profilePictureUrl,
                  ...(input.twitter.latestVerifiedAt && {
                    latestVerifiedAt: input.twitter.latestVerifiedAt,
                  }),
                },
              });
            } else {
              await tx.twitterAccount.create({
                data: {
                  userId: user.id,
                  twitterId: input.twitter.subject,
                  username: input.twitter.username,
                  name: input.twitter.name,
                  profilePictureUrl: input.twitter.profilePictureUrl,
                  ...(input.twitter.firstVerifiedAt && {
                    firstVerifiedAt: input.twitter.firstVerifiedAt,
                  }),
                  ...(input.twitter.latestVerifiedAt && {
                    latestVerifiedAt: input.twitter.latestVerifiedAt,
                  }),
                },
              });
            }
          }

          // Handle wallets
          if (input.wallets?.length > 0) {
            for (const wallet of input.wallets) {
              // Check if wallet exists in database
              const existingWallet = await tx.wallet.findUnique({
                where: { address: wallet.address },
              });

              if (existingWallet) {
                // Update existing wallet
                await tx.wallet.update({
                  where: { id: existingWallet.id },
                  data: {
                    walletType: wallet.walletType,
                    walletClientType: wallet.walletClientType,
                  },
                });
              } else {
                // Create new wallet
                await tx.wallet.create({
                  data: {
                    userId: user.id,
                    address: wallet.address,
                    walletType: wallet.walletType,
                    walletClientType: wallet.walletClientType,
                  },
                });
              }
            }
          }

          // Return complete user
          return tx.user.findUniqueOrThrow({
            where: { id: user.id },
            include: {
              twitter: true,
              wallets: true,
            },
          });
        });
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === "P2002") {
            throw new TRPCError({
              code: "CONFLICT",
              message: "User already exists with this ID or credentials",
            });
          }
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create user",
          cause: error,
        });
      }
    }),

  getUsers: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.user.findMany({
      include: {
        twitter: true,
        wallets: true,
      },
    });
  }),
};

import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";

import { prisma } from "./prisma";

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma as PrismaClient),
  providers: [Google],
  pages: {
    signIn: "/sign-in",
  },
});

export const getCurrentUser = async () => {
  const session = await auth();
  return session?.user;
};

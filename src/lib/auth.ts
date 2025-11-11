// src/lib/auth.ts
import { NextAuthOptions, DefaultSession, Account } from "next-auth";
import { JWT } from "next-auth/jwt";
import GitHubProvider from "next-auth/providers/github";

interface ExtendedJWT extends JWT {
  accessToken?: string;
}

interface ExtendedSession extends DefaultSession {
  accessToken?: string;
}

export const authOptions: NextAuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
      authorization: { params: { scope: "read:user repo" } },
    }),
  ],
  callbacks: {
    async jwt({ token, account }: { token: ExtendedJWT; account: Account | null }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }: { session: ExtendedSession; token: ExtendedJWT }) {
      session.accessToken = token.accessToken;
      return session;
    },
  },
};

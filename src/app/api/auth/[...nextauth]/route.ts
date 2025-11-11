import NextAuth, { NextAuthOptions, DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";
import GitHubProvider from "next-auth/providers/github";

// 1. Define custom types that extend the default ones
// This tells TypeScript that our JWT and Session objects can have an `accessToken`
interface ExtendedJWT extends JWT {
  accessToken?: string;
}

interface ExtendedSession extends DefaultSession {
  accessToken?: string;
}

// 2. Build the authOptions configuration using our new types
export const authOptions: NextAuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
      authorization: { params: { scope: "read:user repo" } },
    }),
  ],
  callbacks: {
    // 3. Use the ExtendedJWT type for the token parameter
    async jwt({ token, account }: { token: ExtendedJWT; account: any }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    // 4. Use the ExtendedSession and ExtendedJWT types here
    async session({ session, token }: { session: ExtendedSession; token: ExtendedJWT }) {
      session.accessToken = token.accessToken;
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
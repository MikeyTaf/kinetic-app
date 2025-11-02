// Import the tools we need from the 'next-auth' library
import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";

// This is the main configuration object, our "instruction manual" for the bouncer
export const authOptions = {
  // 1. providers: Tell the bouncer which login methods to offer
  providers: [
    GitHub({
      // These are the secret keys you put in your .env.local file
      // They prove to GitHub that our app is legitimate
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
      
      // When we ask the user to log in, we also ask for specific permissions
      authorization: { params: { scope: "read:user repo" } }, // We want to read user profile info and get a list of their repos
    }),
  ],

  // 2. callbacks: Special functions that run after a successful login
  callbacks: {
    // This function runs when the user's "pass" (JSON Web Token) is created
    async jwt({ token, account }: any) {
      // If the login was successful, the 'account' object will contain the access token
      if (account) {
        // We are saving the access token from GitHub onto our own secure token
        token.accessToken = account.access_token;
      }
      return token;
    },

    // This function runs to create the user's session (their "logged-in status")
    async session({ session, token }: any) {
      // We take the access token we saved in the jwt and add it to the session
      // This makes it available to the rest of our app
      session.accessToken = token.accessToken;
      return session;
    },
  },
};

// 3. Start the Bouncer: Create the NextAuth handler with our instructions
const handler = NextAuth(authOptions);

// 4. Export the handler for Next.js to use
export { handler as GET, handler as POST };
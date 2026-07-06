import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import type { NextAuthConfig } from 'next-auth';

// ── NextAuth configuration ────────────────────────────────────────────────────

export const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          // Request offline access so Google issues a refresh token
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    }),
  ],

  pages: {
    signIn: '/login',
    error: '/login',
  },

  session: {
    strategy: 'jwt',
  },

  callbacks: {
    /**
     * Called after Google sign-in succeeds.
     * Exchanges the Google id_token for Tally JWTs from the FastAPI backend.
     */
    async jwt({ token, account }) {
      // On initial sign-in, account contains the Google id_token
      if (account?.id_token) {
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';
          const response = await fetch(`${apiUrl}/api/v1/auth/google`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_token: account.id_token }),
          });

          if (response.ok) {
            const tokens = (await response.json()) as {
              access_token: string;
              refresh_token: string;
              expires_in: number;
            };
            token.accessToken = tokens.access_token;
            token.refreshToken = tokens.refresh_token;
            token.expiresAt = Date.now() + tokens.expires_in * 1000;
          }
        } catch (error) {
          // Log but don't throw — session will still exist without backend tokens
          console.error('[auth] Failed to exchange Google token with API:', error);
        }
      }

      // Refresh access token when expired
      if (
        token.refreshToken &&
        token.expiresAt &&
        Date.now() > token.expiresAt - 60_000
      ) {
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';
          const response = await fetch(`${apiUrl}/api/v1/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh_token: token.refreshToken }),
          });
          if (response.ok) {
            const tokens = (await response.json()) as {
              access_token: string;
              refresh_token: string;
              expires_in: number;
            };
            token.accessToken = tokens.access_token;
            token.refreshToken = tokens.refresh_token;
            token.expiresAt = Date.now() + tokens.expires_in * 1000;
          }
        } catch (error) {
          console.error('[auth] Failed to refresh token:', error);
        }
      }

      return token;
    },

    /**
     * Expose the Tally access token to client components via useSession().
     */
    async session({ session, token }) {
      session.accessToken = token.accessToken as string | undefined;
      return session;
    },

    /**
     * Redirect to /dashboard after successful sign-in.
     */
    async redirect({ url, baseUrl }) {
      if (url.startsWith(baseUrl)) return url;
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      return `${baseUrl}/dashboard`;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);

import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import type { NextAuthConfig } from 'next-auth';

// ── NextAuth configuration ────────────────────────────────────────────────────

export const authConfig: NextAuthConfig = {
  providers: [
    Credentials({
      id: 'credentials',
      name: 'Email',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';
        const response = await fetch(`${apiUrl}/api/v1/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: credentials.email,
            password: credentials.password,
          }),
        });

        if (!response.ok) {
          return null;
        }

        const tokens = (await response.json()) as {
          access_token: string;
          refresh_token: string;
          expires_in: number;
        };

        const userId = decodeJwtSub(tokens.access_token);
        if (!userId) {
          return null;
        }

        return {
          id: userId,
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          expiresAt: Date.now() + tokens.expires_in * 1000,
        };
      },
    }),
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
     * Exchanges the Google id_token for Tally JWTs from the Spring Boot backend.
     */
    async jwt({ token, account, user }) {
      if (user && 'accessToken' in user && user.accessToken) {
        token.accessToken = user.accessToken as string;
        token.refreshToken = user.refreshToken as string;
        token.expiresAt = user.expiresAt as number;
      }

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
      const expiresAt = token.expiresAt;
      if (
        token.refreshToken &&
        typeof expiresAt === 'number' &&
        Date.now() > expiresAt - 60_000
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

function decodeJwtSub(accessToken: string): string | null {
  try {
    const payload = JSON.parse(
      Buffer.from(accessToken.split('.')[1] ?? '', 'base64url').toString('utf8'),
    ) as { sub?: string };
    return payload.sub ?? null;
  } catch {
    return null;
  }
}

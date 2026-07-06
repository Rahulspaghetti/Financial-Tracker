import { handlers } from '@/lib/auth';

// Re-export Next.js route handlers from the NextAuth config.
// This file MUST be exactly this — NextAuth's App Router integration
// expects named GET and POST exports from the catch-all route.
export const { GET, POST } = handlers;

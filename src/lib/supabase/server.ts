import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Creates a Supabase server client with auth context from cookies.
 * Uses cache: 'no-store' to prevent Next.js Data Cache from serving
 * stale Supabase query results across navigations.
 */
export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options as never)
            );
          } catch {
            // Server Component — cookie setting ignored
          }
        },
      },
      global: {
        fetch: (url: string | URL | Request, init?: RequestInit) => {
          return fetch(url, { ...init, cache: "no-store" });
        },
      },
    }
  );
}

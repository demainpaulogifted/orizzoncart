import { createClient } from '@supabase/supabase-js';

// This uses the Service Role Key, which bypasses Row Level Security (RLS).
// It should ONLY be used in Server Components or API Routes, NEVER in the browser.
export const createAdminClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
};

// Also export it as createClient so imports like `import { createClient as createAdminClient }` work perfectly
export { createAdminClient as createClient };
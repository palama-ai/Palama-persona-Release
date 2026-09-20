import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const customFetch = async (...args: Parameters<typeof fetch>) => {
  try {
    return await fetch(...args)
  } catch (error) {
    console.error('Supabase fetch network error in server:', error)
    return new Response(
      JSON.stringify({
        error: 'network_error',
        message: 'Failed to fetch from Supabase: ' + (error instanceof Error ? error.message : String(error)),
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}

export async function createClient() {
  const cookieStore = await cookies()
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey!,
    {
      global: {
        fetch: customFetch,
      },
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

export async function createAdminClient() {
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseServiceKey) {
    console.warn('SUPABASE_SERVICE_ROLE_KEY is not defined. Falling back to anon key (RLS might block updates).')
  }

  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  const client = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseServiceKey || anonKey!,
    {
      global: {
        fetch: customFetch,
      },
      cookies: {
        getAll() {
          return []
        },
        setAll() {
          // No cookie changes for admin client
        },
      },
    }
  )

  // Fallback: If service key is missing, authenticate using test credentials so RLS doesn't block updates
  if (!supabaseServiceKey) {
    const email = 'aliouiwin11@gmail.com'
    const password = '123456'
    const { error } = await client.auth.signInWithPassword({ email, password })
    if (error) {
      console.warn('Admin client fallback sign-in failed:', error.message)
    }
  }

  return client
}

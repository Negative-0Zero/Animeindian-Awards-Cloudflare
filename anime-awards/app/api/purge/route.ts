import { NextResponse } from 'next/server';
import { supabaseServer } from '@/utils/supabase/server';

export async function POST(request: Request) {
  try {
    // 1. Verify the user is authenticated and is an admin
    const supabase = await supabaseServer();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 2. Get URLs from request body
    const { urls } = await request.json();
    if (!Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json({ error: 'Invalid URLs' }, { status: 400 });
    }

    // 3. Call worker purge endpoint with secret (server-side)
    const workerUrl = process.env.WORKER_URL; // e.g., https://your-worker.workers.dev
    const purgeSecret = process.env.PURGE_SECRET; // not public!

    const response = await fetch(`${workerUrl}/purge`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${purgeSecret}`,
      },
      body: JSON.stringify({ urls }),
    });

    if (!response.ok) {
      const text = await response.text();
      return NextResponse.json({ error: text }, { status: response.status });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Purge API error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

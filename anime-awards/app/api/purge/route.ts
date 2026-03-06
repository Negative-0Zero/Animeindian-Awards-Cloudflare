import { NextResponse } from 'next/server';
import { supabaseServer } from '@/utils/supabase/server';

export async function POST(request: Request) {
  try {
    // Verify authentication and admin status
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

    // Parse request body
    const { urls } = await request.json();
    if (!Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json({ error: 'Invalid URLs' }, { status: 400 });
    }

    // Call worker purge endpoint
    const workerUrl = process.env.WORKER_URL;
    const purgeSecret = process.env.PURGE_SECRET;

    const response = await fetch(`${workerUrl}/purge`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${purgeSecret}`,
      },
      body: JSON.stringify({ urls }),
    });

    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = { error: await response.text() };
    }

    if (!response.ok) {
      return NextResponse.json({ error: data.error || 'Purge failed' }, { status: response.status });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Purge API error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

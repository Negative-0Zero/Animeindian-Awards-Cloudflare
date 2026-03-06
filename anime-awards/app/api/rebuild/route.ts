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

    // Call Cloudflare Pages rebuild webhook
    const webhookUrl = 'https://api.cloudflare.com/client/v4/pages/webhooks/deploy_hooks/61bea573-fe05-49ed-89c5-512fc8fb7a60';
    
    const response = await fetch(webhookUrl, { method: 'POST' });

    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = { error: await response.text() };
    }

    if (!response.ok) {
      return NextResponse.json({ error: data.error || 'Rebuild failed' }, { status: response.status });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error('Rebuild API error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

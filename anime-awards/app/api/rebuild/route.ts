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

    // 2. Call Cloudflare Pages rebuild webhook
    const webhookUrl = 'https://api.cloudflare.com/client/v4/pages/webhooks/deploy_hooks/61bea573-fe05-49ed-89c5-512fc8fb7a60';
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
    });

    if (!response.ok) {
      const text = await response.text();
      return NextResponse.json({ error: text }, { status: response.status });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Rebuild API error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

/**
 * WebAuthn 登录选项生成
 */

function generateRandomId(length: number = 32): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

interface LoginOptionsRequest {
  email: string;
}

serve(async (req: Request) => {
  // CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    if (req.method !== 'POST') {
      throw new Error('Method not allowed');
    }

    const { email } = await req.json() as LoginOptionsRequest;

    if (!email) {
      throw new Error('Email is required');
    }

    // 初始化 Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 查找用户
    const { data: userData, error: userError } = await supabase
      .from('auth.users')
      .select('id')
      .eq('email', email)
      .single();

    if (userError) {
      // 为了安全,不透露用户是否存在
      throw new Error('Invalid credentials');
    }

    const userId = userData.id;

    // 获取用户的所有 Passkey
    const { data: passkeys, error: passkeysError } = await supabase
      .from('user_passkeys')
      .select('credential_id')
      .eq('user_id', userId);

    if (passkeysError || !passkeys || passkeys.length === 0) {
      throw new Error('No passkeys registered for this user');
    }

    // 生成 challenge
    const challenge = generateRandomId(32);

    // 存储 challenge
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
    const { error: insertError } = await supabase
      .from('webauthn_challenges')
      .insert({
        user_id: userId,
        challenge,
        type: 'authentication',
        expires_at: expiresAt,
      });

    if (insertError) {
      throw new Error('Failed to generate login options');
    }

    // 构造登录选项
    const options = {
      challenge,
      allowCredentials: passkeys.map(pk => ({
        id: pk.credential_id,
        type: 'public-key',
      })),
      timeout: 60000,
      userVerification: 'required',
      rpId: new URL(req.url).hostname,
    };

    return new Response(JSON.stringify(options), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Error:', error);
    
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Internal server error',
      }),
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
});

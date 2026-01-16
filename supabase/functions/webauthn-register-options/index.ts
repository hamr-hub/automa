import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

/**
 * WebAuthn 注册选项生成
 * 
 * 此 Edge Function 生成 WebAuthn 注册所需的 challenge 和选项
 */

// 简单的随机 ID 生成 (Base64URL)
function generateRandomId(length: number = 32): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

interface RegisterOptionsRequest {
  email: string;
  userId: string;
}

serve(async (req: Request) => {
  // CORS 处理
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
    // 验证请求方法
    if (req.method !== 'POST') {
      throw new Error('Method not allowed');
    }

    // 解析请求体
    const { email, userId } = await req.json() as RegisterOptionsRequest;

    if (!email || !userId) {
      throw new Error('Email and userId are required');
    }

    // 初始化 Supabase 客户端
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 验证用户身份
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authorization header is required');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user || user.id !== userId) {
      throw new Error('Unauthorized');
    }

    // 生成 challenge (32 字节随机数)
    const challenge = generateRandomId(32);

    // 存储 challenge 到数据库 (有效期 5 分钟)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
    const { error: insertError } = await supabase
      .from('webauthn_challenges')
      .insert({
        user_id: userId,
        challenge,
        type: 'registration',
        expires_at: expiresAt,
      });

    if (insertError) {
      console.error('Failed to store challenge:', insertError);
      throw new Error('Failed to generate registration options');
    }

    // 获取应用域名
    const origin = new URL(req.url).origin;
    const rpId = new URL(origin).hostname;

    // 构造 WebAuthn 注册选项
    const options = {
      challenge,
      rp: {
        name: 'Automa',
        id: rpId,
      },
      user: {
        id: btoa(userId), // Base64 编码的用户 ID
        name: email,
        displayName: email.split('@')[0],
      },
      pubKeyCredParams: [
        { type: 'public-key', alg: -7 },  // ES256
        { type: 'public-key', alg: -257 }, // RS256
      ],
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        userVerification: 'required',
        residentKey: 'preferred',
      },
      timeout: 60000,
      attestation: 'none',
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
        status: error instanceof Error && error.message === 'Unauthorized' ? 401 : 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
});

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { create, verify } from 'https://deno.land/x/djwt@v2.8/mod.ts';

/**
 * WebAuthn 注册验证
 * 
 * 验证客户端返回的 WebAuthn 凭证并存储
 */

interface RegisterVerifyRequest {
  credential: {
    id: string;
    rawId: string;
    response: {
      attestationObject: string;
      clientDataJSON: string;
    };
    type: string;
  };
  userId: string;
}

// 简化的 CBOR 解析 (仅用于演示,生产环境应使用专业库)
function parseAttestationObject(attestationObjectBase64: string): any {
  // 注意: 这是简化版本,生产环境应使用 @github/webauthn-json 或类似库
  // 这里只提取基本信息
  const buffer = Uint8Array.from(atob(attestationObjectBase64), c => c.charCodeAt(0));
  // 实际解析需要 CBOR 解码器
  return {
    authData: buffer, // 简化处理
  };
}

function parseClientDataJSON(clientDataBase64: string): any {
  const json = atob(clientDataBase64);
  return JSON.parse(json);
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
    if (req.method !== 'POST') {
      throw new Error('Method not allowed');
    }

    const { credential, userId } = await req.json() as RegisterVerifyRequest;

    if (!credential || !userId) {
      throw new Error('Credential and userId are required');
    }

    // 初始化 Supabase
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

    // 解析客户端数据
    const clientData = parseClientDataJSON(credential.response.clientDataJSON);
    
    // 验证 challenge
    const { data: challengeData, error: challengeError } = await supabase
      .from('webauthn_challenges')
      .select('*')
      .eq('user_id', userId)
      .eq('challenge', clientData.challenge)
      .eq('type', 'registration')
      .gt('expires_at', new Date().toISOString())
      .single();

    if (challengeError || !challengeData) {
      throw new Error('Invalid or expired challenge');
    }

    // 验证 origin
    const expectedOrigin = new URL(req.url).origin;
    if (clientData.origin !== expectedOrigin) {
      throw new Error('Origin mismatch');
    }

    // 解析认证器数据 (简化版)
    const attestationObject = parseAttestationObject(credential.response.attestationObject);
    
    // 提取公钥和其他信息
    // 注意: 这里需要完整的 CBOR 和 WebAuthn 解析逻辑
    // 生产环境应使用 @simplewebauthn/server 或类似库
    
    // 存储 Passkey
    const { data: passkeyData, error: insertError } = await supabase
      .from('user_passkeys')
      .insert({
        user_id: userId,
        credential_id: credential.id,
        public_key: credential.response.attestationObject, // 简化处理
        counter: 0,
        device_type: 'platform',
        device_name: `Passkey ${new Date().toLocaleDateString()}`,
        transports: ['internal'],
      })
      .select()
      .single();

    if (insertError) {
      console.error('Failed to store passkey:', insertError);
      throw new Error('Failed to register passkey');
    }

    // 删除已使用的 challenge
    await supabase
      .from('webauthn_challenges')
      .delete()
      .eq('id', challengeData.id);

    return new Response(
      JSON.stringify({
        success: true,
        passkeyId: passkeyData.id,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
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

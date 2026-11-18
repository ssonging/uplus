import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/** 환경 변수가 없으면 null. 호출한 쪽은 예시 값으로 돌아가거나 저장 실패로 처리한다. */
function supabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  return url && key ? { url, key } : null;
}

/**
 * 요청마다 새로 만드는 서버용 Supabase 클라이언트(세션은 쿠키).
 * Server Component에서는 쿠키를 쓸 수 없으므로 setAll이 실패해도 무시한다(갱신은 src/proxy.ts가 맡는다).
 * Server Action에서는 쿠키가 응답에 실린다.
 */
export async function createClient() {
  const env = supabaseEnv();
  if (!env) return null;
  const cookieStore = await cookies();
  return createServerClient(env.url, env.key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) cookieStore.set(name, value, options);
        } catch {
          // Server Component 렌더 중에는 쿠키를 쓸 수 없다.
        }
      },
    },
  });
}

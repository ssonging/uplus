import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// 저장된 신청을 읽는 완료 화면(?app=...)에서만 세션 쿠키를 갱신한다.
// 기본 상태(쿼리 없는 화면)에는 걸리지 않는다. 저장은 Server Action 안에서 세션을 직접 확인한다.
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return response;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        for (const { name, value } of cookiesToSet) request.cookies.set(name, value);
        response = NextResponse.next({ request: { headers: request.headers } });
        for (const { name, value, options } of cookiesToSet) response.cookies.set(name, value, options);
        for (const [k, v] of Object.entries(headers)) response.headers.set(k, v);
      },
    },
  });

  try {
    await supabase.auth.getClaims();
  } catch {
    // 갱신 실패 시 그대로 진행한다. 완료 화면은 예시 값으로 돌아간다.
  }
  return response;
}

export const config = {
  matcher: [{ source: "/plans/:id/complete", has: [{ type: "query", key: "app" }] }],
};

// middleware.ts
console.log("🔥 미들웨어 테스트: 미들웨어가 호출되었습니다!");
import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';


export const config = {
  // 모든 페이지와 API 요청이 미들웨어를 거치게 함
    matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};

export async function proxy(request: NextRequest) {
    console.log("미들웨어 실행 중! 요청 경로:", request.nextUrl.pathname);
    let response = NextResponse.next({ request: { headers: request.headers } });
    
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return request.cookies.getAll(); },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        request.cookies.set(name, value); // 요청 쪽에도 심어주고
                        response.cookies.set(name, value, options); // 응답 쪽에도 심어줌
                    });
                },
            },
        }
    );
    // 여기서 세션을 명시적으로 가져와서 검증
    const { data } = await supabase.auth.getUser();
    console.log("미들웨어에서 검증한 유저 ID:", data.user?.id);

    await supabase.auth.getUser();

    return response;
}
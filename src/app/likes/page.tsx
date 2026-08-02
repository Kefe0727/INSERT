import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import LikedBookList from "@/components/LikedBookList";

export const dynamic = 'force-dynamic';

export default async function LikedBooksPage() {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        );
                    } catch {}
                },
            },
        }
    );

    // 1. 로그인 유저 확인
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return <div className="p-8 text-center">로그인이 필요한 페이지입니다.</div>;
    }

    // 2. 현재 유저가 좋아요한 book_id 조회
    const { data: likedEntries } = await supabase
        .from("likes")
        .select("book_id")
        .eq("user_id", user.id);

    const bookIds = likedEntries?.map(item => Number(item.book_id)).filter(Boolean) || [];

    if (bookIds.length === 0) {
        return <LikedBookList initialBooks={[]} />;
    }

    // 3. 좋아요한 도서 정보 및 전체 좋아요 수(likes count) 함께 조회
    const { data: books } = await supabase
        .from("books")
        .select(`*, likes:likes(count)`)
        .in("id", bookIds);

    // 4. 데이터 가공 (likes_count 추가)
    const formattedBooks = (books || []).map((book: any) => ({
        ...book,
        likes_count: parseInt(book.likes?.[0]?.count || 0, 10)
    }));

    return <LikedBookList initialBooks={formattedBooks} />;
}
import { createClient } from "@/utils/supabase/server"; // client 대신 server를 임포트해야 합니다!
import CommentList from "@/components/CommentList";

import { cookies } from "next/headers";

export default async function CommentListContainer({ bookId }: { bookId: number }) {
    const cookieStore = await cookies(); // 여기서 다시 한번 쿠키를 가져와서
    const supabase = await createClient(); // 클라이언트에 주입
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
        console.log("getUser()에서 유저를 못 찾음, 다시 시도...");
    }

    
    // 2. DB에서 댓글 데이터 조회
    const { data: comments, error } = await supabase
        .from("comments")
        .select(`
            *,
            profiles:user_uuid (
                nickname,
                avatar_url
            )
        `)
        .eq("book_id", bookId)
        .order("created_at", { ascending: false });

    if (error) return <p>댓글을 불러오지 못했습니다.</p>;

    // 3. 클라이언트 컴포넌트로 데이터 전달
    return (
        <CommentList 
            initialComments={comments || []} 
            currentUserId={user?.id} 
            bookId={bookId} // 이 부분을 추가해야 해!
        />
    );
}
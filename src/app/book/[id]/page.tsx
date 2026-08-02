export const dynamic = 'force-dynamic';
import { supabase } from "@/lib/supabase";
import { createClient } from "@/utils/supabase/client";
import { parseSummary } from "@/utils/textParser";
import StarRating from "@/components/StarRating";
import LikeButton from "@/components/LikeButton";
import ClickableCover from "@/components/ClickableCover";
import CommentForm from "@/components/CommentForm"; 
import CommentListContainer from "@/components/CommentListContainer"; // 컨테이너 불러오기

export default async function BookDetailPage({ params }: { params: { id: string } }) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    
    const { id } = await params;
  // 도서 정보 가져오기
    const { data: book } = await supabase
        .from("books")
        .select("*")
        .eq("id", id)
        .single();

    if (!book) return <div>망가 정보를 찾을 수 없습니다.</div>;

    const bookId = book.id;

    const summaryHtml = parseSummary(book.summary);
    

    return (
        <main className="max-w-4xl mx-auto p-8 grid md:grid-cols-2 gap-8">
            {/* 왼쪽: 표지 이미지 및 상태 */}
            <div className="flex flex-col gap-4">
                <ClickableCover bookId={book.id} url={book.H_url}>
                    <div className="relative block w-full aspect-[7/10] overflow-hidden rounded-lg shadow-lg">
                        <div 
                            className="absolute inset-0 bg-cover bg-center blur-lg scale-110 opacity-70"
                            style={{ backgroundImage: `url(${book.cover_url})` }}
                        />
                        <img 
                            src={book.cover_url} 
                            alt={book.title} 
                            className="absolute inset-0 w-full h-full object-contain p-1" 
                        />
                    </div>
                </ClickableCover>
                <div className="flex justify-between items-center text-sm text-gray-500">
                    <div className="flex gap-4 items-center">
                        <LikeButton bookId={book.id} initialLikes={book.likes_count || 0} />
                        <span>👁 {book.views || 0}</span>
                    </div>

                    <span>{new Date(book.created_at).toLocaleDateString('ko-KR')}</span>
                </div>
            </div>

        {/* 오른쪽: 상세 정보 */}
            <div className="flex flex-col gap-6">
                <div className="flex flex-col">
                    <h1 className="text-3xl font-bold">{book.title}</h1>
                    <p className="text-xl text-gray-400">{book.author}</p>
                </div>
                <div>
                    <div className="flex gap-2 flex-wrap">
                        {book.tags?.map((tag: string) => (
                            <span key={tag} className="px-2 py-1 bg-gray-100 rounded text-gray-700">{tag}</span>
                        ))}
                    </div>
                </div>
                <div>
                    <StarRating score={book.stars || 0} />
                    <p className="text-lg text-gray-600 dark:text-gray-300 italic font-bold">
                        {book.review ? `"${book.review}"` : "등록된 한줄평이 없습니다."}
                    </p>
                </div>

                <div>
                    <div 
                        className="leading-relaxed text-gray-600 dark:text-gray-400" 
                        dangerouslySetInnerHTML={{ __html: summaryHtml }} 
                    />
                </div>
            </div>

            <section className="flex flex-col gap-4 md:col-span-2">
                <h2 className="text-xl font-bold mb-6">댓글</h2>
                <div className="flex flex-col gap-4">
                    {/* 컨테이너 사용 */}
                    <CommentListContainer bookId={bookId} />
                </div>
            </section>
        </main>
    );
}
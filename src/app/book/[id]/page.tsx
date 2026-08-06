export const dynamic = 'force-dynamic';
import { supabase } from "@/lib/supabase";
import { createClient } from "@/utils/supabase/client";
import { parseSummary } from "@/utils/textParser";
import StarRating from "@/components/StarRating";
import LikeButton from "@/components/LikeButton";
import ClickableCover from "@/components/ClickableCover";
import CommentForm from "@/components/CommentForm"; 
import CommentListContainer from "@/components/CommentListContainer";
import Link from "next/link";
import Image from "next/image";

export default async function BookDetailPage({ params }: { params: { id: string } }) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    
    const { id } = await params;

    // 1. 현재 도서 정보 가져오기
    const { data: book } = await supabase
        .from("books")
        .select("*")
        .eq("id", id)
        .single();

    if (!book) return <div>망가 정보를 찾을 수 없습니다.</div>;

    const bookId = book.id;
    const summaryHtml = parseSummary(book.summary);

    // 2. 시리즈 도서 목록 가져오기 (series_order 1차 정렬, created_at 2차 정렬)
    let seriesBooks: any[] = [];
    if (book.series_title) {
        const { data } = await supabase
            .from("books")
            .select("id, title, cover_url, created_at, series_order")
            .eq("series_title", book.series_title)
            .order("series_order", { ascending: true, nullsFirst: false })
            .order("created_at", { ascending: true });
        
        seriesBooks = data || [];
    }

    return (
        <main className="max-w-4xl mx-auto p-8 grid md:grid-cols-2 gap-8">
            {/* 왼쪽: 표지 이미지 및 상태 */}
            <div className="flex flex-col gap-4">
                <ClickableCover bookId={book.id} url={book.H_url}>
                    <div className="relative block w-full aspect-[7/10] overflow-hidden rounded-lg shadow-lg">
                        <div 
                            className="absolute inset-0 bg-cover bg-center blur-lg scale-110 opacity-70"
                            style={{ backgroundImage: `url(${book.cover_url || "https://img1.yna.co.kr/photo/old/data2/orign_img/2002/02/06/2020206_0130_P4.jpg"})` }}
                        />
                        <img 
                            src={book.cover_url || "https://img1.yna.co.kr/photo/old/data2/orign_img/2002/02/06/2020206_0130_P4.jpg"}
                            alt={book.title} 
                            className="absolute inset-0 w-full h-full object-contain p-1 relative z-10" 
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
                    {/* 🆔 작가명 바로 아래에 도서 ID 표시 */}
                    <p className="text-xs text-gray-400 font-mono mt-1">품번: {book.id}</p>
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

            {/* 📚 시리즈 목록 섹션 (댓글창 바로 위) */}
            {seriesBooks.length > 1 && (
                <section className="md:col-span-2 flex flex-col gap-3 pt-6 border-t">
                    <h2 className="text-xl font-bold">시리즈 작품 ({seriesBooks.length})</h2>
                    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
                        {seriesBooks.map((item) => {
                            const isCurrent = item.id === book.id;
                            return (
                                <Link 
                                    key={item.id} 
                                    href={`/book/${item.id}`}
                                    className={`flex-shrink-0 w-28 md:w-36 flex flex-col gap-2 p-2 rounded-lg transition-all ${
                                        isCurrent 
                                            ? "border-2 border-blue-500 bg-blue-50/50 dark:bg-blue-950/30" 
                                            : "border hover:border-gray-400 bg-white dark:bg-gray-800"
                                    }`}
                                >
                                    <div className="relative w-full aspect-[7/10] overflow-hidden rounded bg-gray-100">
                                        <Image
                                            src={item.cover_url || "https://img1.yna.co.kr/photo/old/data2/orign_img/2002/02/06/2020206_0130_P4.jpg"}
                                            alt={item.title}
                                            fill
                                            unoptimized
                                            sizes="150px"
                                            className="object-cover"
                                        />
                                        {isCurrent && (
                                            <span className="absolute top-1 left-1 bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded font-bold">
                                                현재 읽는 중
                                            </span>
                                        )}
                                    </div>
                                    <p className={`text-xs font-medium line-clamp-2 ${isCurrent ? "text-blue-600 font-bold" : "text-gray-700 dark:text-gray-200"}`}>
                                        {item.title}
                                    </p>
                                </Link>
                            );
                        })}
                    </div>
                </section>
            )}

            {/* 댓글 섹션 */}
            <section className="flex flex-col gap-4 md:col-span-2 border-t pt-6">
                <h2 className="text-xl font-bold mb-6">댓글</h2>
                <div className="flex flex-col gap-4">
                    <CommentListContainer bookId={bookId} />
                </div>
            </section>
        </main>
    );
}
"use client";
import { useState, useRef } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";


export default function CommentForm({ bookId, activeReplyId, replyContent, onCancel }: { 
    bookId: number; 
    activeReplyId: number | null; 
    replyContent: string | null;
    onCancel: () => void;
}) {
    
    const router = useRouter();
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!, 
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const [content, setContent] = useState("");
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;

        const { data: { user } } = await supabase.auth.getUser();

        //activeReplyId가 있으면 대댓글, 없으면 일반 댓글로 자동 삽입
        await supabase.from("comments").insert({
            book_id: bookId,
            user_uuid: user?.id,
            content: content,
            parent_id: activeReplyId, // 부모 댓글 ID 전달
        });

        setContent("");
        onCancel(); // 답글 모드 종료 (입력창 초기화)
        router.refresh();
    };

    const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setContent(e.target.value);
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = "auto";
            textarea.style.height = `${textarea.scrollHeight}px`;
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mt-4 w-full flex flex-col gap-2"> {/* flex-col로 변경[cite: 12] */}
            {activeReplyId && replyContent && (
                <div className="bg-blue-50 p-2 text-sm text-blue-600 rounded">
                    <strong>"{replyContent}"</strong>에 답글을 작성 중입니다.
                    <button type="button" onClick={onCancel} className="underline ml-2">취소</button>
                </div>
            )}
            <div className="flex gap-2 items-end">
                <textarea 
                    ref={textareaRef}
                    value={content}
                    onChange={handleInput}
                    className="border p-2 flex-grow rounded resize-none overflow-hidden min-h-[66px] max-h-[150px]" 
                    placeholder="댓글을 남겨주세요..."
                />
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded h-[66px] shrink-0">
                    등록
                </button>
            </div>
        </form>
    );
}



{/*<span className="font-semibold">
            "{replyContent.replace(/<[^>]*>?/gm, '').substring(0, 20)}..."
        </span>
        에 답글 작성 중 
        <button 
            type="button" 
            onClick={onCancel} 
            className="underline ml-2 text-gray-500"
        >
            취소
        </button>*/}
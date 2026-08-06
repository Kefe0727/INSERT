"use client";
import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import { parseSummary } from "@/utils/textParser";
import CommentForm from "@/components/CommentForm"; 

export default function CommentList({ initialComments, currentUserId, bookId }: { initialComments: any[], currentUserId?: string,bookId: number }) {
    console.log("브라우저에서 확인하는 유저:", currentUserId); // 이제 여기서 찍혀!
    const router = useRouter();
    const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

    const [activeReplyId, setActiveReplyId] = useState<number | null>(null);
    const [replyContent, setReplyContent] = useState("");

    const [expandedReplies, setExpandedReplies] = useState<{ [key: number]: boolean }>({});

    const toggleReplies = (parentId: number) => {
        setExpandedReplies(prev => ({
            ...prev,
            [parentId]: !prev[parentId]
        }));
    };

    const handleReply = (commentId: number, content: string) => {
        setActiveReplyId(commentId);
        
        // HTML 태그를 제거하고 텍스트만 추출 (가장 간단한 방법)
        const textOnly = content.replace(/<[^>]*>?/gm, ''); 
        setReplyContent(textOnly.substring(0, 20) + (textOnly.length > 20 ? "..." : ""));
    };


    const handleDelete = async (id: number) => {
        if (!confirm("정말 삭제하시겠습니까?")) return;
        
        const { data, error } = await supabase.from("comments").delete().eq("id", id);
        
        if (error) {
            // 객체 전체를 로그에 찍어 상세 정보를 확인
            console.error("삭제 실패 상세 정보:", JSON.stringify(error, null, 2));
            alert(`삭제에 실패했습니다: ${error.message || "권한이 없거나 정책 위반입니다."}`);
        } else {
            window.location.reload();
        }
    };

    const summaryHTML = (content: string) => parseSummary(content);
    console.log("현재 로그인한 유저 ID:", currentUserId);

    const parentComments = initialComments.filter(c => !c.parent_id);

    const renderCommentHeader = (comment: any) => {
        // Supabase join 방식에 따라 profile 객체 혹은 profiles 테이블명으로 들어올 수 있음 (예: comment.profiles)
        const profile = comment.profiles || {}; 
        const nickname = profile.nickname || "흔적없는 과객";
        const avatarUrl = profile.avatar_url || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTVLB5CniWc2HqriZBha0sfqq3if90V29wY1uj2XaE10z40TOrqdC4_hYKi&s=10"; // 기본 프사 경로가 있다면 설정

        return (
            <div className="flex items-center gap-2 mb-1">
                <img 
                    src={avatarUrl} 
                    alt={nickname} 
                    className="w-6 h-6 rounded-full object-cover border" 
                />
                <span className="font-bold text-sm text-gray-800 dark:text-gray-200">
                    {nickname}
                </span>
            </div>
        );
    };

    return (
        <div className="mt-6 w-full">
            <CommentForm 
                bookId={bookId} 
                activeReplyId={activeReplyId} 
                replyContent={replyContent}
                onCancel={() => { setActiveReplyId(null); setReplyContent(""); }}
            />
            {parentComments.map((parent) => {
                const childComments = initialComments
                    .filter(child => child.parent_id === parent.id)
                    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
                
                const isExpanded = expandedReplies[parent.id] || false;

                return (
                    <div key={parent.id} className="mb-4">
                        {/* 부모 댓글 */}
                        <div onClick={() => handleReply(parent.id, parent.content)} className="p-2 border-b cursor-pointer">
                            {renderCommentHeader(parent)}
                            <div 
                                className="break-words mt-1"
                                dangerouslySetInnerHTML={{ __html: summaryHTML(parent.content) }} 
                            />
                            
                            <div className="flex justify-between items-center mt-2">
                                {/* 대댓글 접기/펴기 버튼 */}
                                {childComments.length > 0 && (
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); toggleReplies(parent.id); }}
                                        className="text-s text-blue-500 hover:underline"
                                    >
                                        {isExpanded ? `▲ 대댓글 접기 (${childComments.length})` : `▼ 대댓글 보기 (${childComments.length})`}
                                    </button>
                                )}
                                
                                {currentUserId === parent.user_uuid && (
                                    <button onClick={(e) => { e.stopPropagation(); handleDelete(parent.id); }} className="text-red-500 text-s ml-auto">삭제</button>
                                )}
                            </div>
                        </div>

                        {/* 대댓글 렌더링 (isExpanded가 true일 때만 노출) */}
                        {isExpanded && childComments.map(child => (
                            <div key={child.id} className="ml-10 border-l-2 pl-4 mt-2 bg-gray-50 dark:bg-gray-800 p-2">
                                {renderCommentHeader(child)}
                                <div className="break-words mt-1" dangerouslySetInnerHTML={{ __html: summaryHTML(child.content) }} />
                                {currentUserId === child.user_uuid && (
                                    <div className="flex justify-end">
                                        <button onClick={(e) => { e.stopPropagation(); handleDelete(child.id); }} className="text-red-500 text-s mr-2">삭제</button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                );
            })}
        </div>
    );
}
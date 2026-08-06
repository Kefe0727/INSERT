"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { expandedTags } from "@/constants/tags";
import { useRouter } from "next/navigation";

export default function AdminRequestsPage() {
    const supabase = createClient();
    const router = useRouter();
    const [isAdmin, setIsAdmin] = useState(false);
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    // 각 카드별 태그 펼침 상태 관리 (요청 ID 배열)
    const [expandedCardIds, setExpandedCardIds] = useState<number[]>([]);

    const toggleExpand = (id: number) => {
        setExpandedCardIds(prev =>
            prev.includes(id) ? prev.filter(cardId => cardId !== id) : [...prev, id]
        );
    };

    const fetchRequests = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("book_requests")
            .select("*")
            .eq("status", "pending")
            .order("created_at", { ascending: false });

        if (!error && data) setRequests(data);
        setLoading(false);
    };

    useEffect(() => {
        const checkAdmin = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            
            if (!user) {
                alert("로그인이 필요합니다.");
                router.push("/login");
                return;
            }

            const { data: profile } = await supabase
                .from("profiles")
                .select("is_admin")
                .eq("id", user.id)
                .single();

            if (!profile?.is_admin) {
                alert("관리자만 접근할 수 있는 페이지입니다.");
                router.push("/");
                return;
            }

            setIsAdmin(true);
            fetchRequests();
        };

        checkAdmin();
    }, []);

    const handleFieldChange = (id: number, field: string, value: any) => {
        setRequests(prev =>
            prev.map(req => (req.id === id ? { ...req, [field]: value } : req))
        );
    };

    const handleTagToggle = (reqId: number, tag: string) => {
        setRequests(prev =>
            prev.map(req => {
                if (req.id !== reqId) return req;
                const currentTags = req.tags || [];
                const updatedTags = currentTags.includes(tag)
                    ? currentTags.filter((t: string) => t !== tag)
                    : [...currentTags, tag];
                return { ...req, tags: updatedTags };
            })
        );
    };

    const handleApprove = async (req: any) => {
        if (!req.book_id || !req.title) {
            alert("품번과 제목은 필수입니다.");
            return;
        }

        const bookPayload = {
            id: parseInt(req.book_id, 10),
            title: req.title,
            author: req.author,
            tags: req.tags,
            stars: parseInt(req.stars || 5, 10),
            review: req.review,
            summary: req.summary,
            script: req.script,
            cover_url: req.cover_url,
            H_url: req.H_url,
            created_at: req.created_at,
            series_title: req.series_title,
        };

        // 1. books 테이블에 저장
        const { error: insertError } = await supabase.from("books").insert([bookPayload]);

        if (insertError) {
            alert("DB 저장 오류: " + insertError.message);
            return;
        }

        // 2. book_requests 테이블에서 해당 요청 삭제
        const { error: deleteError } = await supabase.from("book_requests").delete().eq("id", req.id);

        if (deleteError) {
            alert("요청 삭제 중 오류 발생: " + deleteError.message);
            return;
        }

        alert(`'${req.title}' 등록 완료 및 요청 삭제 처리!`);
        fetchRequests();
    };

    // 거절 처리 (필요시 거절할 때도 바로 지우도록 설정 가능)
    const handleReject = async (id: number) => {
        if (!confirm("이 요청을 거절하고 삭제하시겠습니까?")) return;
        await supabase.from("book_requests").delete().eq("id", id);
        fetchRequests();
    };

    if (loading) return <div className="p-8 text-center">권한 확인 및 데이터 로딩 중...</div>;

    return (
        <main className="max-w-4xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">작품 추가 요청 검토 (관리자)</h1>

            {requests.length === 0 ? (
                <p className="text-gray-500">대기 중인 요청이 없습니다.</p>
            ) : (
                <div className="flex flex-col gap-8">
                    {requests.map((req) => {
                        const isExpanded = expandedCardIds.includes(req.id);

                        return (
                            <div key={req.id} className="border p-5 rounded-lg bg-white shadow-sm flex flex-col gap-3">
                                <div className="flex justify-between items-center bg-gray-100 p-2 rounded">
                                    <span className="text-xs text-gray-500">요청 ID: {req.user_id  || "흔적없는 과객"} | 작성일: {new Date(req.created_at).toLocaleString()}</span>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleApprove(req)}
                                            className="bg-green-600 text-white px-3 py-1 text-xs rounded hover:bg-green-700 font-bold"
                                        >
                                            ✓ 수정 내용으로 승인 & DB 저장
                                        </button>
                                        <button
                                            onClick={() => handleReject(req.id)}
                                            className="bg-red-500 text-white px-3 py-1 text-xs rounded hover:bg-red-600"
                                        >
                                            ✕ 거절
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs font-bold text-gray-600">품번</label>
                                        <input
                                            type="number"
                                            value={req.book_id || ""}
                                            onChange={(e) => handleFieldChange(req.id, "book_id", e.target.value)}
                                            className="w-full border p-1 rounded text-sm bg-yellow-50"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-600">별점 (stars)</label>
                                        <input
                                            type="number"
                                            value={req.stars || 5}
                                            onChange={(e) => handleFieldChange(req.id, "stars", e.target.value)}
                                            className="w-full border p-1 rounded text-sm"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-600">제목</label>
                                    <input
                                        type="text"
                                        value={req.title || ""}
                                        onChange={(e) => handleFieldChange(req.id, "title", e.target.value)}
                                        className="w-full border p-1 rounded text-sm"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs font-bold text-gray-600">작가</label>
                                        <input
                                            type="text"
                                            value={req.author || ""}
                                            onChange={(e) => handleFieldChange(req.id, "author", e.target.value)}
                                            className="w-full border p-1 rounded text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-600">시리즈명</label>
                                        <input
                                            type="text"
                                            value={req.series_title || ""}
                                            onChange={(e) => handleFieldChange(req.id, "series_title", e.target.value)}
                                            className="w-full border p-1 rounded text-sm"
                                        />
                                    </div>
                                </div>

                                {/* 태그 편집 영역 */}
                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <label className="text-xs font-bold text-gray-600">태그</label>
                                        <button
                                            type="button"
                                            onClick={() => toggleExpand(req.id)}
                                            className="text-xs text-blue-600 underline font-medium"
                                        >
                                            {isExpanded ? "▲ 유저 선택 태그만 보기" : "▼ 전체 태그 펼치기"}
                                        </button>
                                    </div>

                                    <div className="flex flex-col gap-2 border p-2 rounded bg-gray-50 max-h-48 overflow-y-auto">
                                        {isExpanded ? (
                                            // 펼쳤을 때: expandedTags의 모든 태그 표시
                                            Object.entries(expandedTags).map(([category, tags]) => (
                                                <div key={category}>
                                                    <div className="text-[10px] font-bold text-gray-400 my-0.5">{category}</div>
                                                    <div className="flex flex-wrap gap-1">
                                                        {tags.map((tag) => (
                                                            <button
                                                                key={tag}
                                                                type="button"
                                                                onClick={() => handleTagToggle(req.id, tag)}
                                                                className={`px-2 py-0.5 text-xs rounded border ${
                                                                    req.tags?.includes(tag) ? "bg-blue-500 text-white font-bold" : "bg-white text-gray-600"
                                                                }`}
                                                            >
                                                                {tag}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            // 기본 상태: 유저가 선택해둔 태그만 표시
                                            <div className="flex flex-wrap gap-1">
                                                {req.tags && req.tags.length > 0 ? (
                                                    req.tags.map((tag: string) => (
                                                        <button
                                                            key={tag}
                                                            type="button"
                                                            onClick={() => handleTagToggle(req.id, tag)}
                                                            className="px-2 py-0.5 text-xs rounded border bg-blue-500 text-white font-bold"
                                                        >
                                                            {tag} ✕
                                                        </button>
                                                    ))
                                                ) : (
                                                    <span className="text-xs text-gray-400">선택된 태그가 없습니다.</span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs font-bold text-gray-600">표지 URL</label>
                                        <input
                                            type="text"
                                            value={req.cover_url || ""}
                                            onChange={(e) => handleFieldChange(req.id, "cover_url", e.target.value)}
                                            className="w-full border p-1 rounded text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-600">H_url</label>
                                        <input
                                            type="text"
                                            value={req.H_url || ""}
                                            onChange={(e) => handleFieldChange(req.id, "H_url", e.target.value)}
                                            className="w-full border p-1 rounded text-sm"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-600">줄거리</label>
                                    <textarea
                                        value={req.summary || ""}
                                        onChange={(e) => handleFieldChange(req.id, "summary", e.target.value)}
                                        rows={2}
                                        className="w-full border p-1 rounded text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-600">대사</label>
                                    <textarea
                                        value={req.script || ""}
                                        onChange={(e) => handleFieldChange(req.id, "script", e.target.value)}
                                        rows={2}
                                        className="w-full border p-1 rounded text-sm"
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </main>
    );
}
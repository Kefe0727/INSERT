"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

export default function LikeButton({ bookId, initialLikes }: { bookId: number, initialLikes: number }) {
  // initialLikes가 undefined일 경우 0으로 강제합니다.
  const [likes, setLikes] = useState(Number(initialLikes) || 0);
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const checkStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      // 1. 좋아요 여부 확인
      if (user) {
        const { data } = await supabase
          .from("likes")
          .select("id")
          .eq("book_id", bookId)
          .eq("user_id", user.id)
          .maybeSingle();
        
        if (data) setIsLiked(true);
      }

      // 2. 실제 DB의 정확한 카운트값 다시 가져오기 (숫자 불일치 해결)
      const { count } = await supabase
        .from("likes")
        .select("*", { count: 'exact', head: true })
        .eq("book_id", bookId);
        
      setLikes(count || 0);
      setLoading(false);
    };

    checkStatus();
  }, [bookId]);

  const toggleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (loading) return; // 로딩 중에는 클릭 방지

    const previousIsLiked = isLiked;
    const previousLikes = likes;

    // 낙관적 업데이트
    setIsLiked(!previousIsLiked);
    setLikes(!previousIsLiked ? likes + 1 : likes - 1);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert("로그인이 필요한 기능입니다.");
      setIsLiked(previousIsLiked);
      setLikes(previousLikes);
      return;
    }

    // 서버 요청
    if (!previousIsLiked) {
      const { error } = await supabase.from("likes").insert({ book_id: bookId, user_id: user.id });
      if (error) { setIsLiked(previousIsLiked); setLikes(previousLikes); }
    } else {
      const { error } = await supabase.from("likes").delete().eq("book_id", bookId).eq("user_id", user.id);
      if (error) { setIsLiked(previousIsLiked); setLikes(previousLikes); }
    }
  };

  return (
    <button 
        onClick={toggleLike} 
        className={`border px-1.5 py-0.5 rounded transition-colors duration-100 ${isLiked ? "bg-red-50 text-red-500 border-red-200" : "text-gray-500 hover:bg-gray-50"}`}
    >
      ♥ {likes}
    </button>
  );
}
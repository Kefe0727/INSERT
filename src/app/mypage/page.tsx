// src/app/mypage/page.tsx (서버 컴포넌트)
import { createClient } from "@/utils/supabase/server";// 서버 헬퍼 사용
import { redirect } from "next/navigation";
import ProfileClient from "./ProfileClient"; // 아래에서 만들 클라이언트 컴포넌트

export default async function MyPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

    // 데이터를 받아서 클라이언트 컴포넌트로 넘겨줍니다.
    return <ProfileClient user={user} profile={profile} />;
}
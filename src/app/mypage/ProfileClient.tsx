// src/app/mypage/ProfileClient.tsx
"use client";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import ProfileEdit from "@/components/ProfileEdit";

export default function ProfileClient({ user, profile }: { user: any, profile: any }) {
    const router = useRouter();
    const supabase = createClient();

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        window.location.href = "/";
    };

    return (
        <main className="max-w-xl mx-auto mt-10 p-4">
            <h1 className="text-2xl font-bold mb-6">마이페이지</h1>
            <ProfileEdit user={user} initialProfile={profile} />
            <div className="mt-8 pt-6 border-t">
                <button onClick={handleSignOut} className="text-red-500 text-sm hover:underline">
                    로그아웃 하기
                </button>
            </div>
        </main>
    );
}
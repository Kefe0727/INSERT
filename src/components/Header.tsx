"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Header() {
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        const getUserData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUser(user);
                const { data } = await supabase
                    .from("profiles")
                    .select("nickname, avatar_url")
                    .eq("id", user.id)
                    .single();
                setProfile(data);
            }
        };
        getUserData();
    }, []);

    return (
        <header className="relative flex justify-between items-center p-4 border-b">
            {/* 좌측 로고 */}
            <h1 className="font-bold text-xl cursor-pointer z-10" onClick={() => router.push("/")}>
                INSERT™
            </h1>
            
            {/* 중앙 배치: ❤️머꼴한 망가 (화면 중앙 고정) */}
            <div className="absolute left-1/2 -translate-x-1/2">
                <Link href="/likes" className="text-lg font-bold text-blue-600 hover:underline">
                    ❤️머꼴한 망가
                </Link>
            </div>

            {/* 우측 영역: 📖 도움말 + 프로필/로그인 */}
            <div className="flex gap-4 items-center z-10">
                <Link href="/guide" className="text-sm text-gray-600 dark:text-gray-300 hover:underline mr-5">
                    📖 도움말
                </Link>

                {user ? (
                    <div 
                        onClick={() => router.push("/mypage")} 
                        className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded-lg transition"
                    >
                        <img 
                            src={profile?.avatar_url || "/default-avatar.png"} 
                            className="w-8 h-8 rounded-full bg-gray-200"
                            alt="프로필"
                        />
                        <span className="text-sm font-medium">{profile?.nickname || "사용자"}</span>
                    </div>
                ) : (
                    <button onClick={() => router.push("/login")} className="text-sm bg-blue-500 text-white px-3 py-1 rounded">
                        로그인
                    </button>
                )}
            </div>
        </header>
    );
}
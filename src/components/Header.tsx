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
                    .select("nickname, avatar_url, is_admin") // 👈 is_admin 조회 추가
                    .eq("id", user.id)
                    .single();
                setProfile(data);
            }
        };
        getUserData();
    }, []);

    

    return (
        <header className="relative flex justify-between items-center px-3 py-3 sm:p-4 border-b">
            {/* 좌측 로고 (모바일에서는 폰트 크기 축소) */}
            <h1 
                className="font-bold text-base sm:text-xl cursor-pointer z-10 shrink-0" 
                onClick={() => router.push("/")}
            >
                INSERT™
            </h1>
            
            {/* 중앙 배치: ❤️머꼴한 망가 (모바일에서는 글자 크기를 줄여 겹침 방지) */}
            <div className="absolute left-1/2 -translate-x-1/2 z-0">
                <Link 
                    href="/likes" 
                    className="text-xs sm:text-lg font-bold text-blue-600 hover:underline whitespace-nowrap"
                >
                    ❤️머꼴한 망가
                </Link>
            </div>

            {/* 우측 영역: 📖 도움말 + 프로필/로그인 */}
            <div className="flex gap-1.5 sm:gap-4 items-center z-10 shrink-0">
                {profile?.is_admin && (
                    <Link 
                        href="/admin/requests" 
                        className="text-xs sm:text-sm text-purple-600 font-bold hover:underline mr-1 sm:mr-2 whitespace-nowrap"
                    >
                        👑 검토
                    </Link>
                )}
                <Link 
                    href="/request" 
                    className="text-xs sm:text-sm text-blue-600 font-semibold hover:underline mr-1 sm:mr-2 whitespace-nowrap"
                >
                    ➕ 요청
                </Link>
                <Link 
                    href="/guide" 
                    className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 hover:underline mr-1 sm:mr-3 whitespace-nowrap"
                >
                    📖 도움말
                </Link>

                {user ? (
                    <div 
                        onClick={() => router.push("/mypage")} 
                        className="flex items-center gap-1.5 sm:gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-1 rounded-lg transition"
                    >
                        <img 
                            src={profile?.avatar_url || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTVLB5CniWc2HqriZBha0sfqq3if90V29wY1uj2XaE10z40TOrqdC4_hYKi&s=10"} 
                            className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gray-200 object-cover"
                            alt="프로필"
                        />
                        {/* 모바일에서는 닉네임을 숨겨 공간 확보 (태블릿/데스크톱에서만 노출) */}
                        <span className="hidden sm:inline text-sm font-medium max-w-[100px] truncate">
                            {profile?.nickname || "이름없는 협객"}
                        </span>
                    </div>
                ) : (
                    <button 
                        onClick={() => router.push("/login")} 
                        className="text-xs sm:text-sm bg-blue-500 text-white px-2.5 py-1 sm:px-3 sm:py-1 rounded whitespace-nowrap"
                    >
                        로그인
                    </button>
                )}
            </div>
        </header>
    );
}
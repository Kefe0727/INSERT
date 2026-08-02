"use client";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";

export default function ClickableCover({ bookId, url, children }: { bookId: number, url: string, children: React.ReactNode }) {
    const router = useRouter();

    // 환경 변수 검증 (없으면 여기서 에러가 나서 바로 알 수 있음)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        console.error("Supabase 환경 변수가 설정되지 않았습니다!");
    }

    const supabase = createBrowserClient(supabaseUrl!, supabaseKey!);

    const handleClick = async () => {
        // 1. 여기서 환경 변수를 직접 불러옴
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

        // 2. 직접 클라이언트 생성
        const supabase = createBrowserClient(supabaseUrl, supabaseKey);

            // 3. 호출
        const { error } = await supabase.rpc("increment_view", { row_id: bookId });
            
        if (error) console.error("에러:", error);
        else window.open(url, "_blank");
    };

    return (
        <div onClick={handleClick} className="cursor-pointer hover:opacity-90 transition">
            {children}
        </div>
    );
}
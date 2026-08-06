"use client";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation"; // 추가

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const supabase = createClient();
    const router = useRouter(); // 추가

    const handleSignUp = async () => {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) alert(error.message);
        else alert("확인 이메일을 확인하세요!");
    };

    const handleSignIn = async () => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
            alert(error.message);
        } else {
            window.location.href = "/";
        }
    };
    

    return (
        <div className="flex flex-col gap-4 max-w-sm mx-auto mt-20">
            <h1 className="text-2xl font-bold">로그인 / 회원가입</h1>
            <input type="email" placeholder="이메일" onChange={(e) => setEmail(e.target.value)} className="border p-2" />
            <input type="password" placeholder="비밀번호" onChange={(e) => setPassword(e.target.value)} className="border p-2" />
            <button onClick={handleSignIn} className="bg-blue-500 text-white p-2">로그인</button>
            <button onClick={handleSignUp} className="bg-gray-200 p-2">회원가입</button>
        </div>
    );
}

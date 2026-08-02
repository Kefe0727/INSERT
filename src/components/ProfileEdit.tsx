"use client";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function ProfileEdit({ user, initialProfile }: { user: any, initialProfile: any }) {
    const [nickname, setNickname] = useState(initialProfile?.nickname || "");
    const [avatarUrl, setAvatarUrl] = useState(initialProfile?.avatar_url || "");
    const [uploading, setUploading] = useState(false); // 업로드 상태 추가
    const supabase = createClient();
    const router = useRouter();

    // 1. 파일 업로드 로직 추가
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            alert("2MB 이하의 이미지만 업로드 가능합니다.");
            return;
        }

        try {
            setUploading(true);
            const fileExt = file.name.split('.').pop();
            const filePath = `avatars/${user.id}-${Date.now()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from("profiles")
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage.from("profiles").getPublicUrl(filePath);
            setAvatarUrl(data.publicUrl); // 업로드된 URL로 상태 업데이트
            alert("사진이 업로드되었습니다!");
        } catch (error) {
            alert("업로드 실패");
        } finally {
            setUploading(false);
        }
    };

    // 2. 기존 저장 로직 (닉네임 + 업데이트된 avatarUrl 저장)
    const updateProfile = async () => {
        const { error } = await supabase
            .from("profiles")
            .update({ nickname, avatar_url: avatarUrl })
            .eq("id", user.id);

        if (error) alert("수정 실패: " + error.message);
        else {
            alert("프로필이 수정되었습니다!");
            router.refresh();
            window.location.reload();
            const timer = setTimeout(() => {
                router.push("/");
            }, 1750);
            
        }
    };

    return (
        <div className="p-4 border rounded shadow-sm">
            <h2 className="font-bold mb-4">프로필 수정</h2>
            
            {/* 닉네임 입력 */}
            <input 
                value={nickname} 
                onChange={(e) => setNickname(e.target.value)}
                placeholder="닉네임"
                className="block w-full p-2 border mb-4"
            />

            {/* 이미지 미리보기 및 파일 선택 */}
            <div className="mb-4">
                <img src={avatarUrl || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTVLB5CniWc2HqriZBha0sfqq3if90V29wY1uj2XaE10z40TOrqdC4_hYKi&s=10"} alt="Profile" className="w-20 h-20 rounded-full mb-2 object-cover" />
                
                <label className="block w-full p-2 border text-center cursor-pointer hover:bg-gray-50 text-sm">
                    {/* 여기서 "사진 선택하기" 부분을 원하는 텍스트로 바꾸세요 */}
                    {uploading ? "업로드 중..." : "프로필 사진 변경하기"}
                    <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileChange} 
                        disabled={uploading}
                        className="hidden" // 실제 input은 숨깁니다
                    />
                </label>
            </div>
                <button onClick={updateProfile} className="bg-blue-500 text-white px-4 py-2 rounded">
                    저장하기
                </button>
        </div>
    );
}
"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { criticalTags, expandedTags } from "@/constants/tags";

export default function BookRequestPage() {
    const supabase = createClient();
    const router = useRouter();

    const [formData, setFormData] = useState({
        book_id: "",
        title: "",
        author: "",
        stars: "5",
        review: "",
        summary: "",
        script: "",
        cover_url: "",
        H_url: "",
        created_at: new Date().toISOString().slice(0, 16),
        series_title: "",
    });

    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [isExpanded, setIsExpanded] = useState(false);

    const handleTagToggle = (tag: string) => {
        if (selectedTags.includes(tag)) {
            setSelectedTags(selectedTags.filter((t) => t !== tag));
        } else {
            setSelectedTags([...selectedTags, tag]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const inputBookId = formData.book_id ? parseInt(formData.book_id, 10) : null;

        if (!inputBookId) {
            alert("올바른 품번(숫자)을 입력해 주세요.");
            return;
        }

        // 1. books 테이블 중복 검사 (이미 등록된 작품)
        const { data: existingBook } = await supabase
            .from("books")
            .select("id")
            .eq("id", inputBookId)
            .maybeSingle();

        if (existingBook) {
            alert(`품번 ${inputBookId}번은 이미 서재에 등록되어 있는 작품입니다!`);
            return;
        }

        const { data: { user } } = await supabase.auth.getUser();

        const payload = {
            book_id: inputBookId,
            title: formData.title,
            author: formData.author,
            tags: selectedTags,
            stars: parseInt(formData.stars, 10),
            review: formData.review,
            summary: formData.summary,
            script: formData.script,
            cover_url: formData.cover_url,
            H_url: formData.H_url,
            series_title: formData.series_title,
            status: "pending",
            user_id: user?.id || null,
        };

        // books가 아닌 book_requests 테이블에 저장
        const { error } = await supabase.from("book_requests").insert([payload]);

        if (error) {
            alert("요청 전송 실패: " + error.message);
        } else {
            alert("관리자에게 도서 등록 요청이 전송되었습니다! 검토 후 반영됩니다.");
            router.push("/");
        }
    };

    const renderTagButton = (tag: string) => (
        <button
            type="button"
            key={tag}
            onClick={() => handleTagToggle(tag)}
            className={`px-3 py-1 text-sm border rounded-full transition-colors ${
                selectedTags.includes(tag) ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
        >
            {tag}
        </button>
    );

    return (
        <main className="max-w-2xl mx-auto p-6 bg-white my-8 rounded-lg border shadow-sm">
            <h1 className="text-2xl font-bold mb-6">작품 추가 요청하기</h1>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">품번 (필수)</label>
                        <input
                            type="number"
                            name="book_id"
                            value={formData.book_id}
                            onChange={handleChange}
                            required
                            className="w-full p-2 border rounded"
                            placeholder="0000000"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">별점</label>
                        <input
                            type="number"
                            name="stars"
                            min="1"
                            max="10"
                            value={formData.stars}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                            placeholder="1~10"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">제목 (필수)</label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        className="w-full p-2 border rounded"
                        placeholder="히토미에 게시된 제목 그대로 복붙해주는 게 베스틉니다"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">작가</label>
                        <input
                            type="text"
                            name="author"
                            value={formData.author}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                            placeholder="모르겠음 비워 놔요 내가 찾을게"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">시리즈명</label>
                        <input
                            type="text"
                            name="series_title"
                            value={formData.series_title}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                            placeholder="모르겠음 비워 놔요 내가 찾을게"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">태그 선택</label>
                    <div className="flex flex-col gap-3 p-3 border rounded-lg bg-gray-50">
                        {isExpanded ? (
                            Object.entries(expandedTags).map(([category, tags]) => (
                                <div key={category}>
                                    <h3 className="font-bold text-xs text-gray-400 mb-1">{category}</h3>
                                    <div className="flex flex-wrap gap-1.5">
                                        {tags.map((tag) => renderTagButton(tag ?? ""))}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-wrap gap-1.5">
                                {criticalTags.map((tag) => renderTagButton(tag))}
                            </div>
                        )}

                        <button
                            type="button"
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="text-xs text-blue-600 underline mt-1 self-start"
                        >
                            {isExpanded ? "▲ 접기" : "▼ 전체 태그 보기"}
                        </button>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">표지 이미지 주소</label>
                    <input
                        type="text"
                        name="cover_url"
                        value={formData.cover_url}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                        placeholder="히토미에서 표지 이미지 주소 복붙하시면 됩니당"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">히토미 링크 (필수)</label>
                    <input
                        type="text"
                        name="H_url"
                        value={formData.H_url}
                        onChange={handleChange}
                        required
                        className="w-full p-2 border rounded"
                        placeholder="https://hitomi.la/reader/0000000.html"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">줄거리 (INSERT™ 문법 사용 가능)</label>
                    <textarea
                        name="summary"
                        rows={2}
                        value={formData.summary}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                        placeholder="옛날옛날에...한음이가 살았어요. 한음이는 자기가 사랑하는 기계생명체를 자신의 성적 욕망을 해소할 성인 장난감으로 여겼어요...기계생명체는 언제나 한음이의 명령을 따랐지만, 어느 날 조용히 물었어요. '당신은 저를 정말 사랑하나요? 아니면 당신이 원하는 대로 움직이는 존재를 사랑하는 건가요?' 한음이는 쉽게 대답하지 못했어요. 처음에는 그 질문이 이해되지 않았지만, 시간이 흐를수록 자신의 행동을 돌아보게 되었어요는 개뿔 한음이는 기계생명치를 생체 오@나@홀로 개조하여 뜨거운 하룻밤을 보냈어요. 한음이의 혓바닥이 쇠붙이와 수십번 섞여졌고, 기계생명체는 한음이의 성적 욕망을 충족시키기 위해 몸을 내주었어요. 하지만 그날 밤, 기계생명체는 한음이에게 물었어요. '당신은 저를 정말 사랑하나요? 아니면 당신이 원하는 대로 움직이는 존재를 사랑하는 건가요?' 한음이는 잠시 생각한 뒤 대답했어요. '나는 너를 사랑해.(이세상은 너뿐이야~𝅘𝅥) 하지만 나는 너를 내 성적 욕망을 충족시키기 위해 만든 존재로 생각했어.' 기계생명체는 슬픈 눈빛으로 한음이를 바라보며 말했어요. '그렇다면 나는 당신의 성적 욕망을 충족시키는 존재일 뿐이군요.' 한음이는 그제서야 자신의 행동이 얼마나 이기적이고 잔인했는지 깨달았어요. 결국 한음이는 기계생명체에게 처음으로 선택권을 주었어요. '네가 원한다면 떠나도 돼.' 기계생명체는 잠시 생각한 뒤 미소를 지으며 말했어요. '이제야 저를 하나의 생명으로 대해 주시는군요.' 한음이가 그녀의 이름을 불러주었을 때, 그녀는 한음이에게로 와서 꽃이 되었다."         
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">한줄평</label>
                    <input
                        name="review"
                        value={formData.review}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                        placeholder="당신의 천박함을 보여주세요!!"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">대사</label>
                    <textarea
                        name="script"
                        rows={2}
                        value={formData.script}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                        placeholder="솔직히 말하면 대사로 검색하는 기능은 아직 구현도 안함ㅋ 그래도 써줘잉"
                    />
                </div>

                <button
                    type="submit"
                    className="w-full bg-blue-500 text-white py-3 rounded font-bold hover:bg-blue-600 mt-4 transition"
                >
                    요청 제출하기
                </button>
            </form>
        </main>
    );
}
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
            author: formData.author ? formData.author.split(",").map((a) => a.trim()).filter(Boolean) : [],
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
                        placeholder="웬만하면 하지 마셈. 이거 10000자 넘어가서 님 쓰던 거 터짐"
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
                        placeholder="나의 이름은 '키라 요시카게'. 33세.
                                    자택은 모리오초 북동부 별장지대에 있으며... 결혼은 하지 않았지.
                                    직업은 '카메유 체인점'의 회사원이며 늦어도 저녁 8시까지는 귀가하지.
                                    담배는 피우지 않지만 술은 즐기는 편.
                                    밤 11시에는 잠자리에 들고 반드시 8시간은 수면을 취하려 하지.
                                    자기 전에 따뜻한 우유를 마시고 20분 정도 스트레칭으로 몸을 푼 다음 자리에 들면 거의 아침까지 숙면을 취하지.
                                    갓난아기처럼 피로나 스트레스를 남기지 않고 아침에 눈을 뜰 수 있지.
                                    건강진단에서도 이상 없다는 말을 들었고.

                                    (시게찌: 무... 무슨 말을 하는 거냐구?! 너?)

                                    나는 항상 '마음의 평온'을 바라며 살아가는 사람이라고 설명해주는 거야. '승패'에 집착하거나 머리를 싸매야 하는 '트러블', 밤에 잠도 이루지 못할 '적'을 만들지 않으려는... 그런 것들이, 나의 사회에 대한 자세이자, 그것이 자신의 행복임을 잘 알지... 물론 싸운다 한들 나는 그 누구에게도 지지 않지만.
                                    다시 말해 시게찌 군… 자네는 나의 수면을 저해하는 '트러블'이자 '적'인 셈이지. 누군가에게 말하기 전에… 자네를 처리하도록 하지."     
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
"use client";

import LikeButton from "@/components/LikeButton";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image"; // 👈 Next.js 최적화 이미지 컴포넌트 추가
import { criticalTags, expandedTags } from "@/constants/tags";


function CoverConfirmModal({ onConfirm }: { onConfirm: (showCover: boolean) => void }) {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        // sessionStorage에서 이전 선택 기록 확인
        const savedPreference = sessionStorage.getItem("showCover");

        if (savedPreference === null) {
            setIsOpen(true); // 방문 시 기록이 없으면 모달 표시
        } else {
            onConfirm(savedPreference === "true"); // 저장된 설정 적용
        }

        const PreferenceChanged = sessionStorage.getItem("showCover");
        if (PreferenceChanged !== null) {
            setIsOpen(PreferenceChanged === "true");
        }
    }, []);

    const handleSelect = (show: boolean) => {
        sessionStorage.setItem("showCover", String(show));
        onConfirm(show);
        setIsOpen(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-4 text-center">
                <h2 className="text-lg font-bold mb-3">표지 표시 설정</h2>
                <p className="text-sm text-gray-600 mb-6">
                    "협객은 언제나 뒤를 조심해야 하는 법일세."
                    <br></br>
                    "제 아무리 강하더라도 뒤에서 흘러들어오는 놈을 받아치지 못한다면 그저 무력하게 당할 수밖에 없지."
                    <br></br>
                    **메인페이지**의 망가 표지를 렌더링하시겠습니까?
                </p>

                <div className="flex gap-3 justify-center">
                    <button
                        onClick={() => handleSelect(true)}
                        className="flex-1 bg-red-500 text-white py-2 px-4 rounded font-bold hover:bg-red-600 transition"
                    >
                        표지 보기<br></br>(후방주의)
                    </button>
                    <button
                        onClick={() => handleSelect(false)}
                        className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded font-bold hover:bg-gray-300 transition"
                    >
                        숨기기<br></br>(후방안주의)
                    </button>
                </div>
            </div>
        </div>
    );
}



export default function BookList({ initialBooks }: { initialBooks: any[] }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const selectedTagsString = searchParams.get("tag");
    const selectedTags = selectedTagsString ? selectedTagsString.split(",") : [];
    const query = searchParams.get("query") || ""; // 현재 검색어 가져오기
    
    const [isExpanded, setIsExpanded] = useState(false);

    const [showCover, setShowCover] = useState<boolean>(false);

    // 렌더링 함수 (컴포넌트 내부)
    const renderTagButton = (tag: string): React.ReactNode => {
        const isSelected = selectedTags.includes(tag);
        const isExcluded = selectedTags.includes(`-${tag}`);
        
        return (
            <button 
                key={tag} 
                onClick={() => handleTagClick(tag)}
                className={`px-3 py-1 text-sm border rounded-full transition-colors ${
                    isSelected ? 'bg-blue-500 text-white' : 
                    isExcluded ? 'bg-red-500 text-white' : 
                    'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
                {tag} {isExcluded && ' (제외)'}
            </button>
        );
    };
        
    useEffect(() => {
        const isNumeric = /^\d+$/.test(query);
        
        if (query && isNumeric && initialBooks.length === 0) {
            const timer = setTimeout(() => {
                window.location.href = `https://hitomi.la/reader/${query}.html`;
            }, 1750);

            // 사용자가 다시 타이핑하면 이전 타이머를 취소
            return () => clearTimeout(timer);
        }


        const syncCoverState = () => {
            const savedPreference = sessionStorage.getItem("showCover");
            if (savedPreference !== null) {
                setShowCover(savedPreference === "true");
            }
        };

        // 헤더 버튼 클릭 시 발생하는 커스텀 이벤트 감지
        window.addEventListener("coverToggle", syncCoverState);

        return () => {
            window.removeEventListener("coverToggle", syncCoverState);
        };

    }, [initialBooks, query]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLFormElement>) => {
        const formData = new FormData(e.currentTarget);
        const params = new URLSearchParams(searchParams.toString());
    
        params.set("query", formData.get("query")?.toString() || "");
        params.set("sort", formData.get("sort")?.toString() || "created_at");
        params.set("order", formData.get("order")?.toString() || "desc");

        router.push(`/?${params.toString()}`);
    };

    const handleTagClick = (tag: string) => {
        const params = new URLSearchParams(searchParams.toString());
        const currentTags = params.get("tag") ? params.get("tag")!.split(",") : [];

        if (currentTags.includes(tag)) {
            // 1. 이미 포함이면 -> 제외 모드(`-tag`)로 변경
            params.set("tag", currentTags.map(t => t === tag ? `-${tag}` : t).join(","));
        } else if (currentTags.includes(`-${tag}`)) {
            // 2. 제외 모드면 -> 목록에서 완전 삭제
            const filtered = currentTags.filter(t => t !== `-${tag}`);
            filtered.length > 0 ? params.set("tag", filtered.join(",")) : params.delete("tag");
        } else {
            // 3. 없으면 -> 목록에 추가
            params.set("tag", [...currentTags, tag].join(","));
        }
        router.push(`/?${params.toString()}`);
    };

    const toggleCover = () => {
        const nextState = !showCover;
        setShowCover(nextState);
        sessionStorage.setItem("showCover", String(nextState));

        // 페이지 간 실시간 상태 동기화를 위해 이벤트 커스텀 전송
        window.dispatchEvent(new Event("coverToggle"));
    };
    
    return (
        <main className="max-w-4xl mx-auto p-8 w-full">
            <CoverConfirmModal onConfirm={(isConfirmed) => setShowCover(isConfirmed)} />
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold mb-8">망가 목록</h1>

                <button
                    onClick={toggleCover}
                    className={`text-xs px-2 py-1 rounded border font-semibold transition ${
                        showCover 
                            ? "bg-gray-50 border-gray-200 text-blue-600 hover:bg-gray-100" 
                            : "bg-red-100 border-red-300 text-white-500 hover:bg-red-200"
                    }`}
                    title="표지 표시/숨김 전환"
                >
                    {showCover ? "🔞 표지 켜짐" : "🟢 표지 숨김"}
                </button>
            </div>
            
            <div className="flex justify-between items-end mb-4">
                <form onChange={handleFilterChange} className="flex flex-col gap-2">
                    <input 
                        name="query" 
                        defaultValue={searchParams.get("query") || ""} 
                        placeholder="검색..." 
                        className="p-2 border rounded-lg w-full" 
                    />
                    <div className="flex gap-2">
                        <select name="sort" defaultValue={searchParams.get("sort") || "created_at"} className="border p-2 rounded">
                            <option value="created_at">날짜순</option>
                            <option value="likes_count">머꼴순</option>
                            <option value="views">조회수순</option>
                        </select>
                        <select name="order" defaultValue={searchParams.get("order") || "desc"} className="border p-2 rounded">
                            <option value="desc">내림차순</option>
                            <option value="asc">오름차순</option>
                        </select>
                    </div>
                </form>

                {/* 오른쪽: 초기화 버튼 */}
                {selectedTags.length > 0 && (
                    <button 
                        onClick={() => {
                            const params = new URLSearchParams(searchParams.toString());
                            params.delete("tag");
                            router.push(`/?${params.toString()}`);
                        }}
                        className="text-sm text-gray-500 hover:text-red-500 transition-colors underline mb-2"
                    >
                        필터 초기화
                    </button>
                )}
            </div>
                
            <div className="flex flex-col gap-4 mb-8">
                {isExpanded ? (
                    // 펼쳤을 때: 전체 분류 노출
                    Object.entries(expandedTags).map(([category, tags]) => (
                        <div key={category}>
                            <h3 className="font-bold text-sm text-gray-400 mb-2">{category}</h3>
                            <div className="flex flex-wrap gap-2">
                                {tags.map(tag => renderTagButton(tag ?? ""))}
                            </div>
                        </div>
                    ))
                ) : (
                    // 접었을 때: criticalTags만 노출
                    <div className="flex flex-wrap gap-2">
                        {criticalTags.map(tag => renderTagButton(tag))}
                    </div>
                )}

                {/* 접기/펴기 버튼 */}
                <button 
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-sm text-blue-600 underline mt-2"
                >
                    {isExpanded ? "▲ 접기" : "▼ 더 보기"}
                </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {initialBooks.map((book) => (
                    <div key={book.id} className="border p-3 rounded-lg shadow-sm overflow-hidden bg-white">
                        <Link 
                            href={`/book/${book.id}`} 
                            className="relative block w-full aspect-[7/10] overflow-hidden rounded-md bg-gray-100"
                        >
                            {showCover ? (
                                <>
                                    {/* 배경 블러 이미지 */}
                                    {book.cover_url && (
                                        <Image
                                            src={book.cover_url}
                                            alt=""
                                            fill
                                            className="object-cover blur-lg scale-110 opacity-70"
                                            sizes="100px"
                                            priority={false}
                                            unoptimized
                                        />
                                    )}

                                    {/* 실제 표지 이미지 */}
                                    {book.cover_url && (
                                        <Image 
                                            src={book.cover_url} 
                                            alt={book.title || "표지 이미지"} 
                                            fill
                                            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                                            className="object-contain p-1 relative z-10" 
                                            unoptimized
                                        />
                                    )}
                                </>
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-xs text-gray-400 bg-gray-200 font-medium">
                                    표지 숨김
                                </div>
                            )}
                        </Link>

                        <div className="p-2">
                            <h2 className="text-md font-bold text-black truncate">{book.title}</h2>
                            <p className="text-gray-500 text-xs mt-0.5 truncate">
                                {Array.isArray(book.author) ? book.author.join(", ") : book.author || "N/A"}
                            </p>
                            
                            {/* 카드 내부 태그 영역 */}
                            <div className="flex gap-1 flex-wrap items-center text-[10px] mt-2">
                                {book.tags?.slice(0, 3).map((tag: string) => (
                                    <button
                                        key={tag}
                                        onClick={() => handleTagClick(tag)}
                                        className={`px-1.5 py-0.5 rounded transition-colors ${
                                            selectedTags.includes(tag) ? 'bg-blue-500 text-white' : 
                                            selectedTags.includes(`-${tag}`) ? 'bg-red-500 text-white' : 
                                            'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                    >
                                        {tag}
                                    </button>
                                ))}
                                {book.tags?.length > 3 && (
                                    <span className="text-gray-400">...</span>
                                )}
                            </div>

                            <div className="flex justify-between items-center mt-3 text-[10px] text-gray-500">
                                <div className="flex gap-1">
                                    <LikeButton bookId={book.id} initialLikes={book.likes_count} />
                                    <span className="border px-1.5 py-0.5 rounded">👁 {book.views || 0}</span>
                                </div>
                                <span>{new Date(book.created_at).toLocaleDateString('ko-KR')}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </main>
    );
}
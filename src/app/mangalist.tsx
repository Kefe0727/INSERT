"use client";

import LikeButton from "@/components/LikeButton";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image"; // 👈 Next.js 최적화 이미지 컴포넌트 추가
import { criticalTags, expandedTags } from "@/constants/tags";

export default function BookList({ initialBooks }: { initialBooks: any[] }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const selectedTagsString = searchParams.get("tag");
    const selectedTags = selectedTagsString ? selectedTagsString.split(",") : [];
    const query = searchParams.get("query") || ""; // 현재 검색어 가져오기
    
    const [isExpanded, setIsExpanded] = useState(false);

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
    
    return (
        <main className="max-w-4xl mx-auto p-8 w-full">
            <h1 className="text-3xl font-bold mb-8">망가 목록</h1>
            
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
                            {/* 배경 블러 이미지 */}
                            {book.cover_url && (
                                <Image
                                    src={book.cover_url}
                                    alt=""
                                    fill
                                    className="object-cover blur-lg scale-110 opacity-70"
                                    sizes="100px"
                                    priority={false}
                                    unoptimized // 👈 Next.js 서버 최적화를 거치지 않고 직접 로드
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
                                    unoptimized // 👈 Next.js 서버 최적화를 거치지 않고 직접 로드
                                />
                            )}
                        </Link>

                        <div className="p-2">
                            <h2 className="text-md font-bold text-black truncate">{book.title}</h2>
                            <p className="text-gray-500 text-xs mt-0.5">{book.author}</p>
                            
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
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import LikeButton from "@/components/LikeButton";
import { criticalTags, expandedTags } from "@/constants/tags";

export default function LikedBookList({ initialBooks }: { initialBooks: any[] }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    
    const query = searchParams.get("query") || "";
    const sort = searchParams.get("sort") || "created_at";
    const order = searchParams.get("order") || "desc";
    const selectedTagsString = searchParams.get("tag");
    const selectedTags = selectedTagsString ? selectedTagsString.split(",") : [];

    const [isExpanded, setIsExpanded] = useState(false);

    const handleFilterChange = (e: React.ChangeEvent<HTMLFormElement>) => {
        const formData = new FormData(e.currentTarget);
        const params = new URLSearchParams(searchParams.toString());
        params.set("query", formData.get("query")?.toString() || "");
        params.set("sort", formData.get("sort")?.toString() || "created_at");
        params.set("order", formData.get("order")?.toString() || "desc");
        router.push(`/likes?${params.toString()}`);
    };

    const handleTagClick = (tag: string) => {
        const params = new URLSearchParams(searchParams.toString());
        const currentTags = params.get("tag") ? params.get("tag")!.split(",") : [];

        if (currentTags.includes(tag)) {
            params.set("tag", currentTags.map(t => t === tag ? `-${tag}` : t).join(","));
        } else if (currentTags.includes(`-${tag}`)) {
            const filtered = currentTags.filter(t => t !== `-${tag}`);
            filtered.length > 0 ? params.set("tag", filtered.join(",")) : params.delete("tag");
        } else {
            params.set("tag", [...currentTags, tag].join(","));
        }
        router.push(`/likes?${params.toString()}`);
    };

    const renderTagButton = (tag: string) => {
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

    // --- 좋아요 표시된 목록 안에서만 필터링 (클라이언트 메모리 필터링) ---
    const filteredBooks = initialBooks.filter(book => {
        // 1. 검색어 필터 (제목, 작가, ID, 태그 내 검색)
        if (query) {
            const q = query.toLowerCase();
            const matchesTitle = book.title?.toLowerCase().includes(q);
            const matchesAuthor = book.author?.toLowerCase().includes(q);
            const matchesId = String(book.id) === q;
            const matchesTag = book.tags?.some((t: string) => t.toLowerCase().includes(q));

            if (!matchesTitle && !matchesAuthor && !matchesId && !matchesTag) {
                return false;
            }
        }

        // 2. 태그 필터 (포함/제외 조건)
        if (selectedTags.length > 0) {
            for (const tag of selectedTags) {
                if (tag.startsWith('-')) {
                    const actualTag = tag.slice(1);
                    if (book.tags?.includes(actualTag)) return false; // 제외 태그가 존재하면 제외
                } else {
                    if (!book.tags?.includes(tag)) return false; // 포함 태그가 없으면 제외
                }
            }
        }

        return true;
    }).sort((a, b) => {
        // 3. 정렬 필터 (날짜, 좋아요수, 조회수)
        let valA = a[sort];
        let valB = b[sort];

        if (sort === "created_at") {
            valA = new Date(a.created_at).getTime();
            valB = new Date(b.created_at).getTime();
        } else {
            valA = Number(valA || 0);
            valB = Number(valB || 0);
        }

        return order === "asc" ? valA - valB : valB - valA;
    });

    return (
        <main className="max-w-4xl mx-auto p-8 w-full">
            <h1 className="text-3xl font-bold mb-8">머꼴한 망가</h1>
            
            <div className="flex justify-between items-end mb-4">
                <form onChange={handleFilterChange} className="flex flex-col gap-2">
                    <input 
                        name="query" 
                        defaultValue={query} 
                        placeholder="머꼴한 망가 검색..." 
                        className="p-2 border rounded-lg w-full" 
                    />
                    <div className="flex gap-2">
                        <select name="sort" defaultValue={sort} className="border p-2 rounded">
                            <option value="created_at">날짜순</option>
                            <option value="likes_count">머꼴순</option>
                            <option value="views">조회수순</option>
                        </select>
                        <select name="order" defaultValue={order} className="border p-2 rounded">
                            <option value="desc">내림차순</option>
                            <option value="asc">오름차순</option>
                        </select>
                    </div>
                </form>

                {selectedTags.length > 0 && (
                    <button 
                        onClick={() => {
                            const params = new URLSearchParams(searchParams.toString());
                            params.delete("tag");
                            router.push(`/likes?${params.toString()}`);
                        }}
                        className="text-sm text-gray-500 hover:text-red-500 transition-colors underline mb-2"
                    >
                        필터 초기화
                    </button>
                )}
            </div>

            <div className="flex flex-col gap-4 mb-8">
                {isExpanded ? (
                    Object.entries(expandedTags).map(([category, tags]) => (
                        <div key={category}>
                            <h3 className="font-bold text-sm text-gray-400 mb-2">{category}</h3>
                            <div className="flex flex-wrap gap-2">
                                {tags.map(tag => renderTagButton(tag))}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-wrap gap-2">
                        {criticalTags.map(tag => renderTagButton(tag))}
                    </div>
                )}

                <button 
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-sm text-blue-600 underline mt-2"
                >
                    {isExpanded ? "▲ 접기" : "▼ 더 보기"}
                </button>
            </div>

            {filteredBooks.length === 0 ? (
                <p className="text-gray-500">조건에 맞는 머꼴 망가가 없습니다.</p>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredBooks.map((book) => (
                        <div key={book.id} className="border p-3 rounded-lg shadow-sm overflow-hidden bg-white">
                            <Link 
                                href={`/book/${book.id}`} 
                                className="relative block w-full aspect-[7/10] overflow-hidden rounded-md"
                            >
                                <div 
                                    className="absolute inset-0 bg-cover bg-center blur-lg scale-110 opacity-70"
                                    style={{ backgroundImage: `url(${book.cover_url})` }}
                                />
                                <img 
                                    src={book.cover_url} 
                                    alt={book.title} 
                                    className="absolute inset-0 w-full h-full object-contain p-1" 
                                />
                            </Link>

                            <div className="p-2">
                                <h2 className="text-md font-bold text-black truncate">{book.title}</h2>
                                <p className="text-gray-500 text-xs mt-0.5">{book.author}</p>
                                
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
            )}
        </main>
    );
}
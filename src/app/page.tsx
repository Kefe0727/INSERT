import { supabase } from "@/lib/supabase";
import BookList from "./mangalist";

export const dynamic = 'force-dynamic';

export default async function Home({ 
  searchParams 
}: { 
  searchParams: Promise<{ query?: string; sort?: string; order?: string; tag?: string }> 
}) {
  const params = await searchParams;
  const query = params.query || "";
  const sort = params.sort || "created_at";
  const order = params.order || "desc";
  const selectedTag = params.tag;
  
  // 1. 최소한의 필드와 관계 릴레이션만 Select하여 대역폭 절약
  let queryBuilder = supabase
    .from("books")
    .select(`id, title, author, cover_url, tags, views, created_at, likes:likes(count)`);

  // 검색어 필터
  if (query) {
    const isNumericQuery = !isNaN(Number(query));

    let filterString = 
        `title.ilike.%${query}%,` +
        `author.ilike.%${query}%,` +
        `summary.ilike.%${query}%,` +
        `tags.cs.{${query}}`;

    if (isNumericQuery) {
      filterString += `,id.eq.${query}`;
    }

    queryBuilder = queryBuilder.or(filterString);
  }

  // 태그 필터 (tag가 선택되었을 경우)
  if (selectedTag) {
    const tags = selectedTag.split(",");
    
    tags.forEach(t => {
      if (t.startsWith('-')) {
        // 제외: 해당 태그가 포함되지 않은 것
        queryBuilder = queryBuilder.not('tags', 'cs', `{${t.slice(1)}}`);
      } else {
        // 포함: 해당 태그가 포함된 것
        queryBuilder = queryBuilder.contains('tags', [t]);
      }
    });
  }

  // 2. 데이터베이스 정렬 (likes_count 제외)
  if (sort !== "likes_count") {
    queryBuilder = queryBuilder.order(sort, { ascending: order === "asc" });
  }

  const { data: books, error } = await queryBuilder as any;

  if (error) return <div className="p-8 text-center text-red-500">오류가 발생했습니다.</div>;

  // 3. 데이터 가공
  let formattedBooks = (books || []).map((book: any) => ({
    ...book,
    likes_count: parseInt(book.likes?.[0]?.count || 0, 10)
  }));

  // 4. '좋아요순' 정렬
  if (sort === "likes_count") {
      formattedBooks = [...formattedBooks].sort((a, b) => {
        const valA = Number(a.likes_count);
        const valB = Number(b.likes_count);
        return order === "asc" ? valA - valB : valB - valA;
      });
  }

  return <BookList initialBooks={formattedBooks} />;
}
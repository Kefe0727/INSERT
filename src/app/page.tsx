import { supabase } from "@/lib/supabase";
import BookList from "./mangalist";

export const dynamic = 'force-dynamic';

export default async function Home({ 
  searchParams 
}: { 
  searchParams: Promise<{ query?: string; sort?: string; order?: string; tag?: string }> // tag 추가
}) {
  const params = await searchParams;
  const query = params.query || "";
  const sort = params.sort || "created_at";
  const order = params.order || "desc";
  const selectedTag = params.tag;
  
  // 1. 조인을 포함하여 데이터를 가져옵니다.
  // 주의: queryBuilder를 미리 정의할 때 select를 이미 했으므로, 
  // 조인이 포함된 select로 다시 정의하는 것이 좋습니다.
  let queryBuilder = supabase
    .from("books")
    .select(`*, likes:likes(count)`);

  // 검색어 필터
  // 검색어 필터
  if (query) {
    // 입력된 쿼리가 숫자인지 확인
    const isNumericQuery = !isNaN(Number(query));

    let filterString = 
        `title.ilike.%${query}%,` +
        `author.ilike.%${query}%,` +
        `summary.ilike.%${query}%,` +
        `tags.cs.{${query}}`;

    // 숫자인 경우 id 검색 조건 추가
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

  // 2. 데이터베이스 정렬 (단, likes_count는 DB 필드가 아니므로 DB 정렬에서 제외)
  if (sort !== "likes_count") {
    queryBuilder = queryBuilder.order(sort, { ascending: order === "asc" });
  }

  const { data: books, error } = await queryBuilder as any;

  if (error) return <div>오류 발생</div>;

  // 3. 데이터 가공
  let formattedBooks = (books || []).map((book: any) => ({
    ...book,
    likes_count: parseInt(book.likes[0]?.count || 0, 10)
  }));

  // 4. '좋아요순'일 때만 자바스크립트로 정렬
  // page.tsx의 정렬 부분
  if (sort === "likes_count") {
      formattedBooks = [...formattedBooks].sort((a, b) => {
        const valA = Number(a.likes_count);
        const valB = Number(b.likes_count);
        return order === "asc" ? valA - valB : valB - valA;
      });
  }
  return <BookList initialBooks={formattedBooks} />;
  
}
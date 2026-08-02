// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 값을 제대로 읽었는지 터미널에 출력해봅니다!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("환경 변수가 비어있습니다! .env.local 파일을 확인하세요.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
// src/lib/supabase.ts

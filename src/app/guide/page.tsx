"use client";

import { useState } from "react";
// 💡 parseSummary 함수가 정의된 위치에서 import 해줍니다.
import { parseSummary } from "@/utils/textParser";

export default function GuidePage() {
    // parseSummary 함수로 테스트할 예시 규칙 설명 텍스트
    const guideText = `
    **기본 처리**:
    \`**텍스트**\` : **볼드 처리**할 때 사용합니다.
    \`*텍스트*\` : *기울임꼴* 처리할 때 사용합니다.
    \`~~텍스트~~\` : ~~취소선~~을 그을 때 사용합니다.
    \`__텍스트__\` : __밑줄__을 그을 때 사용합니다.
    \`##텍스트\` : **제목 텍스트**를 작성할 때 사용합니다.
    \`[[텍스트]]\` : [[스포방지]]를 할 때 사용합니다.
    
    **색상 코드**:
    \`&4\` : &4빨강
    \`&c\` : &c다홍
    \`&e\` : &e노랑
    \`&6\` : &6금색
    \`&2\` : &2녹색
    \`&a\` : &a연두
    \`&b\` : &b하늘
    \`&3\` : &3청록
    \`&1\` : &1파랑
    \`&9\` : &9남색
    \`&d\` : &d분홍
    \`&5\` : &5보라
    \`&f\` : &f하양
    \`&7\` : &7회색
    \`&8\` : &8진회색
    \`&0\` : &0검정

    `;

    const parsedGuideText = parseSummary(guideText);

    return (
        <main className="max-w-3xl mx-auto p-8">
            <h1 className="text-3xl font-bold mb-6">📖 도움말 </h1>
            <section className="border p-6 rounded-lg bg-gray-50 dark:bg-gray-900 dark:text-gray-300 mb-6">
                <h2 className="text-lg font-bold mb-3">댓글 작성 문법</h2>
                <div className="prose text-m text-gray-800 dark:text-gray-300 whitespace-pre-line leading-relaxed" dangerouslySetInnerHTML={{ __html: parsedGuideText }} >
                </div>
            </section>
            <section className="space-y-4 text-sm text-gray-600 dark:text-gray-200">
                <h3 className="font-bold text-xl text-gray-800 dark:text-gray-300 text-base">태그 검색 사용법</h3>
                <ul className="list-disc pl-5 space-y-1">
                    <li><span className="font-semibold text-blue-600">1회 클릭:</span> 해당 태그를 포함하는 망가만 필터링합니다.</li>
                    <li><span className="font-semibold text-red-600">2회 클릭:</span> 해당 태그를 제외(-태그)합니다.</li>
                    <li><span className="font-semibold text-gray-500">3회 클릭:</span> 태그 필터를 해제합니다.</li>
                </ul>
            </section>
        </main>
    );
}
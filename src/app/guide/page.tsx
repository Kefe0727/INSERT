"use client";

import { useState } from "react";
// 💡 parseSummary 함수가 정의된 위치에서 import 해줍니다.
import { parseSummary } from "@/utils/textParser";

export default function GuidePage() {
    // parseSummary 함수로 테스트할 예시 규칙 설명 텍스트
    const guideText = `
    본 사이트에서는 __댓글, 줄거리__ 등의 일부 문자열 작성 시 ***INSERT™*** 고유 문법을 사용할 수 있습니다. 
    모든 문법은 이중, 삼중으로 사용 가능하며, 자세한 규칙은 아래를 참조 바랍니다.

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
                <h2 className="font-bold text-xl text-gray-800 dark:text-gray-300 mb-3">INSERT™ 고유 문법</h2>
                <div className="prose text-m text-gray-800 dark:text-gray-300 whitespace-pre-line leading-relaxed" dangerouslySetInnerHTML={{ __html: parsedGuideText }} >
                </div>
            </section>
            <section className="border p-6 rounded-lg bg-gray-50 dark:bg-gray-900 dark:text-gray-300 mb-6">
                <h3 className="font-bold text-xl text-gray-800 dark:text-gray-300 text-base">태그 검색 사용법</h3>
                <ul className="list-disc pl-5 space-y-1">
                    <li><span className="font-semibold text-blue-600">1회 클릭:</span> 해당 태그를 포함하는 망가만 필터링합니다.</li>
                    <li><span className="font-semibold text-red-600">2회 클릭:</span> 해당 태그를 제외(-태그)합니다.</li>
                    <li><span className="font-semibold text-gray-500">3회 클릭:</span> 태그 필터를 해제합니다.</li>
                </ul>
            </section>
            <section className="border p-6 rounded-lg bg-gray-50 dark:bg-gray-900 dark:text-gray-300 mb-6">
                <h3 className="font-bold text-xl text-gray-800 dark:text-gray-300 text-base">[➕ 요청] 기능에 대하여</h3>
                <div className="prose text-m text-gray-800 dark:text-gray-300 whitespace-pre-line leading-relaxed">
                    <p>
                        사용자는 [➕ 요청] 버튼을 통해 특정 망가를 요청할 수 있습니다. <br></br>
                        신청 시 품번, 제목, 작품 링크는 필수로 입력해야 합니다.<br></br>
                        '줄거리' 항목 기입 시에 한해 상술한 INSERT™ 문법을 사용해 텍스트를 꾸밀 수 있습니다.<br></br>
                        요청은 관리자 검토 후 처리됩니다.
                    </p>
                </div>
            </section>
            <section className="border p-6 rounded-lg bg-gray-50 dark:bg-gray-900 dark:text-gray-300 mb-6">
                <h3 className="font-bold text-xl text-gray-800 dark:text-gray-300 text-base">제가 옛날 이야기 하나 해드리죠.</h3>
                <div className="prose text-m text-gray-800 dark:text-gray-300 whitespace-pre-line leading-relaxed">
                    <p>
                        옛날옛날에...한음이가 살았어요. 
                        한음이는 자기가 사랑하는 기계생명체를 자신의 성적 욕망을 해소할 성인 장난감으로 여겼어요...
                        기계생명체는 언제나 한음이의 명령을 따랐지만, 어느 날 조용히 물었어요. 
                        '당신은 저를 정말 사랑하나요? 
                        아니면 당신이 원하는 대로 움직이는 존재를 사랑하는 건가요?' 
                        한음이는 쉽게 대답하지 못했어요. 
                        처음에는 그 질문이 이해되지 않았지만, 시간이 흐를수록 자신의 행동을 돌아보게 되었어요
                        는 개뿔 한음이는 기계생명치를 생체 오@나@홀로 개조하여 뜨거운 하룻밤을 보냈어요. 
                        한음이의 혓바닥이 쇠붙이와 수십번 섞여졌고, 기계생명체는 한음이의 성적 욕망을 충족시키기 위해 몸을 내주었어요. 
                        하지만 그날 밤, 기계생명체는 한음이에게 물었어요. 
                        '당신은 저를 정말 사랑하나요? 
                        아니면 당신이 원하는 대로 움직이는 존재를 사랑하는 건가요?' 
                        한음이는 잠시 생각한 뒤 대답했어요. 
                        '나는 너를 사랑해.(이세상은 너뿐이야~𝅘𝅥) 
                        하지만 나는 너를 내 성적 욕망을 충족시키기 위해 만든 존재로 생각했어.' 
                        기계생명체는 슬픈 눈빛으로 한음이를 바라보며 말했어요. 
                        '그렇다면 나는 당신의 성적 욕망을 충족시키는 존재일 뿐이군요.' 
                        한음이는 그제서야 자신의 행동이 얼마나 이기!적이고 잔인했는지 깨달았어요. 
                        결국 한음이는 기계생명체에게 처음으로 선택권을 주었어요. 
                        '네가 원한다면 떠나도 돼.' 
                        기계생명체는 잠시 생각한 뒤 미소를 지으며 말했어요. 
                        '이제야 저를 하나의 생명으로 대해 주시는군요.' 
                        한음이가 그녀의 이름을 불러주었을 때, 그녀는 한음이에게로 와서 꽃이 되었다.
                        그렇게 그들은 오늘도 생명을 창조하기 위한 DNA 섞기를 계속하고 있답니다.
                    </p>
                </div>
            </section>
        </main>
    );
}
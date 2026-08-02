export function parseSummary(text: string): string {
    if (!text) return "";

    // 0. 백틱(`) 기호 내부의 코드를 임시 치환하여 파싱을 방지
    const codeBlocks: string[] = [];
    let parsed = text.replace(/`(.*?)`/g, (_, code) => {
        // html 태그로 변환 시 특수문자가 깨지지 않도록 기본 이스케이프
        const safeCode = code
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
        
        codeBlocks.push(`<code class="bg-gray-200 text-red-500 px-1 py-0.5 rounded text-xs font-mono">${safeCode}</code>`);
        return `%%CODE_BLOCK_${codeBlocks.length - 1}%%`;
    });

    // 1. 기본 마크다운 스타일 (순서 중요)
    parsed = parsed
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/~~(.*?)~~/g, '<del>$1</del>')
        .replace(/__(.*?)__/g, '<u>$1</u>')
        .replace(/^##(.*$)/gm, '<h2 class="text-xl font-bold">$1</h2>')
        .replace(/\[\[(.*?)\]\]/g, '<span class="spoiler">$1</span>');

    // 2. 색상 코드 (&x -> <span style="color:...">)
    parsed = parsed
        .replace(/&4/g, '</span><span style="color:#FF0000">').replace(/&c/g, '</span><span style="color:#FF5555">')
        .replace(/&e/g, '</span><span style="color:#FFFF55">').replace(/&6/g, '</span><span style="color:#DFBB01">')
        .replace(/&2/g, '</span><span style="color:#00AA00">').replace(/&a/g, '</span><span style="color:#55FF55">')
        .replace(/&b/g, '</span><span style="color:#55FFFF">').replace(/&3/g, '</span><span style="color:#00AAAA">')
        .replace(/&1/g, '</span><span style="color:#0044FF">').replace(/&9/g, '</span><span style="color:#5555FF">')
        .replace(/&d/g, '</span><span style="color:#FF55FF">').replace(/&5/g, '</span><span style="color:#AA00FF">')
        .replace(/&f/g, '</span><span style="color:#FFFFFF">').replace(/&7/g, '</span><span style="color:#9CA1AD">')
        .replace(/&8/g, '</span><span style="color:#555555">').replace(/&0/g, '</span><span style="color:#000000">')
        .replace(/&[0-9a-f]/g, '</span>'); // 색상 닫기 태그

    // 3. 줄바꿈
    parsed = parsed.replace(/\n/g, '<br/>');

    // 4. 저장해둔 코드 블록 복원
    parsed = parsed.replace(/%%CODE_BLOCK_(\d+)%%/g, (_, index) => codeBlocks[Number(index)]);

    return parsed;
}
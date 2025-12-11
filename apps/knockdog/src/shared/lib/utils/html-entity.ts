/**
 * HTML 엔티티를 디코딩하는 함수
 * 예: &#39; -> ', &quot; -> ", &amp; -> &
 */
export function decodeHtmlEntity(text: string): string {
  if (typeof window === 'undefined') {
    // 서버 사이드: 일반적인 HTML 엔티티 매핑
    return text
      .replace(/&#39;/g, "'")
      .replace(/&apos;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&nbsp;/g, ' ')
      .replace(/&#x27;/g, "'")
      .replace(/&#x2F;/g, '/');
  }

  // 클라이언트 사이드: textarea를 사용하여 브라우저의 내장 디코딩 활용
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
}


// src/lib/markdown.ts
import { marked } from 'marked';

// marked 설정
marked.setOptions({
  breaks: true,
  gfm: true,
  pedantic: false,
});

const isMarkdown = (content: string): boolean => {
  const trimmed = content.trim();

  // 빈 문자열이면 마크다운이 아님
  if (!trimmed) return false;

  // 마크다운 패턴들
  const patterns = [
    /^#{1,6}\s+/m, // 헤더
    /^\s*[-*+]\s+/m, // unordered list
    /^\s*\d+\.\s+/m, // ordered list
    /\*\*[^*\n]+\*\*/, // bold
    /\*[^*\n]+\*/, // italic
    /`[^`\n]+`/, // inline code
    /```[\s\S]*?```/, // code block
    /^\s*>/m, // blockquote
    /\[.*?\]\(.*?\)/, // link
    /!\[.*?\]\(.*?\)/, // image
    /^\s*\|.*\|.*$/m, // table
    /^\s*[-=]{3,}\s*$/m, // horizontal rule
    /~~[^~\n]+~~/, // strikethrough
  ];

  // 하나라도 매치되면 마크다운으로 판단
  return patterns.some((pattern) => pattern.test(trimmed));
};

// 마크다운 전처리 함수
const preprocessMarkdown = (content: string) => {
  return content.replace(/^(#{1,6})([^\s#])/gm, '$1 $2'); // #text → # text
};

// 마크다운을 HTML로 변환하는 함수
export const renderMarkdownToHtml = (content: string): string => {
  if (!content.trim()) return '';

  try {
    if (!isMarkdown(content)) {
      return content
        .replace(/\n/g, '<br>') // 줄바꿈을 <br>로 변환
        .replace(/  /g, '&nbsp;&nbsp;'); // 연속 공백 처리
    }
    const processedContent = preprocessMarkdown(content);
    const html = marked.parse(processedContent) as string;

    // 인라인 스타일 적용 (Tailwind reset 덮어쓰기)
    const styledHtml = html
      .replace(
        /<h1>/g,
        '<h1 style="font-size: 2rem !important; font-weight: bold !important; margin-bottom: 1rem !important; margin-top: 2rem !important; color: #1f2937 !important;">'
      )
      .replace(
        /<h2>/g,
        '<h2 style="font-size: 1.5rem !important; font-weight: bold !important; margin-bottom: 0.75rem !important; margin-top: 1.5rem !important; color: #1f2937 !important;">'
      )
      .replace(
        /<h3>/g,
        '<h3 style="font-size: 1.25rem !important; font-weight: bold !important; margin-bottom: 0.5rem !important; margin-top: 1rem !important; color: #1f2937 !important;">'
      )
      .replace(/<p>/g, '<p style="margin-bottom: 1rem !important; line-height: 1.6 !important; color: #4b5563 !important;">')
      .replace(/<ul>/g, '<ul style="margin-bottom: 1rem !important; padding-left: 1.5rem !important; list-style-type: disc !important;">')
      .replace(/<ol>/g, '<ol style="margin-bottom: 1rem !important; padding-left: 1.5rem !important; list-style-type: decimal !important;">')
      .replace(/<li>/g, '<li style="margin-bottom: 0.25rem !important; color: #4b5563 !important; display: list-item !important;">')
      .replace(
        /<code>/g,
        '<code style="background-color: #f3f4f6 !important; padding: 0.125rem 0.25rem !important; border-radius: 0.25rem !important; font-size: 0.875rem !important; font-family: monospace !important; color: #dc2626 !important;">'
      )
      .replace(
        /<pre>/g,
        '<pre style="background-color: #f3f4f6 !important; padding: 1rem !important; border-radius: 0.375rem !important; overflow-x: auto !important; margin-bottom: 1rem !important;">'
      )
      .replace(
        /<blockquote>/g,
        '<blockquote style="border-left: 4px solid #3b82f6 !important; padding-left: 1rem !important; margin-bottom: 1rem !important; color: #6b7280 !important; font-style: italic !important;">'
      )
      .replace(/<a /g, '<a style="color: #3b82f6 !important; text-decoration: underline !important;" ')
      .replace(/<strong>/g, '<strong style="font-weight: bold !important; color: #1f2937 !important;">')
      .replace(/<em>/g, '<em style="font-style: italic !important; color: #4b5563 !important;">');

    return styledHtml;
  } catch (error) {
    console.error('마크다운 변환 오류:', error);
    return '<p style="color: #dc2626;">마크다운 변환 중 오류가 발생했습니다.</p>';
  }
};

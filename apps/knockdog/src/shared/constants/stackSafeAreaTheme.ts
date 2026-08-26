interface StackSafeAreaTheme {
  topBackgroundClassName?: string;
  bottomBackgroundClassName?: string;
}

interface StackSafeAreaThemeRule {
  matches: (pathname: string) => boolean;
  theme: StackSafeAreaTheme;
}

const STACK_SAFE_AREA_THEME_RULES: readonly StackSafeAreaThemeRule[] = [
  {
    // 원장 데일리노티스 템플릿 작성 페이지 (상단 헤더·하단 버튼 영역 모두 bg-bg-50)
    matches: (pathname) => /^\/owner\/daily\/notice\/[^/]+\/template(?:\/|$)/.test(pathname),
    theme: { topBackgroundClassName: 'bg-bg-50', bottomBackgroundClassName: 'bg-bg-50' },
  },
  {
    // 원생 프로필 페이지 (승인 목록 등 다른 /owner/members 하위 경로는 제외)
    // 상단은 헤더(bg-bg-0), 하단은 본문(bg-bg-50)과 맞춤
    matches: (pathname) => /^\/owner\/members\/(?!approval(?:\/|$))[^/]+(?:\/|$)/.test(pathname),
    theme: { topBackgroundClassName: 'bg-bg-0', bottomBackgroundClassName: 'bg-bg-50' },
  },
  {
    // 알림함 페이지: 상단은 헤더(bg-bg-0), 하단은 본문(bg-bg-50)과 맞춤
    matches: (pathname) => /^\/notification(?:\/|$)/.test(pathname),
    theme: { topBackgroundClassName: 'bg-bg-0', bottomBackgroundClassName: 'bg-bg-50' },
  },
];

const DEFAULT_STACK_SAFE_AREA_THEME: StackSafeAreaTheme = {};

function resolveStackSafeAreaTheme(pathname: string): StackSafeAreaTheme {
  return STACK_SAFE_AREA_THEME_RULES.find((rule) => rule.matches(pathname))?.theme ?? DEFAULT_STACK_SAFE_AREA_THEME;
}

export { resolveStackSafeAreaTheme };

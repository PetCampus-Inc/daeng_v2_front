interface StackSafeAreaTheme {
  backgroundClassName?: string;
}

interface StackSafeAreaThemeRule {
  matches: (pathname: string) => boolean;
  theme: StackSafeAreaTheme;
}

const STACK_SAFE_AREA_THEME_RULES: readonly StackSafeAreaThemeRule[] = [
  {
    matches: (pathname) => /^\/owner\/daily\/notice\/[^/]+\/template(?:\/|$)/.test(pathname),
    theme: { backgroundClassName: 'bg-bg-50' },
  },
];

const DEFAULT_STACK_SAFE_AREA_THEME: StackSafeAreaTheme = {};

function resolveStackSafeAreaTheme(pathname: string): StackSafeAreaTheme {
  return STACK_SAFE_AREA_THEME_RULES.find((rule) => rule.matches(pathname))?.theme ?? DEFAULT_STACK_SAFE_AREA_THEME;
}

export { resolveStackSafeAreaTheme };

import { useSafeAreaInsets } from '@shared/lib';
import { CSSProperties, useState, useEffect } from 'react';

type EdgeMode = 'off' | 'additive' | 'maximum';
type Edge = 'top' | 'right' | 'bottom' | 'left';
type EdgesArray = Edge[];
type EdgesObject = Partial<Record<Edge, EdgeMode>>;

interface SafeAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  edges?: EdgesArray | EdgesObject;
}

const DEFAULT_INSETS = { top: 0, bottom: 0, left: 0, right: 0 };

/**
 * 안전 영역
 *
 * @param edges - 적용할 edge 설정
 *   - 배열: ['top', 'bottom'] - 해당 edge에 additive 모드로 적용
 *   - 객체: { top: 'maximum', bottom: 'additive' } - edge별로 모드 지정
 *   - 기본값: 모든 edge에 additive 모드
 *
 * EdgeMode:
 *   - 'off': safe area 적용 안함
 *   - 'additive': finalPadding = safeArea + padding (기본)
 *   - 'maximum': finalPadding = max(safeArea, padding)
 */
export function SafeArea({ edges, style, children, ...props }: SafeAreaProps) {
  const insets = useSafeAreaInsets();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 서버 사이드 렌더링이나 하이드레이션 전에는 기본값 사용하여 mismatch 방지
  const safeInsets = isMounted ? insets : DEFAULT_INSETS;

  const normalizedEdges: EdgesObject = Array.isArray(edges)
    ? edges.reduce((acc, edge) => ({ ...acc, [edge]: 'additive' as EdgeMode }), {})
    : (edges ?? { top: 'additive', right: 'additive', bottom: 'additive', left: 'additive' });

  const existingStyle = style ?? {};
  const parsePadding = (value: string | number | undefined): number => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') return parseFloat(value) || 0;
    return 0;
  };

  const existingPadding = {
    top: parsePadding(existingStyle.paddingTop),
    right: parsePadding(existingStyle.paddingRight),
    bottom: parsePadding(existingStyle.paddingBottom),
    left: parsePadding(existingStyle.paddingLeft),
  };

  const calculatePadding = (edge: Edge, safeAreaValue: number): number => {
    const mode = normalizedEdges[edge] ?? 'off';
    const existingValue = existingPadding[edge];

    if (mode === 'off') {
      return existingValue;
    }

    if (mode === 'maximum') {
      return Math.max(safeAreaValue, existingValue);
    }

    // 'additive'
    return safeAreaValue + existingValue;
  };

  const finalStyle: CSSProperties = {
    ...existingStyle,
    paddingTop: calculatePadding('top', safeInsets.top),
    paddingRight: calculatePadding('right', safeInsets.right),
    paddingBottom: calculatePadding('bottom', safeInsets.bottom),
    paddingLeft: calculatePadding('left', safeInsets.left),
  };

  return (
    <div {...props} style={finalStyle}>
      {children}
    </div>
  );
}

import { useSafeAreaInsets } from '@shared/lib';
import { CSSProperties } from 'react';

type EdgeMode = 'off' | 'additive' | 'maximum';
type Edge = 'top' | 'right' | 'bottom' | 'left';
type EdgesArray = Edge[];
type EdgesObject = Partial<Record<Edge, EdgeMode>>;

interface SafeAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  edges?: EdgesArray | EdgesObject;
}

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
    const mode = normalizedEdges[edge];
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
    paddingTop: calculatePadding('top', insets.top),
    paddingRight: calculatePadding('right', insets.right),
    paddingBottom: calculatePadding('bottom', insets.bottom),
    paddingLeft: calculatePadding('left', insets.left),
  };

  return (
    <div {...props} style={finalStyle}>
      {children}
    </div>
  );
}

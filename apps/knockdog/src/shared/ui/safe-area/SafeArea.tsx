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
  const normalizedEdges: EdgesObject = Array.isArray(edges)
    ? edges.reduce((acc, edge) => ({ ...acc, [edge]: 'additive' as EdgeMode }), {})
    : (edges ?? { top: 'additive', right: 'additive', bottom: 'additive', left: 'additive' });

  const existingStyle = style ?? {};

  const getEdgeValue = (edge: Edge, existingValue: string | number | undefined): string | number | undefined => {
    const mode = normalizedEdges[edge] ?? 'off';

    const valueStr =
      existingValue === undefined ? '0px' : typeof existingValue === 'number' ? `${existingValue}px` : existingValue;

    if (mode === 'off') {
      return existingValue;
    }

    const cssVar = `var(--safe-area-inset-${edge})`;

    if (mode === 'maximum') {
      return `max(${cssVar}, ${valueStr})`;
    }

    // additive
    return `calc(${cssVar} + ${valueStr})`;
  };

  const finalStyle: CSSProperties = {
    ...existingStyle,
    paddingTop: getEdgeValue('top', existingStyle.paddingTop),
    paddingRight: getEdgeValue('right', existingStyle.paddingRight),
    paddingBottom: getEdgeValue('bottom', existingStyle.paddingBottom),
    paddingLeft: getEdgeValue('left', existingStyle.paddingLeft),
  };

  return (
    <div {...props} style={finalStyle}>
      {children}
    </div>
  );
}

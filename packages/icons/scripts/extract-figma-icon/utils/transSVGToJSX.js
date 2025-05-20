/**
 * 검은색 값(#000, #000000 등)을 currentColor로 변환합니다.
 * @param {string} svgContent - SVG 문자열
 * @returns {string} 검은색이 currentColor로 변환된 SVG 문자열
 */
const replaceBlackWithCurrentColor = (svgContent) => {
  const blackColorValues = ['black', '#000', '#000000', 'rgb(0, 0, 0)'];

  let result = svgContent;
  blackColorValues.forEach((color) => {
    result = result
      .replace(new RegExp(`fill="${color}"`, 'g'), 'fill="currentColor"')
      .replace(new RegExp(`stroke="${color}"`, 'g'), 'stroke="currentColor"');
  });

  return result;
};

/**
 * SVG 속성을 JSX 호환 형식으로 변환합니다(kebab-case → camelCase).
 * @param {string} svgText - SVG 문자열
 * @returns {string} JSX 호환 속성으로 변환된 SVG 문자열
 */
const convertSvgAttributesToJsx = (svgText) => {
  const svgWithCurrentColor = replaceBlackWithCurrentColor(svgText);
  const attributesRegex = /(\S+)=["']([^"']*)["']/g;

  return svgWithCurrentColor.replace(attributesRegex, (_, attr, value) => {
    const jsxAttr = attr.replace(/[-:]([a-z])/g, (_, char) =>
      char.toUpperCase()
    );
    return `${jsxAttr}="${value}"`;
  });
};

/**
 * React 컴포넌트 템플릿을 생성합니다.
 * @param {string} componentName - 생성할 컴포넌트 이름
 * @param {string} svgAttributes - SVG 태그의 속성들
 * @param {string} svgContent - SVG 내부 콘텐츠
 * @returns {string} React 컴포넌트 코드
 */
const createSvgComponent = (componentName, svgAttributes, svgContent) => {
  return `export function ${componentName}(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      ${svgAttributes}
      {...props}
    >
      ${svgContent}
    </svg>
  );
}
`;
};

/**
 * SVG 문자열을 React 컴포넌트 문자열로 변환합니다.
 * @param {string} svgString - 원본 SVG 문자열
 * @param {string} componentName - 생성할 컴포넌트 이름
 * @returns {string} React 컴포넌트 문자열
 */
module.exports.transSVGToJSX = (svgString, componentName) => {
  const jsxCompatibleSvg = convertSvgAttributesToJsx(svgString);

  // SVG 태그의 속성만 추출
  const svgMatch = jsxCompatibleSvg.match(/<svg([^>]*)>/);
  const svgAttributes = svgMatch ? svgMatch[1].trim() : '';

  // SVG 내부 콘텐츠 추출
  const svgContent = jsxCompatibleSvg
    .replace(/<svg[^>]*>/, '')
    .replace(/<\/svg>/, '')
    .trim();

  return createSvgComponent(componentName, svgAttributes, svgContent);
};

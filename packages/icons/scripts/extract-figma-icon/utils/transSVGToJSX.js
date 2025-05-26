/**
 * SVG 스타일 문자열을 React 스타일 객체로 변환
 * @param {string} styleStr - 'property:value;property:value' 형식의 스타일 문자열
 * @returns {Object} React 스타일 객체
 */
function convertStyleStringToObject(styleStr) {
  // 스타일이 없으면 빈 객체 반환
  if (!styleStr) return {};

  const styleObj = {};

  // 여러 스타일이 있는 경우 세미콜론으로 분리
  const declarations = styleStr.split(';').filter(Boolean);

  declarations.forEach((declaration) => {
    const [property, value] = declaration.split(':').map((part) => part.trim());
    if (!property || !value) return;

    // CSS 속성을 camelCase로 변환
    // 예: mask-type -> maskType
    const camelProperty = property.replace(/-([a-z])/g, (_, letter) =>
      letter.toUpperCase()
    );

    styleObj[camelProperty] = value;
  });

  return styleObj;
}

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

  // style 속성을 객체로 변환
  const result = svgWithCurrentColor.replace(
    /style="([^"]*)"/g,
    (match, styleStr) => {
      const styleObj = convertStyleStringToObject(styleStr);
      const styleJSON = JSON.stringify(styleObj).replace(/"/g, "'");
      return `style={${styleJSON}}`;
    }
  );

  // 나머지 속성들을 JSX 형식으로 변환
  const attributesRegex = /(\S+)=["']([^"']*)["']/g;
  return result.replace(attributesRegex, (_, attr, value) => {
    // style 속성은 이미 처리했으므로 건너뛰기
    if (attr === 'style') return _;

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

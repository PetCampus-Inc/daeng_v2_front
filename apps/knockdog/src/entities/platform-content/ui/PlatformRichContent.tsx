import type { CSSProperties, ReactNode } from 'react';

function renderContent(value: unknown, keyPrefix: string): ReactNode {
  if (typeof value === 'string' || typeof value === 'number') {
    return <p key={keyPrefix} className='whitespace-pre-line'>{String(value)}</p>;
  }
  if (Array.isArray(value)) {
    return value.map((item, index) => renderContent(item, `${keyPrefix}-${index}`));
  }
  if (!value || typeof value !== 'object') return null;

  const record = value as Record<string, unknown>;
  if (typeof record.text === 'string') {
    return <p key={keyPrefix} className='whitespace-pre-line'>{record.text}</p>;
  }

  const nested = record.content ?? record.children ?? record.blocks ?? record.body;
  if (nested != null) return <div key={keyPrefix} className='flex flex-col gap-4'>{renderContent(nested, `${keyPrefix}-content`)}</div>;

  return null;
}

function PlatformRichContent({
  value,
  typography = 'body1',
  style,
}: {
  value: unknown;
  typography?: 'body1' | 'body2';
  style?: CSSProperties;
}) {
  const content = renderContent(value, 'content');
  if (!content) return null;

  return (
    <div className={`${typography === 'body2' ? 'body2-regular' : 'body1-regular'} text-text-primary flex flex-col gap-4`} style={style}>
      {content}
    </div>
  );
}

export { PlatformRichContent };

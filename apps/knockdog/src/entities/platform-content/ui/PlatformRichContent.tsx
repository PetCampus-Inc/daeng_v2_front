'use client';

import type { CSSProperties, ReactNode } from 'react';
import { overlay } from 'overlay-kit';

import {
  collectImageUrls,
  FONT_SIZES,
  IMAGE_TYPES,
  isHttpUrl,
  isRecord,
  isShowableImage,
  LINK_TYPES,
  type RichNode,
} from '../lib/richContent';

import { RichContentLink } from './RichContentLink';

import { ImageGalleryViewer } from '@shared/ui/image-gallery-viewer';

/**
 * 공지·약관 본문(Plate 블록 JSON)을 그린다. 백오피스 에디터가 만드는 블록과 서식을 지원한다.
 * - 블록: p/paragraph, h1~h6, blockquote, ul/ol/li/lic, table/tr/th/td, hr, a/link, img/image, code_block/code_line
 * - 서식: bold, italic, underline, strikethrough, fontSize(백오피스 목록의 px 값만)
 * - 이미지를 누르면 기존 사진 보기 화면(ImageGalleryViewer)에서 본문의 모든 이미지를 탭한 이미지부터 보여 준다.
 * 모르는 블록은 하위 내용만 보여 주고, 문자열 본문은 문단으로 그린다.
 */

interface RenderContext {
  /** 약관처럼 작은 글자(body2)로 그리는지 */
  compact: boolean;
  /** 본문의 이미지 URL. 확대 화면에 넘기는 순서와 같다. */
  images: string[];
}

const HEADING_CLASS: Record<string, string> = {
  h1: 'h2-extrabold',
  h2: 'h3-extrabold',
  h3: 'body1-extrabold',
  h4: 'body1-bold',
  h5: 'body1-bold',
  h6: 'body1-bold',
};
const COMPACT_HEADING_CLASS = 'body2-extrabold';
const BLOCK_CLASS = 'min-w-0 whitespace-pre-wrap [overflow-wrap:anywhere]';

/** 공지(body1)는 Figma 기준 블록 간격 20px, 약관(body2)은 기존 16px을 유지한다. */
function blockGap(compact: boolean) {
  return compact ? 'gap-4' : 'gap-5';
}

function openImageViewer(images: string[], initialIndex: number) {
  overlay.open(({ isOpen, close }) => (
    <ImageGalleryViewer
      isOpen={isOpen}
      close={close}
      images={images}
      initialIndex={initialIndex}
      ariaLabel='공지 사진 보기'
      native
      originalRatio
    />
  ));
}

function renderLeaf(leaf: RichNode, key: string): ReactNode {
  const text = leaf.text as string;
  const fontSize = typeof leaf.fontSize === 'number' && FONT_SIZES.includes(leaf.fontSize) ? leaf.fontSize : undefined;
  const decoration = [leaf.underline === true && 'underline', leaf.strikethrough === true && 'line-through']
    .filter(Boolean)
    .join(' ');
  const className = [leaf.bold === true && 'font-bold', leaf.italic === true && 'italic'].filter(Boolean).join(' ');

  if (!className && !decoration && !fontSize) return <span key={key}>{text}</span>;

  const style: CSSProperties = {};
  if (decoration) style.textDecorationLine = decoration;
  if (fontSize) style.fontSize = `${fontSize}px`;

  return (
    <span key={key} className={className || undefined} style={style}>
      {text}
    </span>
  );
}

/** 블록 안의 글자(leaf)와 링크 같은 인라인 요소를 순서대로 그린다. */
function renderChildren(children: unknown, key: string, ctx: RenderContext): ReactNode {
  if (!Array.isArray(children)) return null;

  return children.map((child, index) => {
    const childKey = `${key}-${index}`;
    if (!isRecord(child)) return null;
    if (typeof child.text === 'string' && !('children' in child)) return renderLeaf(child, childKey);
    return renderElement(child, childKey, ctx);
  });
}

function renderElement(node: RichNode, key: string, ctx: RenderContext): ReactNode {
  const type = typeof node.type === 'string' ? node.type : '';

  if (IMAGE_TYPES.includes(type)) {
    if (!isShowableImage(node)) return null;
    const url = node.url;
    return (
      <button
        key={key}
        type='button'
        aria-label='사진 크게 보기'
        className='block w-full'
        onClick={() => openImageViewer(ctx.images, Math.max(ctx.images.indexOf(url), 0))}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- 서명된 S3 URL은 next/image 호스트 설정 밖 */}
        <img src={url} alt='' loading='lazy' className='h-auto w-full' />
      </button>
    );
  }

  if (type === 'hr') return <hr key={key} className='border-line-200 my-4' />;

  const children = renderChildren(node.children, key, ctx);

  if (LINK_TYPES.includes(type)) {
    return isHttpUrl(node.url) ? (
      <RichContentLink key={key} url={node.url}>
        {children}
      </RichContentLink>
    ) : (
      <span key={key}>{children}</span>
    );
  }

  if (/^h[1-6]$/.test(type)) {
    const Heading = type as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
    return (
      <Heading key={key} className={`${ctx.compact ? COMPACT_HEADING_CLASS : HEADING_CLASS[type]} ${BLOCK_CLASS}`}>
        {children}
      </Heading>
    );
  }

  switch (type) {
    case 'blockquote':
      return (
        <blockquote key={key} className={`border-line-200 border-l-4 pl-4 ${BLOCK_CLASS}`}>
          {children}
        </blockquote>
      );
    case 'ul':
      return (
        <ul key={key} className='list-disc pl-6'>
          {children}
        </ul>
      );
    case 'ol':
      return (
        <ol key={key} className='list-decimal pl-6'>
          {children}
        </ol>
      );
    case 'li':
      return <li key={key}>{children}</li>;
    case 'lic':
      return (
        <div key={key} className={BLOCK_CLASS}>
          {children}
        </div>
      );
    case 'table':
      return (
        <div key={key} className='max-w-full overflow-x-auto'>
          <table className='w-full min-w-80 border-collapse'>
            <tbody>{children}</tbody>
          </table>
        </div>
      );
    case 'tr':
      return <tr key={key}>{children}</tr>;
    case 'th':
      return (
        <th key={key} className={`border-line-200 bg-bg-50 min-w-24 border p-2 text-left font-bold ${BLOCK_CLASS}`}>
          {children}
        </th>
      );
    case 'td':
      return (
        <td key={key} className={`border-line-200 min-w-24 border p-2 align-top ${BLOCK_CLASS}`}>
          {children}
        </td>
      );
    case 'code_block':
      return (
        <pre key={key} className='bg-bg-50 overflow-x-auto rounded-lg p-3'>
          {children}
        </pre>
      );
    case 'code_line':
      return <div key={key}>{children}</div>;
    case 'p':
    case 'paragraph':
      return (
        <p key={key} className={BLOCK_CLASS}>
          {children}
        </p>
      );
    default:
      return (
        <div key={key} className={BLOCK_CLASS}>
          {children}
        </div>
      );
  }
}

function renderContent(value: unknown, keyPrefix: string, ctx: RenderContext): ReactNode {
  if (typeof value === 'string' || typeof value === 'number') {
    return (
      <p key={keyPrefix} className='whitespace-pre-line'>
        {String(value)}
      </p>
    );
  }
  if (Array.isArray(value)) {
    return value.map((item, index) => renderContent(item, `${keyPrefix}-${index}`, ctx));
  }
  if (!isRecord(value)) return null;

  if (typeof value.type === 'string') return renderElement(value, keyPrefix, ctx);

  if (typeof value.text === 'string') return <p key={keyPrefix}>{renderLeaf(value, `${keyPrefix}-text`)}</p>;

  const nested = value.content ?? value.children ?? value.blocks ?? value.body;
  if (nested != null) {
    return (
      <div key={keyPrefix} className={`flex flex-col ${blockGap(ctx.compact)}`}>
        {renderContent(nested, `${keyPrefix}-content`, ctx)}
      </div>
    );
  }

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
  const compact = typography === 'body2';
  const content = renderContent(value, 'content', { compact, images: collectImageUrls(value) });
  if (!content) return null;

  return (
    <div
      className={`${compact ? 'body2-regular' : 'body1-regular'} text-text-primary flex flex-col ${blockGap(compact)}`}
      style={style}
    >
      {content}
    </div>
  );
}

export { PlatformRichContent };

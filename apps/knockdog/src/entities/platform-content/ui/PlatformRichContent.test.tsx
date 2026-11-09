// @vitest-environment jsdom
import { cleanup, fireEvent, render as renderDom, screen } from '@testing-library/react';
import { overlay } from 'overlay-kit';
import type { ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { PlatformRichContent } from './PlatformRichContent';

vi.mock('@shared/lib/bridge', () => ({ useOpenExternalLink: () => vi.fn() }));
vi.mock('overlay-kit', () => ({ overlay: { open: vi.fn() } }));
vi.mock('@shared/ui/image-gallery-viewer', () => ({
  ImageGalleryViewer: ({
    images,
    initialIndex,
    native,
  }: {
    images: string[];
    initialIndex: number;
    native?: boolean;
  }) => (
    <div data-testid='viewer' data-images={images.join(',')} data-index={initialIndex} data-native={String(native)} />
  ),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const render = (blocks: unknown[], typography?: 'body1' | 'body2') =>
  renderToStaticMarkup(<PlatformRichContent value={{ schemaVersion: 1, blocks }} typography={typography} />);

const paragraph = (...children: unknown[]) => ({ type: 'paragraph', children });

describe('PlatformRichContent', () => {
  test('이미지 블록은 서버가 내려준 URL로 그린다', () => {
    const html = render([
      paragraph({ text: '본문' }),
      { type: 'img', children: [{ text: '' }], imageId: 1, url: 'https://example.com/a.jpeg?X-Amz=1' },
    ]);

    expect(html).toContain('<img src="https://example.com/a.jpeg?X-Amz=1"');
    expect(html).toContain('본문');
  });

  test('이미지를 누르면 본문의 모든 이미지를 탭한 이미지부터 사진 보기 화면에 넘긴다', () => {
    const image = (url: string) => ({ type: 'img', children: [{ text: '' }], imageId: 1, url });
    const body = {
      schemaVersion: 1,
      blocks: [image('https://e.com/1.jpg'), paragraph({ text: '사이' }), image('https://e.com/2.jpg')],
    };
    renderDom(<PlatformRichContent value={body} />);

    const buttons = screen.getAllByRole('button', { name: /크게 보기$/ });
    expect(buttons).toHaveLength(2);
    fireEvent.click(buttons.at(1)!);

    expect(overlay.open).toHaveBeenCalledTimes(1);
    const controller = vi.mocked(overlay.open).mock.calls[0]![0] as (props: {
      isOpen: boolean;
      close: () => void;
    }) => ReactElement;
    const viewer = renderToStaticMarkup(controller({ isOpen: true, close: vi.fn() }));
    expect(viewer).toContain('data-images="https://e.com/1.jpg,https://e.com/2.jpg"');
    expect(viewer).toContain('data-index="1"');
    expect(viewer).toContain('data-native="true"');
  });

  test('이미지가 여러 장이면 버튼 이름에 순서를 넣어 구분하고, 한 장이면 순서를 넣지 않는다', () => {
    const image = (url: string) => ({ type: 'img', children: [{ text: '' }], imageId: 1, url });
    const { unmount } = renderDom(
      <PlatformRichContent
        value={{ schemaVersion: 1, blocks: [image('https://e.com/1.jpg'), image('https://e.com/2.jpg')] }}
      />
    );

    expect(screen.getByRole('button', { name: '사진 1/2 크게 보기' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '사진 2/2 크게 보기' })).toBeTruthy();
    unmount();

    renderDom(<PlatformRichContent value={{ schemaVersion: 1, blocks: [image('https://e.com/1.jpg')] }} />);
    expect(screen.getByRole('button', { name: '사진 크게 보기' })).toBeTruthy();
  });

  test('children이 없고 text만 있는 노드도 글자를 잃지 않고 해당 블록 모양으로 그린다', () => {
    const html = renderToStaticMarkup(
      <PlatformRichContent
        value={{
          schemaVersion: 1,
          blocks: [
            { type: 'paragraph', text: '평문 문단' },
            { type: 'h2', text: '제목 노드', bold: true },
            { type: 'text', text: '타입 text 노드' },
          ],
        }}
      />
    );

    expect(html).toContain('평문 문단');
    expect(html).toContain('타입 text 노드');
    expect(html).toMatch(/<h2[^>]*><span[^>]*>제목 노드<\/span><\/h2>/);
    expect(html).toContain('font-bold');
  });

  test('children 안의 문자열도 글자를 잃지 않는다', () => {
    const html = render([{ type: 'paragraph', children: ['문자열 자식', { text: ' 그리고 노드' }] }]);

    expect(html).toContain('문자열 자식');
    expect(html).toContain(' 그리고 노드');
    expect(html.match(/<p /g)).toHaveLength(1);
  });

  test('사용할 수 없는 이미지와 http가 아닌 URL은 그리지 않는다', () => {
    const html = render([
      { type: 'image', children: [{ text: '' }], imageId: 1, url: null, unavailable: true },
      { type: 'img', children: [{ text: '' }], imageId: 2, url: 'javascript:alert(1)' },
    ]);

    expect(html).not.toContain('<img');
  });

  test('한 문단 안의 서식 구간은 줄이 갈라지지 않고 서식을 유지한다', () => {
    const html = render([
      paragraph(
        { text: '안녕 ' },
        { text: '굵게', bold: true },
        { text: ' 그리고 ' },
        { text: '밑줄', underline: true }
      ),
    ]);

    expect(html.match(/<p /g)).toHaveLength(1);
    expect(html).toContain('font-bold');
    expect(html).toContain('text-decoration-line:underline');
  });

  test('백오피스 글자 크기 목록 밖의 값은 무시한다', () => {
    const html = render([paragraph({ text: '크게', fontSize: 20 }, { text: '이상한', fontSize: 999 })]);

    expect(html).toContain('font-size:20px');
    expect(html).not.toContain('999');
  });

  test('제목, 목록, 표, 구분선을 의미에 맞는 태그로 그린다', () => {
    const html = render([
      { type: 'h2', children: [{ text: '제목' }] },
      { type: 'ul', children: [{ type: 'li', children: [{ type: 'lic', children: [{ text: '항목' }] }] }] },
      { type: 'ol', children: [{ type: 'li', children: [{ type: 'lic', children: [{ text: '순서' }] }] }] },
      {
        type: 'table',
        children: [
          {
            type: 'tr',
            children: [
              { type: 'th', children: [{ type: 'p', children: [{ text: '머리' }] }] },
              { type: 'td', children: [{ type: 'p', children: [{ text: '칸' }] }] },
            ],
          },
        ],
      },
      { type: 'hr', children: [{ text: '' }] },
    ]);

    expect(html).toContain('<h2');
    expect(html).toContain('<ul');
    expect(html).toContain('<ol');
    expect(html).toContain('<table');
    expect(html).toContain('<th');
    expect(html).toContain('<td');
    expect(html).toContain('<hr');
  });

  test('http(s) 링크만 링크로 그리고 그 외 주소는 글자만 남긴다', () => {
    const html = render([
      paragraph(
        { text: '문의: ' },
        { type: 'a', url: 'https://knockdog.net', children: [{ text: '링크' }] },
        { type: 'a', url: 'javascript:alert(1)', children: [{ text: '위험' }] }
      ),
    ]);

    expect(html).toContain('href="https://knockdog.net"');
    expect(html).toContain('위험');
    expect(html).not.toContain('javascript:');
  });

  test('약관용 body2에서는 제목이 본문보다 커지지 않는다', () => {
    const html = render([{ type: 'h1', children: [{ text: '제1조' }] }], 'body2');

    expect(html).toContain('body2-extrabold');
    expect(html).not.toContain('h2-extrabold');
  });

  test('문자열 본문과 알 수 없는 블록의 내용은 그대로 보여 준다', () => {
    expect(renderToStaticMarkup(<PlatformRichContent value={'줄1\n줄2'} />)).toContain('줄1\n줄2');
    expect(render([{ type: 'infoBox', children: [{ text: '안내' }] }])).toContain('안내');
  });

  test('블록 간격은 공지 20px, 약관 16px이다', () => {
    expect(render([paragraph({ text: '공지' })])).toContain('gap-5');
    expect(render([paragraph({ text: '약관' })], 'body2')).toContain('gap-4');
  });

  test('비어 있는 본문은 아무것도 그리지 않는다', () => {
    expect(renderToStaticMarkup(<PlatformRichContent value={null} />)).toBe('');
  });
});

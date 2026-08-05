import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_HOST_SUFFIXES = ['.amazonaws.com', '.cloudfront.net'] as const;

function getAllowedHosts() {
  const hosts = new Set<string>(['kindergarten-image-bucket.s3.ap-northeast-2.amazonaws.com']);

  const imageBaseUrl = process.env.NEXT_PUBLIC_IMAGE_BASE_URL;
  if (imageBaseUrl) {
    try {
      hosts.add(new URL(imageBaseUrl).hostname);
    } catch {
      // ignore invalid env
    }
  }

  return hosts;
}

function isAllowedImageUrl(rawUrl: string) {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return false;
  }

  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return false;

  const hostname = parsed.hostname.toLowerCase();
  const allowedHosts = getAllowedHosts();

  if (allowedHosts.has(hostname)) return true;

  return ALLOWED_HOST_SUFFIXES.some((suffix) => hostname.endsWith(suffix));
}

function sanitizeFileName(fileName: string) {
  const baseName = fileName.replace(/\\/g, '/').split('/').pop()?.trim() || '';
  const safeName = baseName.replace(/[^\w.\uac00-\ud7a3-]+/g, '_');

  if (!safeName || safeName === '.' || safeName === '..') {
    return `knockdog-${Date.now()}.jpg`;
  }

  return safeName;
}

/**
 * 웹 이미지 다운로드 프록시
 * - 브라우저→S3 CORS 우회
 * - Content-Disposition: attachment 로 저장 유도
 */
export async function GET(request: NextRequest) {
  const rawUrl = request.nextUrl.searchParams.get('url');
  const rawFileName = request.nextUrl.searchParams.get('fileName');

  if (!rawUrl) {
    return NextResponse.json({ message: 'url is required' }, { status: 400 });
  }

  if (!isAllowedImageUrl(rawUrl)) {
    return NextResponse.json({ message: 'url is not allowed' }, { status: 400 });
  }

  try {
    const upstream = await fetch(rawUrl, {
      method: 'GET',
      cache: 'no-store',
      headers: {
        Accept: 'image/*,*/*',
      },
    });

    if (!upstream.ok || !upstream.body) {
      return NextResponse.json(
        { message: `upstream fetch failed (${upstream.status})` },
        { status: 502 }
      );
    }

    const contentType = upstream.headers.get('content-type') || 'application/octet-stream';
    const fileName = sanitizeFileName(rawFileName || `knockdog-${Date.now()}.jpg`);
    const encodedFileName = encodeURIComponent(fileName);

    return new NextResponse(upstream.body, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${fileName}"; filename*=UTF-8''${encodedFileName}`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('[api/media/download] error', error);
    return NextResponse.json({ message: 'failed to download image' }, { status: 500 });
  }
}

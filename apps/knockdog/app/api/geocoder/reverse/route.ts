import { NextRequest, NextResponse } from 'next/server';

const GEOCODER_API_KEY = process.env.GEOCODER_API_KEY;
const VWORLD_API_URL = 'https://api.vworld.kr/req/address';

export async function GET(request: NextRequest) {
  try {
    if (!GEOCODER_API_KEY) {
      return NextResponse.json({ error: 'GEOCODER_API_KEY is not set' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const format = (searchParams.get('format') ?? 'json').toLowerCase();
    const type = searchParams.get('type') ?? 'both';

    if (!lat || !lng) {
      return NextResponse.json({ error: 'lat and lng are required' }, { status: 400 });
    }

    const apiUrl = new URL(VWORLD_API_URL);
    apiUrl.searchParams.set('service', 'address');
    apiUrl.searchParams.set('request', 'getAddress');
    apiUrl.searchParams.set('version', '2.0');
    apiUrl.searchParams.set('crs', 'epsg:4326');
    apiUrl.searchParams.set('point', `${lng},${lat}`);
    apiUrl.searchParams.set('format', format === 'xml' ? 'xml' : 'json');
    apiUrl.searchParams.set('type', type);
    apiUrl.searchParams.set('zipcode', 'true');
    apiUrl.searchParams.set('simple', 'false');
    apiUrl.searchParams.set('key', GEOCODER_API_KEY);

    {
      const safeLogUrl = new URL(apiUrl.toString());
      safeLogUrl.searchParams.set('key', '********');
      console.log('[VWorld ReverseGeocode] GET', safeLogUrl.toString());
    }

    const response = await fetch(apiUrl.toString());

    if (!response.ok) {
      throw new Error(`VWorld API error: ${response.status}`);
    }

    if (format === 'xml') {
      const text = await response.text();
      return new NextResponse(text, {
        headers: { 'Content-Type': 'application/xml; charset=utf-8' },
      });
    }

    const data = await response.json();

    // VWorld 응답의 result가 배열이거나 객체 내부 items 배열인 케이스 모두를 표준화
    const vworldResult = data?.response?.result as unknown;
    let items: unknown[] = [];
    if (Array.isArray(vworldResult)) {
      items = vworldResult as unknown[];
    } else if (
      vworldResult &&
      typeof vworldResult === 'object' &&
      'items' in (vworldResult as Record<string, unknown>) &&
      Array.isArray((vworldResult as { items?: unknown[] }).items)
    ) {
      items = ((vworldResult as { items?: unknown[] }).items ?? []) as unknown[];
    }

    return NextResponse.json({ result: items });
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return NextResponse.json(
      { error: 'Reverse geocoding failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

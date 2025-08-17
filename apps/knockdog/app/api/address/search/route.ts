import { NextRequest, NextResponse } from 'next/server';
import type { AddressSearchParams, AddressSearchResult, AddressSearchError } from './types';

const JUSO_API_KEY = process.env.JUSO_API_KEY || 'devU01TX0FVVEgyMDI1MDgxNTE5NTgxNTExNjA3NDE=';
const JUSO_API_URL = 'https://business.juso.go.kr/addrlink/addrLinkApi.do';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // 필수 파라미터 검증
    const keyword = searchParams.get('keyword');
    if (!keyword || keyword.trim() === '') {
      return NextResponse.json({ error: '검색어는 필수입니다.' } as AddressSearchError, { status: 400 });
    }

    // 파라미터 파싱 및 기본값 설정
    const params: AddressSearchParams = {
      keyword: keyword.trim(),
      currentPage: searchParams.get('currentPage') ?? '1',
      countPerPage: searchParams.get('countPerPage') ?? '10',
      resultType: 'json', // JSON 응답 요청
      hstryYn: (searchParams.get('hstryYn') as 'Y' | 'N') ?? 'N',
      firstSort: (searchParams.get('firstSort') as 'none' | 'road' | 'location') ?? 'none',
      addInfoYn: (searchParams.get('addInfoYn') as 'Y' | 'N') ?? 'N',
    };

    // 도로명주소 API 호출
    const apiUrl = new URL(JUSO_API_URL);
    apiUrl.searchParams.set('confmKey', JUSO_API_KEY);
    apiUrl.searchParams.set('currentPage', params.currentPage);
    apiUrl.searchParams.set('countPerPage', params.countPerPage);
    apiUrl.searchParams.set('keyword', params.keyword);
    apiUrl.searchParams.set('resultType', params.resultType);
    apiUrl.searchParams.set('hstryYn', params.hstryYn);
    apiUrl.searchParams.set('firstSort', params.firstSort);
    apiUrl.searchParams.set('addInfoYn', params.addInfoYn);

    console.log('도로명주소 API 호출:', apiUrl.toString());

    const response = await fetch(apiUrl.toString(), {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`도로명주소 API 오류: ${response.status}`);
    }

    const data: AddressSearchResult = await response.json();
    console.log('도로명주소 API 응답:', JSON.stringify(data, null, 2));

    // 에러 코드 확인
    if (data.results.common.errorCode !== '0') {
      return NextResponse.json(
        {
          error: '주소 검색에 실패했습니다.',
          details: data.results.common.errorMessage,
        } as AddressSearchError,
        { status: 400 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('주소 검색 API 오류:', error);

    return NextResponse.json(
      {
        error: '주소 검색에 실패했습니다.',
        details: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
      } as AddressSearchError,
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 필수 파라미터 검증
    if (!body.keyword || body.keyword.trim() === '') {
      return NextResponse.json({ error: '검색어는 필수입니다.' } as AddressSearchError, { status: 400 });
    }

    // 파라미터 파싱 및 기본값 설정
    const params: AddressSearchParams = {
      keyword: body.keyword.trim(),
      currentPage: body.currentPage?.toString() ?? '1',
      countPerPage: body.countPerPage?.toString() ?? '10',
      resultType: 'json', // JSON 응답 요청
      hstryYn: body.hstryYn ?? 'N',
      firstSort: body.firstSort ?? 'none',
      addInfoYn: body.addInfoYn ?? 'N',
    };

    // 도로명주소 API 호출
    const apiUrl = new URL(JUSO_API_URL);
    apiUrl.searchParams.set('confmKey', JUSO_API_KEY);
    apiUrl.searchParams.set('currentPage', params.currentPage);
    apiUrl.searchParams.set('countPerPage', params.countPerPage);
    apiUrl.searchParams.set('keyword', params.keyword);
    apiUrl.searchParams.set('resultType', params.resultType);
    apiUrl.searchParams.set('hstryYn', params.hstryYn);
    apiUrl.searchParams.set('firstSort', params.firstSort);
    apiUrl.searchParams.set('addInfoYn', params.addInfoYn);

    console.log('도로명주소 API 호출 (POST):', apiUrl.toString());

    const response = await fetch(apiUrl.toString(), {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`도로명주소 API 오류: ${response.status}`);
    }

    const data: AddressSearchResult = await response.json();
    console.log('도로명주소 API 응답 (POST):', JSON.stringify(data, null, 2));

    // 에러 코드 확인
    if (data.results.common.errorCode !== '0') {
      return NextResponse.json(
        {
          error: '주소 검색에 실패했습니다.',
          details: data.results.common.errorMessage,
        } as AddressSearchError,
        { status: 400 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('주소 검색 API 오류:', error);

    return NextResponse.json(
      {
        error: '주소 검색에 실패했습니다.',
        details: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
      } as AddressSearchError,
      { status: 500 }
    );
  }
}

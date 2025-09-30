const checkOptions = [
  { key: 'closed', title: '폐업한 가게에요!', description: '폐업 전경, 안내문 등 폐업 사실을 보여주는 사진' },
  {
    key: 'price',
    title: '상품 및 가격 정보가 달라요!',
    description: '가격표, 전단지 등 최신 상품 및 가격 정보를 보여주는 사진',
  },
  { key: 'phone', title: '전화번호가 달라요!', description: '명함, 간판, 전단지 등 현재 전화번호를 보여주는 사진' },
  { key: 'time', title: '영업시간이 달라요!', description: '영업시간을 보여주는 사진' },
  { key: 'address', title: '주소가 달라요!', description: '주소 정보를 입력해 주세요' },
] as const;

export { checkOptions };

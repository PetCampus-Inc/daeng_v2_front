export interface ReverseGeocodeResponse {
  data: {
    documents: [
      {
        address: {
          address_name: string;
          region_1depth_name: string; // 시/도
          region_2depth_name: string; // 시/군/구
          region_3depth_name: string; // 읍/면/동
        };
        road_address: string | null;
      },
    ];
  };
}

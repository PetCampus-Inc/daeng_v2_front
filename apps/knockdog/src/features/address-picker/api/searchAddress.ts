import { api, ApiResponse } from '@shared/api';
import { AddressSearchResponse } from '../model/address';
import { LatLng } from '@entities/address';

const searchAddress = async (query: string, size: number = 10): Promise<ApiResponse<AddressSearchResponse>> => {
  const response = await api.get(`address/search`, {
    searchParams: { query, size },
  });

  return response.json();
};

const getGeocode = async (address: string): Promise<LatLng> => {
  const response = await api.get(`address/geo`, { searchParams: { address } });

  const { data, code, message } = await response.json<ApiResponse<LatLng>>();
  if (code !== 'SUCCESS') throw new Error(message);

  return data;
};

export { searchAddress, getGeocode };

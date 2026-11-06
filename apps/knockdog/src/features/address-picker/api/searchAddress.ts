import { api, ApiResponse } from '@shared/api';
import { AddressSearchResponse, ReverseGeocodeResponse } from '../model/address';
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

const getReverseGeocode = async (lat: number, lng: number): Promise<ReverseGeocodeResponse> => {
  const response = await api.get(`address/reverse-geo`, { searchParams: { lat, lng } });

  const { data, code, message } = await response.json<ApiResponse<ReverseGeocodeResponse>>();
  if (code !== 'SUCCESS') throw new Error(message);

  return data;
};

export { searchAddress, getGeocode, getReverseGeocode };

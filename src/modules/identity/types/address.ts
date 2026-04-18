export interface AddressDto {
  id: number;
  recipientName: string;
  phone: string;
  fullAddress: string;
  addressDetail: string;
  province: string;
  district: string;
  commune: string;
  latitude?: number | null;
  longitude?: number | null;
  isDefault: boolean;
}

export interface AddressFormRequest {
  recipientName: string;
  phoneNumber: string;
  addressDetail: string;
  province: string;
  district: string;
  commune: string;
  latitude?: number | null;
  longitude?: number | null;
  isDefault: boolean;
}

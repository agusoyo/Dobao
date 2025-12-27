
export interface AdditionalServices {
  catering: boolean;
  cleaning: boolean;
  multimedia: boolean;
  vinoteca: boolean;
}

export interface Reservation {
  id: string;
  date: string;
  customerName: string;
  email: string;
  phone: string;
  guests: number;
  purpose: string;
  status: ReservationStatus;
  services: AdditionalServices;
  createdAt: string;
}

export enum ReservationStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED'
}

export interface TxokoConfig {
  name: string;
  address: string;
  maxCapacity: number;
  pricePerDay: number;
}

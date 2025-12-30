
export enum ReservationSlot {
  MIDDAY = 'MIDDAY',
  NIGHT = 'NIGHT'
}

export interface AdditionalServices {
  catering: boolean;
  cleaning: boolean;
  multimedia: boolean;
  vinoteca: boolean;
  beerEstrella: boolean;
  beer1906: boolean;
}

export interface Reservation {
  id: string;
  date: string;
  slot: ReservationSlot;
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

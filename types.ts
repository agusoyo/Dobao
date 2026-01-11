
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
  comments?: string;
  eventCost?: number;
  status: ReservationStatus;
  services: AdditionalServices;
  createdAt: string;
}

export interface WineTasting {
  id: string;
  date: string;
  slot: ReservationSlot; 
  name: string;
  maxCapacity: number;
  pricePerPerson: number;
  description: string;
  createdAt?: string;
  currentAttendees?: number; 
}

export interface TastingAttendee {
  id: string;
  tastingId: string;
  name: string;
  email: string;
  phone: string;
  seats: number;
  createdAt: string;
  deposit?: number; // Nuevo: Dinero entregado manualmente
}

export enum ReservationStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED'
}

export interface TxokoConfig {
  name: string;
  address: string;
  phone: string;
  maxCapacity: number;
  pricePerDay: number;
}

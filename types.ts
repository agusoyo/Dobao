
export interface Reservation {
  id: string;
  date: string; // ISO format YYYY-MM-DD
  customerName: string;
  email: string;
  phone: string;
  guests: number;
  purpose: string;
  status: ReservationStatus;
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

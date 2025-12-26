
import { Reservation, ReservationStatus, TxokoConfig } from './types';

export const TXOKO_CONFIG: TxokoConfig = {
  name: "Dobao Gourmet",
  address: "Calle de la Gastronomía 8, San Sebastián",
  maxCapacity: 35,
  pricePerDay: 180
};

export const INITIAL_RESERVATIONS: Reservation[] = [
  {
    id: '1',
    date: '2024-05-20',
    customerName: 'Jon Ander',
    email: 'jon@example.com',
    phone: '600123456',
    guests: 15,
    purpose: 'Cena de Cuadrilla',
    status: ReservationStatus.CONFIRMED,
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    date: '2024-05-25',
    customerName: 'Miren Agirre',
    email: 'miren@example.com',
    phone: '655987321',
    guests: 20,
    purpose: 'Evento Corporativo',
    status: ReservationStatus.PENDING,
    createdAt: new Date().toISOString()
  }
];

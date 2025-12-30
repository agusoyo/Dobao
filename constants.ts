
import { Reservation, ReservationStatus, TxokoConfig, ReservationSlot } from './types';

export const TXOKO_CONFIG: TxokoConfig = {
  name: "Dobao Gourmet",
  address: "Rúa do Príncipe 12, Vigo",
  maxCapacity: 35,
  pricePerDay: 180
};

export const INITIAL_RESERVATIONS: Reservation[] = [
  {
    id: '1',
    date: '2025-05-20',
    slot: ReservationSlot.NIGHT,
    customerName: 'Manuel Souto',
    email: 'manuel@example.com',
    phone: '600123456',
    guests: 15,
    purpose: 'Cena de amigos',
    status: ReservationStatus.CONFIRMED,
    services: { 
      catering: false, 
      cleaning: true, 
      multimedia: false, 
      vinoteca: true,
      beerEstrella: true,
      beer1906: false
    },
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    date: '2025-05-25',
    slot: ReservationSlot.MIDDAY,
    customerName: 'Carmen Rey',
    email: 'carmen@example.com',
    phone: '655987321',
    guests: 20,
    purpose: 'Presentación de Producto',
    status: ReservationStatus.PENDING,
    services: { 
      catering: true, 
      cleaning: true, 
      multimedia: true, 
      vinoteca: true,
      beerEstrella: false,
      beer1906: true
    },
    createdAt: new Date().toISOString()
  }
];

import { User } from './user.model';
import { Screening } from './screening.model';
import { Seat } from './screening.model';

export enum ReservationStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED'
}

export interface Reservation {
  id?: number;
  reservationDate: string;
  status: ReservationStatus;
  user: User;
  screening: Screening;
  seatReservations: SeatReservation[];
}

export interface SeatReservation {
  id?: number;
  reservation?: Reservation;
  seat: Seat;
}

export interface ReservationCreateDTO {
  userId: number;
  screeningId: number;
  seatIds: number[];
}

export interface SeatModificationDTO {
  addSeatIds: number[];
  removeSeatIds: number[];
}

import { Seat } from './screening.model';

export interface Room {
  id?: number;
  number: number;
  capacity: number;
  rows: number;
  columns: number;
  seats?: Seat[];
  screenings?: any[];
}

export interface RoomBasicDTO {
  id: number;
  number: number;
  capacity: number;
  rows: number;
  columns: number;
} 
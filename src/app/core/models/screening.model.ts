import { Movie } from "./movie.model";

export interface Screening {
    id?: number;
    date: string;
    startTime: string;
    price: number;
    roomId: number;
    movieId: number;
    room?: Room;
    movie?: Movie;
  }
  
  export interface Room {
    id?: number;
    number: number;
    capacity: number;
    roomType?: string;
    seats?: Seat[];
  }
  
  export interface Seat {
    id?: number;
    row: string;
    number: number;
    roomId: number;
  }
  
  export interface SeatReservation {
    id?: number;
    reservationId: number;
    seatId: number;
    screeningId: number;
  }
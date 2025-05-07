import { Movie } from "./movie.model";

export interface Screening {
    id?: number;
    startTime: string;
    endTime: string;
    ticketPrice: number;
    roomId?: number;
    movieId?: number;
    room?: Room;
    movie?: Movie;
    is3D?: boolean;
    hasSubtitles?: boolean;
    language?: string;
    format?: string;
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

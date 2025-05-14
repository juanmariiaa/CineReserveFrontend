import { Movie } from "./movie.model";
import { Room } from "./room.model";

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

export interface ScreeningBasicDTO {
    id: number;
    movieId: number;
    movieTitle: string;
    roomId: number;
    roomNumber: number;
    startTime: string;
    endTime: string;
    ticketPrice: number;
    is3D: boolean;
    hasSubtitles: boolean;
    language: string;
    format: string;
    availableSeats: number;
    capacity: number;
  }

  export interface Seat {
    id?: number;
    rowLabel: string;
    columnNumber: number;
    roomId?: number;
  }

  export interface SeatReservation {
    id?: number;
    reservationId: number;
    seatId: number;
    screeningId: number;
  }

import { Movie } from "./movie.model";

export interface MovieWithScreenings {
  movie: Movie;
  screeningTimes: ScreeningTime[];
}

export interface ScreeningTime {
  screeningId: number;
  time: string; // Time in format HH:MM
  format: string;
  is3D: boolean;
  hasSubtitles: boolean;
  roomNumber: number;
  ticketPrice: number;
} 
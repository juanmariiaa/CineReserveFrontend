import { Screening } from "./screening.model";

export interface Movie {
    id?: number;
    title: string;
    durationMinutes?: number;
    description?: string;
    releaseDate?: string;
    posterUrl?: string;
    backdropUrl?: string;
    rating?: string;
    language?: string;
    director?: string;
    trailerUrl?: string;
    tmdbId: number;
    imdbId?: string;
    isActive?: boolean;
    popularity?: number;
    voteAverage?: number;
    voteCount?: number;
    genres?: Genre[];
    screenings?: Screening[];
  }
  
  export interface Genre {
    id?: number;
    name: string;
    tmdbGenreId?: number;
  }
  
  export interface MovieSearchResult {
    id: number;
    title: string;
    overview?: string;
    releaseDate?: string;
    posterPath?: string;
    voteAverage?: number;
  }
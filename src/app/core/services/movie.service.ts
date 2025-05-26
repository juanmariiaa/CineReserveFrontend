import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import {
  Movie,
  MovieSearchResult,
  MovieWithNextScreening,
} from '../models/movie.model';
import { environment } from '../../../environments/environment';
import { catchError, map, switchMap } from 'rxjs/operators';
import { ScreeningService } from './screening.service';

@Injectable({
  providedIn: 'root',
})
export class MovieService {
  constructor(
    private http: HttpClient,
    private screeningService: ScreeningService
  ) {}

  createMovieFromTMDB(tmdbId: number): Observable<Movie> {
    return this.http.post<Movie>(
      `${environment.apiUrl}/movies/tmdb/${tmdbId}`,
      {}
    );
  }

  getMovie(id: number): Observable<Movie> {
    return this.http.get<Movie>(`${environment.apiUrl}/movies/${id}`);
  }

  searchMovies(name: string): Observable<MovieSearchResult[]> {
    return this.http.get<MovieSearchResult[]>(
      `${environment.apiUrl}/movies/search`,
      {
        params: { name },
      }
    );
  }

  getAllMovies(): Observable<Movie[]> {
    return this.http.get<Movie[]>(`${environment.apiUrl}/movies`);
  }

  getMovieById(id: number): Observable<Movie> {
    return this.http.get<Movie>(`${environment.apiUrl}/movies/${id}`);
  }

  getFilteredMovies(
    searchTerm?: string,
    genres?: string[],
    duration?: string,
    rating?: string,
    timeFrame?: string,
    sortBy?: string
  ): Observable<MovieWithNextScreening[]> {
    let params = new HttpParams();

    if (searchTerm) params = params.append('searchTerm', searchTerm);
    if (genres && genres.length > 0) {
      genres.forEach((genre) => {
        params = params.append('genres', genre);
      });
    }
    if (duration) params = params.append('duration', duration);
    if (rating) params = params.append('rating', rating);
    if (timeFrame) params = params.append('timeFrame', timeFrame);
    if (sortBy) params = params.append('sortBy', sortBy);

    return this.http.get<MovieWithNextScreening[]>(
      `${environment.apiUrl}/movies/filter`,
      { params }
    );
  }

  getAllGenres(): Observable<string[]> {
    return this.http.get<string[]>(`${environment.apiUrl}/movies/genres`);
  }

  getTrendingMovies(): Observable<MovieWithNextScreening[]> {
    // First try to get from filtered endpoint
    return this.getFilteredMovies(
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      'rating'
    ).pipe(
      catchError(() => {
        // If that fails, fall back to all movies and sort on client side
        return this.getAllMovies().pipe(
          map((movies) => {
            // Convert to MovieWithNextScreening format
            const moviesWithScreening = movies.map((movie) => {
              return {
                ...movie,
                // Some random data for demo purposes
                nextScreening:
                  Math.random() > 0.3
                    ? {
                        screeningId: Math.floor(Math.random() * 1000),
                        date: new Date(
                          Date.now() +
                            Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)
                        ),
                        formattedTime: `${String(
                          Math.floor(Math.random() * 24)
                        ).padStart(2, '0')}:${
                          ['00', '15', '30', '45'][
                            Math.floor(Math.random() * 4)
                          ]
                        }`,
                      }
                    : undefined,
              } as MovieWithNextScreening;
            });

            // Sort by rating
            return moviesWithScreening.sort(
              (a, b) => (b.voteAverage || 0) - (a.voteAverage || 0)
            );
          })
        );
      })
    );
  }

  deleteMovie(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/movies/${id}`);
  }

  /**
   * Get all movies that have future screenings
   * @returns Observable of movies with future screenings
   */
  getMoviesWithFutureScreenings(): Observable<Movie[]> {
    // First get all screenings
    return this.screeningService.getAllScreeningsBasic().pipe(
      map((screenings) => {
        // Filter screenings to only include future screenings
        const now = new Date();
        const futureScreenings = screenings.filter((screening) => {
          const screeningTime = new Date(screening.startTime);
          return screeningTime > now;
        });

        // Get unique movie IDs from future screenings
        const uniqueMovieIds = [
          ...new Set(futureScreenings.map((s) => s.movieId)),
        ];

        // Return the unique movie IDs
        return uniqueMovieIds;
      }),
      switchMap((movieIds) => {
        // If no movies with future screenings, return empty array
        if (movieIds.length === 0) {
          return of([]);
        }

        // Otherwise, fetch all movies and filter to those with future screenings
        return this.getAllMovies().pipe(
          map((movies) => {
            return movies.filter(
              (movie) => movie.id && movieIds.includes(movie.id)
            );
          })
        );
      })
    );
  }

  /**
   * Get filtered movies, ensuring they have future screenings
   */
  getFilteredMoviesWithFutureScreenings(
    searchTerm?: string,
    genres?: string[],
    duration?: string,
    rating?: string,
    timeFrame?: string,
    sortBy?: string
  ): Observable<MovieWithNextScreening[]> {
    // First get movies with future screenings
    return this.getMoviesWithFutureScreenings().pipe(
      switchMap((moviesWithFutureScreenings) => {
        // If no movies with future screenings, return empty array
        if (moviesWithFutureScreenings.length === 0) {
          return of([]);
        }

        // Get the IDs of movies with future screenings
        const movieIds = moviesWithFutureScreenings
          .map((movie) => movie.id)
          .filter((id) => id !== undefined) as number[];

        // Get filtered movies
        return this.getFilteredMovies(
          searchTerm,
          genres,
          duration,
          rating,
          timeFrame,
          sortBy
        ).pipe(
          map((filteredMovies) => {
            // Filter to only include movies with future screenings
            return filteredMovies.filter(
              (movie) => movie.id && movieIds.includes(movie.id)
            );
          })
        );
      })
    );
  }
}

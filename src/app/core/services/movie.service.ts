import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Movie, MovieSearchResult, MovieWithNextScreening } from '../models/movie.model';
import { environment } from '../../../environments/environment';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class MovieService {
  constructor(private http: HttpClient) {}

  createMovieFromTMDB(tmdbId: number): Observable<Movie> {
    return this.http.post<Movie>(`${environment.apiUrl}/movies/tmdb/${tmdbId}`, {});
  }

  getMovie(id: number): Observable<Movie> {
    return this.http.get<Movie>(`${environment.apiUrl}/movies/${id}`);
  }

  searchMovies(name: string): Observable<MovieSearchResult[]> {
    return this.http.get<MovieSearchResult[]>(`${environment.apiUrl}/movies/search`, {
      params: { name }
    });
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
      genres.forEach(genre => {
        params = params.append('genres', genre);
      });
    }
    if (duration) params = params.append('duration', duration);
    if (rating) params = params.append('rating', rating);
    if (timeFrame) params = params.append('timeFrame', timeFrame);
    if (sortBy) params = params.append('sortBy', sortBy);
    
    return this.http.get<MovieWithNextScreening[]>(`${environment.apiUrl}/movies/filter`, { params });
  }
  
  getAllGenres(): Observable<string[]> {
    return this.http.get<string[]>(`${environment.apiUrl}/movies/genres`);
  }
  
  getTrendingMovies(): Observable<MovieWithNextScreening[]> {
    // First try to get from filtered endpoint
    return this.getFilteredMovies(undefined, undefined, undefined, undefined, undefined, 'rating')
      .pipe(
        catchError(() => {
          // If that fails, fall back to all movies and sort on client side
          return this.getAllMovies().pipe(
            map(movies => {
              // Convert to MovieWithNextScreening format
              const moviesWithScreening = movies.map(movie => {
                return {
                  ...movie,
                  // Some random data for demo purposes
                  nextScreening: Math.random() > 0.3 ? {
                    screeningId: Math.floor(Math.random() * 1000),
                    date: new Date(Date.now() + Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)),
                    formattedTime: `${String(Math.floor(Math.random() * 24)).padStart(2, '0')}:${['00', '15', '30', '45'][Math.floor(Math.random() * 4)]}`
                  } : undefined
                } as MovieWithNextScreening;
              });

              // Sort by rating
              return moviesWithScreening.sort((a, b) => (b.voteAverage || 0) - (a.voteAverage || 0));
            })
          );
        })
      );
  }

  deleteMovie(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/movies/${id}`);
  }
}

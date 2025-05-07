import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Movie, MovieSearchResult } from '../models/movie.model';
import { environment } from '../../../environments/environment';

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
    // Asumimos que hay un endpoint para obtener todas las películas
    return this.http.get<Movie[]>(`${environment.apiUrl}/movies`);
  }

  deleteMovie(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/movies/${id}`);
  }
}

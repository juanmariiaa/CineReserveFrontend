import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { MovieWithNextScreening } from '../../../../../core/models/movie.model';

@Component({
  selector: 'app-trending-movies',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, MatButtonModule],
  templateUrl: './trending-movies.component.html',
  styleUrls: ['./trending-movies.component.scss'],
})
export class TrendingMoviesComponent {
  @Input() movies: MovieWithNextScreening[] = [];

  getGenresList(movie: MovieWithNextScreening): string {
    if (!movie.genres || movie.genres.length === 0) return '';
    return movie.genres
      .map((g: any) => g.name || g)
      .slice(0, 3)
      .join(', ');
  }
}

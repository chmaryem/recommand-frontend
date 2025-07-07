import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { StylePreferences, SavePreferencesResponse } from '../models/style-preferences.model';

@Injectable({
  providedIn: 'root'
})
export class PreferencesService {
  private baseUrl = 'http://localhost:8075/preferences';

  constructor(private http: HttpClient) {}

  /**
   * Persist user style preferences.
   * @param data Complete preference object coming from the reactive form
   */
  savePreferences(data: StylePreferences): Observable<SavePreferencesResponse> {
    return this.http
      .post<SavePreferencesResponse>(`${this.baseUrl}`, data)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    // Client-side or network error occurred
    if (error.error instanceof Error) {
      console.error('An error occurred:', error.error.message);
    } else {
      console.error(`Backend returned code ${error.status}, body was:`, error.error);
    }
    // Return observable with user-facing message
    return throwError(() => new Error('Une erreur est survenue; veuillez réessayer plus tard.'));
  }
}
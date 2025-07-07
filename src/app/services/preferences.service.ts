import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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
  savePreferences(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}`, data);
  }
}
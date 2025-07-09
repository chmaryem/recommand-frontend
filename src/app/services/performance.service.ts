import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserPreferenceService {
  private readonly API_URL = 'http://localhost:8075/user/preferences';


private getAuthHeaders(): HttpHeaders {
  const token = localStorage.getItem('token');
  return new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  });
}

  constructor(private http: HttpClient) {}

  savePreferences(preference: any): Observable<any> {
    return this.http.post<any>(this.API_URL, preference,  { headers: this.getAuthHeaders() });
  }



  // ✅ Nouvelle méthode sans email
  getPreferences(): Observable<any> {
    return this.http.get<any>(this.API_URL, { headers: this.getAuthHeaders() });
  }

  deletePreferences(): Observable<void> {
    return this.http.delete<void>(this.API_URL, { headers: this.getAuthHeaders() });
  }

  hasPreferences(): Observable<boolean> {
    return new Observable(observer => {
      this.getPreferences().subscribe({
        next: (data) => observer.next(!!data),
        error: () => observer.next(false),
        complete: () => observer.complete()
      });
    });
  }
}

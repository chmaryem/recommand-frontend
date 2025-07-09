import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:8075/auth';

  constructor(private http: HttpClient) {}

register(userData: any): Observable<HttpResponse<any>> {
  return this.http.post<any>(`${this.baseUrl}/register`, userData, { observe: 'response' });
}

  verifyCode(email: string, code: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/verify-code`, { email, code });
  }

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/login`, credentials);
  }

  refreshToken(token: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/refresh`, { token });
  }

  getEmailFromToken(): string | null {
  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.sub || payload.email || null;
  } catch (e) {
    return null;
  }
}

}

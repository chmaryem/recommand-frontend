import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:8075/auth';

  constructor(private http: HttpClient) {}

  register(userData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, userData);
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
}

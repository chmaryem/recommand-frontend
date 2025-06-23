import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class forgotPasswordService {
  private apiUrl = 'http://localhost:8075/forgotPassword';

  constructor(private http: HttpClient) {}

  // Étape 1 : Envoi de l'OTP
  sendOtpEmail(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/verifyMail`, {
      to: email
    });
  }

  // Étape 2 : Vérification de l'OTP
  verifyOtp(email: string, otp: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/verifyOtp`, {
      email: email,
      otp: otp
    });
  }

  // Étape 3 : Changement du mot de passe
  changePassword(email: string, password: string, repeatPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/changePassword`, {
      email: email,
      password: password,
      repeatPassword: repeatPassword
    });
  }
}

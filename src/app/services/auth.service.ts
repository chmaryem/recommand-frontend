import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:8075/auth';
  private oauthUrl = 'http://localhost:8075/oauth2';

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

  // Méthode OAuth2 avec debug amélioré
  handleOAuthSuccess(): Observable<any> {
    console.log('🔗 Appel API OAuth2 vers:', `${this.oauthUrl}/success`);
    console.log('🍪 Cookies avant appel:', document.cookie);

    const options = {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };

    return this.http.get(`${this.oauthUrl}/success`, options).pipe(
      tap(response => {
        console.log('✅ Réponse OAuth2 reçue:', response);
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('❌ Erreur OAuth2 détaillée:', {
          status: error.status,
          statusText: error.statusText,
          url: error.url,
          message: error.message,
          error: error.error
        });


        throw error;
      })
    );
  }

  // Méthodes pour les redirections OAuth
  loginWithGoogle(): void {
    console.log('🔗 Redirection vers Google OAuth');
    window.location.href = 'http://localhost:8075/oauth2/authorization/google';
  }

  loginWithFacebook(): void {
    console.log('🔗 Redirection vers Facebook OAuth');
    window.location.href = 'http://localhost:8075/oauth2/authorization/facebook';
  }

  // Méthode de test pour vérifier la connectivité
  testConnection(): Observable<any> {
    console.log('🧪 Test de connectivité vers le backend');
    return this.http.get(`${this.baseUrl}/test`, { withCredentials: true }).pipe(
      tap(response => console.log('✅ Backend accessible:', response)),
      catchError(error => {
        console.error('❌ Backend inaccessible:', error);
        throw error;
      })
    );
  }

  // Stocker les données utilisateur après connexion OAuth
  storeUserData(userData: any): void {
    console.log('💾 Stockage des données utilisateur:', userData);

    try {
      localStorage.setItem('token', userData.token);
      localStorage.setItem('refreshToken', userData.refreshToken);
      localStorage.setItem('role', userData.role);

      const user = {
        name: userData.name,
        email: userData.email
      };
      localStorage.setItem('user', JSON.stringify(user));

      console.log('✅ Données stockées avec succès');
    } catch (error) {
      console.error('❌ Erreur lors du stockage:', error);
    }
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

  getRoleFromToken(): string | null {
    return localStorage.getItem('role');
  }

  isAuthenticated(): boolean {
    return !!this.getEmailFromToken();
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
  }
}

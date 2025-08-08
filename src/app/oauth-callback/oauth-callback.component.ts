import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-oauth-callback',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './oauth-callback.component.html',
  styleUrls: ['./oauth-callback.component.css']

})
export class OAuthCallbackComponent implements OnInit {
  errorMessage: string = '';
  errorDetails: string = '';
  statusCode: number | null = null;
  currentUrl: string = '';
  queryParams: any = {};
  cookiesInfo: string = '';
  debugMode: boolean = true; // Activez pour voir les infos de debug

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Informations de debug
    this.currentUrl = window.location.href;
    this.cookiesInfo = document.cookie || 'Aucun cookie';

    console.log('🚀 OAuth Callback - Démarrage');
    console.log('URL actuelle:', this.currentUrl);
    console.log('Cookies:', document.cookie);

    // Vérifier les paramètres de l'URL
    this.route.queryParams.subscribe(params => {
      this.queryParams = params;
      console.log('📝 Paramètres reçus:', params);

      if (params['success'] === 'true') {
        console.log('✅ Paramètre success=true détecté');
        // Attendre un peu pour laisser le temps au backend de traiter
        setTimeout(() => {
          this.handleCallback();
        }, 500);
      } else if (params['error']) {
        console.log('❌ Paramètre error détecté:', params['error']);
        this.errorMessage = params['message'] || 'Erreur OAuth2 inconnue';
      } else {
        console.log('⚠️ Paramètres OAuth2 manquants ou invalides');
        this.errorMessage = 'Paramètres OAuth2 invalides. Paramètres reçus: ' + JSON.stringify(params);
      }
    });
  }

  private handleCallback(): void {
    console.log('🔄 Tentative de récupération du token OAuth2...');

    this.authService.handleOAuthSuccess().subscribe({
      next: (response) => {
        console.log('✅ OAuth callback success:', response);

        if (response && response.token) {
          // Stocker les données utilisateur
          this.authService.storeUserData(response);

          // Rediriger selon le rôle
          if (response.role === 'ADMIN') {
            console.log('👑 Redirection vers admin dashboard');
            this.router.navigate(['/admin-dashboard']);
          } else {
            console.log('👤 Redirection vers dashboard utilisateur');
            this.router.navigate(['/dashboard']);
          }
        } else {
          console.log('⚠️ Réponse reçue mais token manquant:', response);
          this.errorMessage = 'Token non reçu du serveur';
          this.errorDetails = JSON.stringify(response);
        }
      },
      error: (error) => {
        console.error('❌ OAuth callback error:', error);

        this.statusCode = error.status || null;
        this.errorMessage = this.getErrorMessage(error);
        this.errorDetails = this.getErrorDetails(error);

        // Log détaillé pour debug
        console.log('Status:', error.status);
        console.log('Error object:', error);
        console.log('Error message:', error.message);
        if (error.error) {
          console.log('Error body:', error.error);
        }
      }
    });
  }

  private getErrorMessage(error: any): string {
    if (error.status === 0) {
      return 'Impossible de contacter le serveur. Vérifiez que le backend est démarré sur le port 8075.';
    }
    if (error.status === 404) {
      return 'Endpoint /oauth2/success non trouvé. Vérifiez la configuration du contrôleur.';
    }
    if (error.status === 500) {
      return error.error?.message || 'Erreur interne du serveur';
    }
    if (error.status === 403) {
      return 'Accès refusé. Problème de session ou de cookies.';
    }

    return error.error?.message || error.message || 'Erreur de connexion inconnue';
  }

  private getErrorDetails(error: any): string {
    const details = [];

    if (error.status) details.push(`Status: ${error.status}`);
    if (error.statusText) details.push(`StatusText: ${error.statusText}`);
    if (error.url) details.push(`URL: ${error.url}`);

    return details.join(' | ');
  }

  retry(): void {
    this.errorMessage = '';
    this.errorDetails = '';
    this.statusCode = null;
    this.handleCallback();
  }

  redirectToLogin(): void {
    this.router.navigate(['/login']);
  }
}

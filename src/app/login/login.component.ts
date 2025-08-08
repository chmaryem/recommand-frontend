import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  email: string = '';
  password: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Vérifier si on revient d'une authentification OAuth
    this.route.queryParams.subscribe(params => {
      if (params['oauth'] === 'success') {
        this.handleOAuthCallback();
      } else if (params['oauth'] === 'error') {
        this.errorMessage = 'Erreur lors de la connexion OAuth2';
      }
    });
  }

  onSubmit(): void {
    this.isLoading = true;
    this.errorMessage = '';

    const credentials = {
      email: this.email,
      password: this.password
    };

    this.authService.login(credentials).subscribe({
      next: (res) => {
        console.log('Réponse API:', res);
        this.authService.storeUserData(res);

        if (res.role === 'ADMIN') {
          this.router.navigate(['/admin-dashboard']);
        } else {
          this.router.navigate(['/dashboard']);
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Erreur lors de la connexion';
        console.error('Erreur API:', err);
        this.isLoading = false;
      }
    });
  }

  // Connexion avec Google
  loginWithGoogle(): void {
    this.isLoading = true;
    this.authService.loginWithGoogle();
  }

  // Connexion avec Facebook
  loginWithFacebook(): void {
    this.isLoading = true;
    this.authService.loginWithFacebook();
  }

  // Gérer le retour de l'authentification OAuth
  private handleOAuthCallback(): void {
    this.authService.handleOAuthSuccess().subscribe({
      next: (res) => {
        console.log('OAuth success:', res);
        this.authService.storeUserData(res);

        if (res.role === 'ADMIN') {
          this.router.navigate(['/admin-dashboard']);
        } else {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err) => {
        console.error('OAuth error:', err);
        this.errorMessage = 'Erreur lors de la connexion OAuth2';
      }
    });
  }
}

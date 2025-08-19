import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush // Optimise la détection de changements
})
export class LoginComponent implements OnInit, OnDestroy {
  email: string = '';
  password: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;

  // Pour gérer les subscriptions
  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Optimisation : utiliser takeUntil pour éviter les memory leaks
    this.route.queryParams.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      if (params['oauth'] === 'success') {
        this.handleOAuthCallback();
      } else if (params['oauth'] === 'error') {
        this.errorMessage = 'Erreur lors de la connexion OAuth2';
      }
    });
  }

  ngOnDestroy(): void {
    // Nettoyer les subscriptions
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSubmit(): void {
    if (this.isLoading) return; // Éviter les doubles soumissions

    this.isLoading = true;
    this.errorMessage = '';

    const credentials = {
      email: this.email.trim(), // Nettoyer les espaces
      password: this.password
    };

    this.authService.login(credentials).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (res) => {
        console.log('Réponse API:', res);
        this.authService.storeUserData(res);

        const redirectPath = res.role === 'ADMIN' ? '/admin-dashboard' : '/dashboard';
        this.router.navigate([redirectPath]);
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Erreur lors de la connexion';
        console.error('Erreur API:', err);
        this.isLoading = false;
      }
    });
  }

  loginWithGoogle(): void {
    if (this.isLoading) return;
    this.isLoading = true;
    this.authService.loginWithGoogle();
  }

  loginWithFacebook(): void {
    if (this.isLoading) return;
    this.isLoading = true;
    this.authService.loginWithFacebook();
  }

  private handleOAuthCallback(): void {
    this.authService.handleOAuthSuccess().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (res) => {
        console.log('OAuth success:', res);
        this.authService.storeUserData(res);

        const redirectPath = res.role === 'ADMIN' ? '/admin-dashboard' : '/dashboard';
        this.router.navigate([redirectPath]);
      },
      error: (err) => {
        console.error('OAuth error:', err);
        this.errorMessage = 'Erreur lors de la connexion OAuth2';
      }
    });
  }
}

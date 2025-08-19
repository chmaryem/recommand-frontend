import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [],
  templateUrl: './unauthorized.component.html',
  styleUrl: './unauthorized.component.css'
})
export class UnauthorizedComponent {
   constructor(private router: Router) {}

  /**
   * Navigue vers la page de connexion
   */
  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }

  /**
   * Navigue vers la page d'accueil
   */
  navigateToHome(): void {
    this.router.navigate(['/']);
  }

  /**
   * Fonction pour contacter le support technique
   * Peut être personnalisée selon vos besoins (modal, email, etc.)
   */
  contactSupport(): void {
    // Option 1: Ouvrir un email
    window.location.href = 'mailto:support@votre-entreprise.com?subject=Problème d\'accès - Erreur 403';

    // Option 2: Rediriger vers une page de contact
    // this.router.navigate(['/contact']);

    // Option 3: Ouvrir un modal de support
    // this.openSupportModal();

    // Option 4: Log pour le debug (à supprimer en production)
    console.log('Demande de support technique initiée');
  }

}

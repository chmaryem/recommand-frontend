import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const email = this.authService.getEmailFromToken();
    console.log('Email from token:', email);

    if (!email) {
      console.log('Non authentifié, redirection vers /login');

      return false;
    }

    const requiredRoles = route.data['roles'] as string[];
    console.log('Rôles requis:', requiredRoles);

    if (requiredRoles) {
      const userRole = localStorage.getItem('role');
      console.log('Rôle utilisateur:', userRole);

      if (!userRole || !requiredRoles.includes(userRole)) {
        console.log('Rôle non autorisé, redirection vers /unauthorized');
        this.router.navigate(['/unauthorized']);
        return false;
      }
    }

    return true;
  }
}

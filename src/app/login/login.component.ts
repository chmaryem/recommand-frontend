import {Component, OnInit} from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
    imports: [CommonModule, FormsModule,  RouterModule],
  styleUrls: ['./login.component.css']
})
export class LoginComponent  {

  email: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit(): void {
    const credentials = {
      email: this.email,
      password: this.password
    };

    this.authService.login(credentials).subscribe({
      next: (res) => {
        if (res.statusCode === 200) {
          // Enregistrer le token dans le localStorage
          localStorage.setItem('token', res.token);
          localStorage.setItem('refreshToken', res.refreshToken);
          localStorage.setItem('role', res.role);
          this.router.navigate(['/account']);
        } else {
          this.errorMessage = res.message;
        }
      },
      error: (err) => {
        this.errorMessage = 'Erreur lors de la connexion';
        console.error(err);
      }
    });
  }


}

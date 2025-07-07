import {Component, OnInit} from '@angular/core';
import { AuthService } from '../services/auth.service';
import { AuthResponse } from '../models/auth.model';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
    imports: [CommonModule, FormsModule,  RouterModule],
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
 user = {
    name: '',
    email: '',
    password: '',
    role: 'USER'
  };

  message = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    this.authService.register(this.user).subscribe({
      next: (res: AuthResponse) => {
        this.message = res.message ?? 'Inscription réussie';
        alert('Registration successful! Please check your email for the verification code.');
        this.router.navigate(['/verify']);
      },
      error: (err) => {
        console.error(err);
        this.message = 'Registration failed: ' + (err.error?.error || 'Server error');
      }
    });
  }

}

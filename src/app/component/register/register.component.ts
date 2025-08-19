import {Component, OnInit} from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
    imports: [CommonModule, FormsModule,  RouterModule],
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
registerForm: FormGroup;
user = {
    name: '',
    email: '',
    password: '',
    role: 'USER'
  };
isLoading = false;
message = '';
showModal = false;
successMessage = '';
showSuccessModal = false;
redirectAfterSuccess = false;

  constructor(private fb: FormBuilder,private authService: AuthService, private router: Router) {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['',[Validators.required, Validators.email]],
      password: ['',
        [Validators.required,
         Validators.minLength(6)]]
    })

  }

  onSubmit() {
  this.isLoading = true;

  this.authService.register(this.user).subscribe({
    next: (res) => {
    this.isLoading = false;

    if (res.status === 200) {
      this.successMessage = 'Registration successful! Please check your email for the verification code.';
      this.showSuccessModal = true;
      this.redirectAfterSuccess = true;
    }
    },
    error: (err) => {
      this.isLoading = false;
      if (err.status === 409) {
        this.message = 'Email already exists. Please use another email.';
      }  else if (err.status === 403) {
           this.successMessage = 'Email already registered but not verified. A new verification code has been sent.';
           this.showSuccessModal = true;
           this.redirectAfterSuccess = true;
  return;
}
 else {
        this.message = 'Registration failed: ' + (err.error?.error || 'Server error');
      }
      this.showModal = true;
    }
  });
}


  closeModal() {
    this.showModal = false;
  }
  closeModalSucess() {
  this.showModal = false;
  this.showSuccessModal = false;

  if (this.redirectAfterSuccess) {
    this.redirectAfterSuccess = false;
    this.router.navigate(['/verify']);
  }
}

}

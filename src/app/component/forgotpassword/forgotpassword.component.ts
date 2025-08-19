import { Component } from '@angular/core';
import { forgotPasswordService } from '../../services/forgotpass.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-forgotpassword',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './forgotpassword.component.html',
  styleUrls: ['./forgotpassword.component.css']
})
export class ForgotpasswordComponent {
  email = '';
  otpArray: string[] = ['', '', '', '', '', ''];
  otpDigits = Array(6).fill(0);
  otp = '';
  password = '';
  repeatPassword = '';
  message = '';
  step = 1;

  constructor(private forgotPass: forgotPasswordService, private router: Router) {}

  // --- STEP 1: Envoi OTP ---
  sendOtp() {
    this.forgotPass.sendOtpEmail(this.email).subscribe({
      next: () => {
        this.message = 'OTP sent to your email.';
        this.step = 2;
      },
      error: (err) => {
        console.error('Erreur reçue dans sendOtp:', err);
        this.message = err.error?.message || 'Failed to send OTP.';
      }
    });
  }

  // --- STEP 2: Vérification OTP ---
  verifyOtp() {
    this.updateOtp(); // Très important
    if (this.otp.length !== 6) {
      this.message = 'Veuillez entrer un code de 6 chiffres.';
      return;
    }

    this.forgotPass.verifyOtp(this.email, Number(this.otp)).subscribe({
      next: () => {
        this.message = 'OTP verified.';
        this.step = 3;
      },
      error: (err) => {
        console.error('Erreur OTP:', err);
        this.message = err.error?.message || 'Invalid or expired OTP.';
      }
    });
  }

  // --- STEP 3: Changement mot de passe ---
  changePassword() {
    if (this.password !== this.repeatPassword) {
      this.message = 'Passwords do not match.';
      return;
    }

    this.forgotPass.changePassword(this.email, this.password, this.repeatPassword).subscribe({
      next: () => {
        this.message = 'Password changed successfully.';
        this.step = 4;
        // Optionally, redirect to login page or show success message
         this.router.navigate(['/login']);
      },
      error: (err) => {
        this.message = err.error?.message || 'Error changing password.';
      }
    });
  }

  // --- OTP Helpers ---
  updateOtp() {
    this.otp = this.otpArray.join('');
  }

  onDigitInput(index: number, event: any) {
    const value = event.target.value;

    if (!/^\d$/.test(value)) {
      this.otpArray[index] = '';
      return;
    }

    this.otpArray[index] = value;
    if (index < 5) {
      const nextInput = document.querySelectorAll('.code-box')[index + 1] as HTMLElement;
      nextInput?.focus();
    }
    this.updateOtp();
  }

  onKeyDown(index: number, event: KeyboardEvent) {
    if (event.key === 'Backspace' && this.otpArray[index] === '' && index > 0) {
      const prevInput = document.querySelectorAll('.code-box')[index - 1] as HTMLElement;
      prevInput?.focus();
    }
  }
}

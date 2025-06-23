import { Component } from '@angular/core';
import { forgotPasswordService } from '../services/forgotpass.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-forgotpassword',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './forgotpassword.component.html',
  styleUrls: ['./forgotpassword.component.css']
})
export class ForgotpasswordComponent {
  email = '';
  otp = '';
  password = '';
  repeatPassword = '';
  message = '';
  step = 1; // 1: email, 2: otp, 3: new password, 4: success

  constructor(private forgotPass: forgotPasswordService) {}

  sendOtp() {
    this.forgotPass.sendOtpEmail(this.email).subscribe({
      next: () => {
        this.message = 'OTP sent to your email.';
        this.step = 2;
      },
      error: (err) => {
        this.message = err.error?.message || 'Failed to send OTP.';
      }
    });
  }

  verifyOtp() {
    this.forgotPass.verifyOtp(this.email, Number(this.otp)).subscribe({
      next: () => {
        this.message = 'OTP verified.';
        this.step = 3;
      },
      error: (err) => {

        this.message = err.error?.message || 'Invalid or expired OTP.';
      }
    });
  }

  changePassword() {
    if (this.password !== this.repeatPassword) {
      this.message = 'Passwords do not match.';
      return;
    }

    this.forgotPass.changePassword(this.email, this.password, this.repeatPassword).subscribe({
      next: () => {
        this.message = 'Password changed successfully.';
        this.step = 4;
      },
      error: (err) => {
        this.message = err.error?.message || 'Error changing password.';
      }
    });
  }
}



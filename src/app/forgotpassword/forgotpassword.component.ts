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
      console.error("Erreur reçue dans sendOtp:", err); // ✅ Ajoute ceci
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
      console.error("Erreur OTP:", err);
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
  otpArray: string[] = ['', '', '', '', '', ''];
otpDigits = Array(6).fill(0); // pour *ngFor

onDigitInput(index: number, event: any) {
  const input = event.target;
  const value = input.value;

  if (value.length === 1 && index < 5) {
    const nextInput = document.querySelectorAll('.code-box')[index + 1] as HTMLElement;
    nextInput?.focus();
  }

  this.otp = this.otpArray.join('');
}

onKeyDown(index: number, event: KeyboardEvent) {
  if (event.key === 'Backspace' && this.otpArray[index] === '' && index > 0) {
    const prevInput = document.querySelectorAll('.code-box')[index - 1] as HTMLElement;
    prevInput?.focus();
  }
}

}



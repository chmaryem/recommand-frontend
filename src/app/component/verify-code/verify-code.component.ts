import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-verify-code',
   standalone: true,
    imports: [CommonModule, FormsModule,  RouterModule],
  templateUrl: './verify-code.component.html',
    styleUrls: ['./verify-code.component.css']
})
export class VerifyCodeComponent {
   email: string = '';
  codeArray: string[] = ['', '', '', '', '', ''];
  codeDigits = Array(6).fill(0);
  code: string = '';
  message: string = '';
   isAutoVerifying = false;
  showSuccessModal = false

  constructor(private authService: AuthService, private router: Router) {}

 onDigitInput(index: number, event: any) {
    const input = event.target;
    const value = input.value;

    if (value.length === 1 && index < 5) {
      const nextInput = document.querySelectorAll('.code-box')[index + 1] as HTMLElement;
      nextInput?.focus();
    }

    this.updateCode();


    if (this.code.length === 6 && !this.isAutoVerifying) {
      this.onVerify();
    }
  }

  onKeyDown(index: number, event: KeyboardEvent) {
    if (event.key === 'Backspace' && this.codeArray[index] === '' && index > 0) {
      const prevInput = document.querySelectorAll('.code-box')[index - 1] as HTMLElement;
      prevInput?.focus();
    }
  }

  updateCode() {
    this.code = this.codeArray.join('');
  }

 onVerify() {
    this.updateCode();

    if (this.code.length !== 6) {
      this.message = 'Veuillez entrer un code de 6 chiffres.';
      return;
    }

    this.isAutoVerifying = true;
    this.authService.verifyCode(this.email, this.code).subscribe({
      next: (res) => {
        this.message = '';
        this.showSuccessModal = true;

        setTimeout(() => {
          this.showSuccessModal = false;
          this.router.navigate(['/login']);
        }, 2500);
      },
      error: (err) => {
        this.isAutoVerifying = false;
        this.message = err.error?.message || 'Erreur de vérification. Veuillez réessayer.';
        console.error(err);
      }
    });
  }

  closeModal() {
    this.showSuccessModal = false;
  }





}

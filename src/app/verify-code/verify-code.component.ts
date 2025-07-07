import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
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
  codeArray: string[] = ['', '', '', '', '', '']; // 6 cases
  codeDigits = Array(6).fill(0); // Pour la directive *ngFor
  code: string = ''; // code combiné
  message: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  onDigitInput(index: number, event: Event) {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    // avance automatiquement si un chiffre est saisi
    if (value.length === 1 && index < 5) {
      const nextInput = document.querySelectorAll('.code-box')[index + 1] as HTMLElement;
      nextInput?.focus();
    }

    this.updateCode();
  }

  onKeyDown(index: number, event: KeyboardEvent) {
    // si backspace et champ vide, revenir au champ précédent
    if (event.key === 'Backspace' && this.codeArray[index] === '' && index > 0) {
      const prevInput = document.querySelectorAll('.code-box')[index - 1] as HTMLElement;
      prevInput?.focus();
    }
  }

  updateCode() {
    this.code = this.codeArray.join('');
  }

  onVerify() {
    this.updateCode(); // s'assurer que le code est mis à jour
    if (this.code.length !== 6) {
      this.message = 'Veuillez entrer un code de 6 chiffres.';
      return;
    }

    this.authService.verifyCode(this.email, this.code).subscribe({
      next: (res) => {
        alert(res.message); // "Email vérifié avec succès"
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.message = err.error?.message || 'Erreur de vérification. Veuillez réessayer.';
        console.error(err);
      }
    });
  }




}

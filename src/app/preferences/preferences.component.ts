import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PreferencesService } from '../services/preferences.service';
import { SidebarComponent } from '../sidebar/sidebar.component';

interface Option {
  label: string;
  value: string;
  icon?: string;
  hex?: string; // for colors
}

@Component({
  selector: 'app-preferences',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SidebarComponent],
  templateUrl: './preferences.component.html',
  styleUrl: './preferences.component.css'
})
export class PreferencesComponent implements OnInit {
  preferenceForm!: FormGroup;

  styleOptions: Option[] = [
    { label: 'Décontracté', value: 'casual', icon: '👖' },
    { label: 'Professionnel', value: 'professional', icon: '👔' },
    { label: 'Sportif', value: 'sport', icon: '🏃' },
    { label: 'Élégant', value: 'elegant', icon: '👗' }
  ];

  preferenceOptions: Option[] = [
    { label: 'Durabilité', value: 'durable', icon: '♻️' },
    { label: 'Végétalien', value: 'vegan', icon: '🌱' },
    { label: 'Tendances', value: 'trendy', icon: '🔥' },
    { label: 'Classique', value: 'classic', icon: '🎩' }
  ];

  colorOptions: Option[] = [
    { label: 'Rouge', value: 'red', hex: '#FF0000' },
    { label: 'Vert', value: 'green', hex: '#00A86B' },
    { label: 'Bleu', value: 'blue', hex: '#007BFF' },
    { label: 'Noir', value: 'black', hex: '#000000' },
    { label: 'Blanc', value: 'white', hex: '#FFFFFF' }
  ];

  isLoading = false;
  showSuccess = false;
  showError = false;
  errorMessage = '';

  savedPreferences: any;
  showCardAfterSubmit = false;

  constructor(private fb: FormBuilder, private prefService: PreferencesService) {}

  ngOnInit(): void {
    this.preferenceForm = this.fb.group({
      styleVestimentaire: ['', Validators.required],
      otherPreferences: [[]],
      couleursFavorites: [[]],
      taille: ['', Validators.required],
      budget: [''],
      notificationsActivees: [false],
      heureNotification: ['']
    });
  }

  /* ---------- Style selection ---------- */
  selectStyle(value: string): void {
    this.preferenceForm.patchValue({ styleVestimentaire: value });
  }

  /* ---------- Additional preferences ---------- */
  isPreferenceSelected(value: string): boolean {
    return (this.preferenceForm.get('otherPreferences')?.value || []).includes(value);
  }

  togglePreference(value: string): void {
    const current: string[] = this.preferenceForm.get('otherPreferences')?.value || [];
    if (current.includes(value)) {
      this.preferenceForm.patchValue({ otherPreferences: current.filter(v => v !== value) });
    } else {
      this.preferenceForm.patchValue({ otherPreferences: [...current, value] });
    }
  }

  /* ---------- Color selection ---------- */
  isColorSelected(value: string): boolean {
    return (this.preferenceForm.get('couleursFavorites')?.value || []).includes(value);
  }

  toggleColor(value: string): void {
    const current: string[] = this.preferenceForm.get('couleursFavorites')?.value || [];
    if (current.includes(value)) {
      this.preferenceForm.patchValue({ couleursFavorites: current.filter(v => v !== value) });
    } else {
      this.preferenceForm.patchValue({ couleursFavorites: [...current, value] });
    }
  }

  /* ---------- Form submission ---------- */
  onSubmit(): void {
    if (this.preferenceForm.invalid) {
      this.preferenceForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.prefService.savePreferences(this.preferenceForm.value).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.showSuccess = true;
        this.savedPreferences = res || this.preferenceForm.value;
        this.showCardAfterSubmit = true;
        // Hide success msg after 5s
        setTimeout(() => (this.showSuccess = false), 5000);
      },
      error: (err: any) => {
        this.isLoading = false;
        this.showError = true;
        this.errorMessage = err?.message || 'Erreur inconnue';
        setTimeout(() => (this.showError = false), 5000);
      }
    });
  }
}
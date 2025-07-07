import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

export interface StyleOption {
  value: string;
  label: string;
  icon: string;
}

export interface PreferenceOption {
  value: string;
  label: string;
  icon: string;
}

export interface ColorOption {
  value: string;
  label: string;
  hex: string;
}

export interface SavedPreferences {
  styleVestimentaire: string;
  otherPreferences?: string[];
  couleursFavorites?: string[];
  taille?: string;
  budget?: string;
  occasionsFrequentes?: string[];
  notificationTime?: string;
  notificationsActivees: boolean;
}

@Component({
  selector: 'app-style-preferences',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './style-preferences.component.html',
  styleUrls: ['./style-preferences.component.css']
})
export class StylePreferencesComponent implements OnInit {
  preferenceForm!: FormGroup;
  isLoading = false;
  showSuccess = false;
  showError = false;
  showCardAfterSubmit = false;
  errorMessage = '';
  savedPreferences: SavedPreferences | null = null;

  styleOptions: StyleOption[] = [
    { value: 'casual', label: 'Décontracté', icon: '👕' },
    { value: 'chic', label: 'Chic', icon: '👔' },
    { value: 'sportif', label: 'Sportif', icon: '🏃‍♂️' },
    { value: 'elegant', label: 'Élégant', icon: '🤵' },
    { value: 'boheme', label: 'Bohème', icon: '🌸' },
    { value: 'moderne', label: 'Moderne', icon: '⭐' }
  ];

  preferenceOptions: PreferenceOption[] = [
    { value: 'confortable', label: 'Confortable', icon: '😌' },
    { value: 'tendance', label: 'Tendance', icon: '🔥' },
    { value: 'classique', label: 'Classique', icon: '👑' },
    { value: 'original', label: 'Original', icon: '🎨' },
    { value: 'ecologique', label: 'Écologique', icon: '🌱' },
    { value: 'economique', label: 'Économique', icon: '💰' },
    { value: 'local', label: 'Local', icon: '📍' },
    { value: 'vintage', label: 'Vintage', icon: '🕰️' }
  ];

  colorOptions: ColorOption[] = [
    { value: 'noir', label: 'Noir', hex: '#000000' },
    { value: 'blanc', label: 'Blanc', hex: '#FFFFFF' },
    { value: 'gris', label: 'Gris', hex: '#808080' },
    { value: 'bleu', label: 'Bleu', hex: '#0066CC' },
    { value: 'rouge', label: 'Rouge', hex: '#CC0000' },
    { value: 'vert', label: 'Vert', hex: '#00AA00' },
    { value: 'jaune', label: 'Jaune', hex: '#FFD700' },
    { value: 'rose', label: 'Rose', hex: '#FF69B4' },
    { value: 'violet', label: 'Violet', hex: '#8A2BE2' },
    { value: 'orange', label: 'Orange', hex: '#FF8C00' },
    { value: 'marron', label: 'Marron', hex: '#8B4513' },
    { value: 'beige', label: 'Beige', hex: '#F5F5DC' }
  ];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.preferenceForm = this.fb.group({
      styleVestimentaire: ['', Validators.required],
      otherPreferences: this.fb.array([]),
      couleursFavorites: this.fb.array([]),
      taille: [''],
      budget: [''],
      occasionsFrequentes: this.fb.array([]),
      notificationsActivees: [false],
      heureNotification: ['08:00']
    });
  }

  selectStyle(styleValue: string): void {
    this.preferenceForm.patchValue({ styleVestimentaire: styleValue });
  }

  togglePreference(prefValue: string): void {
    const preferencesArray = this.preferenceForm.get('otherPreferences') as FormArray;
    const index = preferencesArray.value.indexOf(prefValue);
    
    if (index > -1) {
      preferencesArray.removeAt(index);
    } else {
      preferencesArray.push(this.fb.control(prefValue));
    }
  }

  isPreferenceSelected(prefValue: string): boolean {
    const preferencesArray = this.preferenceForm.get('otherPreferences') as FormArray;
    return preferencesArray.value.includes(prefValue);
  }

  toggleColor(colorValue: string): void {
    const colorsArray = this.preferenceForm.get('couleursFavorites') as FormArray;
    const index = colorsArray.value.indexOf(colorValue);
    
    if (index > -1) {
      colorsArray.removeAt(index);
    } else {
      colorsArray.push(this.fb.control(colorValue));
    }
  }

  isColorSelected(colorValue: string): boolean {
    const colorsArray = this.preferenceForm.get('couleursFavorites') as FormArray;
    return colorsArray.value.includes(colorValue);
  }

  onSubmit(): void {
    if (this.preferenceForm.valid) {
      this.isLoading = true;
      this.showSuccess = false;
      this.showError = false;

      // Simulate API call
      setTimeout(() => {
        try {
          const formData = this.preferenceForm.value;
          
          this.savedPreferences = {
            styleVestimentaire: formData.styleVestimentaire,
            otherPreferences: formData.otherPreferences,
            couleursFavorites: formData.couleursFavorites,
            taille: formData.taille,
            budget: formData.budget,
            occasionsFrequentes: formData.occasionsFrequentes,
            notificationTime: formData.notificationsActivees ? formData.heureNotification : undefined,
            notificationsActivees: formData.notificationsActivees
          };

          this.isLoading = false;
          this.showSuccess = true;
          this.showCardAfterSubmit = true;

          // Hide success message after 3 seconds
          setTimeout(() => {
            this.showSuccess = false;
          }, 3000);

          console.log('Préférences sauvegardées:', this.savedPreferences);
        } catch (error) {
          this.isLoading = false;
          this.showError = true;
          this.errorMessage = 'Une erreur est survenue lors de la sauvegarde.';
          
          setTimeout(() => {
            this.showError = false;
          }, 5000);
        }
      }, 1500);
    } else {
      this.showError = true;
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires.';
      
      setTimeout(() => {
        this.showError = false;
      }, 5000);
    }
  }
}
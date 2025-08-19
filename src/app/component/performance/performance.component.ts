import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { UserPreferenceService } from '../../services/performance.service';
import { SidebareComponent } from '../sidebare/sidebare.component';
import { RouterModule } from '@angular/router';

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
  selector: 'app-performance',
  imports: [CommonModule, FormsModule,  RouterModule,ReactiveFormsModule,SidebareComponent],
  templateUrl: './performance.component.html',
  styleUrl: './performance.component.scss'
})

export class PerformanceComponent implements OnInit {
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

  constructor(
    private fb: FormBuilder,
    private userPreferenceService: UserPreferenceService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadExistingPreferences();
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

 private loadExistingPreferences(): void {
  this.userPreferenceService.getPreferences().subscribe({
    next: (preferences: any) => {
      if (preferences) {
        if (typeof preferences.otherPreferences === 'string') {
          preferences.otherPreferences = preferences.otherPreferences.split('|');
        }

        this.populateForm(preferences);

        this.savedPreferences = {
          styleVestimentaire: preferences.style || preferences.styleVestimentaire,
          otherPreferences: preferences.otherPreferences,
          couleursFavorites: preferences.couleursFavorites,
          taille: preferences.taille,
          budget: preferences.budget,
          occasionsFrequentes: preferences.occasionsFrequentes,
          notificationTime: preferences.notificationTime,
          notificationsActivees: !!preferences.notificationTime
        };

        // ✅ ➕ Ajoute cette ligne ici
        this.showCardAfterSubmit = true;
      }
    },
    error: (error: any) => {
      console.error('Erreur lors du chargement des préférences:', error);
      this.showCardAfterSubmit = false;
    }
  });
}


  private populateForm(preferences: any): void {
    // Mise à jour des valeurs du formulaire avec les préférences existantes
    this.preferenceForm.patchValue({
      styleVestimentaire: preferences.styleVestimentaire || '',
      taille: preferences.taille || '',
      budget: preferences.budget || '',
      notificationsActivees: preferences.notificationsActivees || false,
      heureNotification: preferences.heureNotification || '08:00'
    });

    // Mise à jour des arrays (otherPreferences, couleursFavorites, occasionsFrequentes)
    if (preferences.otherPreferences) {
      const preferencesArray = this.preferenceForm.get('otherPreferences') as FormArray;
      preferencesArray.clear();
      preferences.otherPreferences.forEach((pref: string) => {
        preferencesArray.push(this.fb.control(pref));
      });
    }

    if (preferences.couleursFavorites) {
      const colorsArray = this.preferenceForm.get('couleursFavorites') as FormArray;
      colorsArray.clear();
      preferences.couleursFavorites.forEach((color: string) => {
        colorsArray.push(this.fb.control(color));
      });
    }

    if (preferences.occasionsFrequentes) {
      const occasionsArray = this.preferenceForm.get('occasionsFrequentes') as FormArray;
      occasionsArray.clear();
      preferences.occasionsFrequentes.forEach((occasion: string) => {
        occasionsArray.push(this.fb.control(occasion));
      });
    }
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

    const formData = this.preferenceForm.value;

    // 🔁 Fusionner toutes les infos dans une seule chaîne otherPreferences
    const otherPreferencesCombined = [
      (formData.otherPreferences || []).join(','),         // préférences
      (formData.couleursFavorites || []).join(','),        // couleurs
      formData.taille || '',                               // taille
      formData.budget || '',                               // budget
      (formData.occasionsFrequentes || []).join(',')       // occasions
    ].join('|'); // séparateur entre chaque groupe

    const preferenceData = {
      style: formData.styleVestimentaire,
      otherPreferences: otherPreferencesCombined,
      notificationTime: formData.notificationsActivees ? formData.heureNotification + ':00' : null
    };

    this.userPreferenceService.savePreferences(preferenceData).subscribe({
      next: (response: any) => {
        this.savedPreferences = {
          styleVestimentaire: formData.styleVestimentaire,
          otherPreferences: otherPreferencesCombined.split('|'),
        notificationTime: preferenceData.notificationTime ?? undefined,
          notificationsActivees: formData.notificationsActivees
        };

        this.isLoading = false;
        this.showSuccess = true;
        this.showCardAfterSubmit = true;

        setTimeout(() => {
          this.showSuccess = false;
        }, 3000);

        console.log('Préférences sauvegardées avec succès:', response);
      },
      error: (error: any) => {
        this.isLoading = false;
        this.showError = true;
        this.errorMessage = error.error?.message || 'Une erreur est survenue lors de la sauvegarde.';

        setTimeout(() => {
          this.showError = false;
        }, 5000);

        console.error('Erreur lors de la sauvegarde:', error);
      }
    });
  } else {
    this.showError = true;
    this.errorMessage = 'Veuillez remplir tous les champs obligatoires.';

    setTimeout(() => {
      this.showError = false;
    }, 5000);
  }
}

  deletePreferences(): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer toutes vos préférences ?')) {
      this.isLoading = true;
      this.showSuccess = false;
      this.showError = false;

      this.userPreferenceService.deletePreferences().subscribe({
        next: () => {
          this.isLoading = false;
          this.showSuccess = true;
          this.showCardAfterSubmit = false;
          this.savedPreferences = null;

          // Reset the form
          this.preferenceForm.reset();
          this.initializeForm();

          // Hide success message after 3 seconds
          setTimeout(() => {
            this.showSuccess = false;
          }, 3000);

          console.log('Préférences supprimées avec succès');
        },
        error: (error: any) => {
          this.isLoading = false;
          this.showError = true;
          this.errorMessage = error.error?.message || 'Une erreur est survenue lors de la suppression.';

          setTimeout(() => {
            this.showError = false;
          }, 5000);

          console.error('Erreur lors de la suppression:', error);
        }
      });
    }
  }
  hasOtherPreferences(): boolean {
  return Array.isArray(this.savedPreferences?.otherPreferences) &&
         this.savedPreferences!.otherPreferences!.length > 0;
}

editPreferences(): void {
  this.showCardAfterSubmit = false; // Cacher la carte, afficher le formulaire
}

getColorHex(colorValue: string): string {
  const color = this.colorOptions.find(c => c.value === colorValue);
  return color ? color.hex : '#ffffff';
}


}

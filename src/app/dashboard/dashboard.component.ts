import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  standalone: true,
   templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
   @ViewChild('cameraPreview') cameraPreview!: ElementRef<HTMLVideoElement>;

  currentStream: MediaStream | null = null;
  moodAnalyzed = false;
  isAnalyzing = false;
  showCaptureButtons = false;
  currentMood = {
    emoji: '😊',
    text: 'Vous semblez joyeux aujourd\'hui!',
    confidence: 87
  };

  // Navigation menu items
  menuItems = [
    { icon: '🏠', label: 'Dashboard', active: true },
    { icon: '📊', label: 'Historique', active: false },
    { icon: '👤', label: 'Profil', active: false },
    { icon: '⚙️', label: 'Paramètres', active: false },
    { icon: '🔔', label: 'Notifications', active: false }
  ];

  // Outfit recommendations
  outfitRecommendations = [
    {
      title: 'Look Ensoleillé & Joyeux',
      score: 92,
      items: [
        { icon: '👕', name: 'T-shirt', description: 'Coton coloré' },
        { icon: '👖', name: 'Jean', description: 'Denim clair' },
        { icon: '👟', name: 'Baskets', description: 'Blanches sport' }
      ],
      liked: null
    },
    {
      title: 'Alternative Chic',
      score: 85,
      items: [
        { icon: '👚', name: 'Blouse', description: 'Soie légère' },
        { icon: '🩳', name: 'Short', description: 'Lin beige' },
        { icon: '👡', name: 'Sandales', description: 'Cuir camel' }
      ],
      liked: null
    }
  ];

  // Quick actions
  quickActions = [
    { icon: '🔄', title: 'Nouvelle Tenue', description: 'Générer d\'autres suggestions' },
    { icon: '⏰', title: 'Notifications', description: 'Programmer votre minute style' },
    { icon: '📊', title: 'Historique', description: 'Voir vos analyses passées' },
    { icon: '📤', title: 'Partager', description: 'Partager votre style du jour' }
  ];

  // Statistics
  statistics = [
    { value: '127', label: 'Analyses d\'humeur' },
    { value: '89%', label: 'Satisfaction moyenne' },
    { value: '245', label: 'Tenues recommandées' },
    { value: '32', label: 'Jours consécutifs' }
  ];

  // User info

 user = {
    name: '',
    firstName: '',
    status: '',
    initials: ''
  };

 ngOnInit(): void {
  const userData = localStorage.getItem('user');

  if (!userData || userData === 'undefined') {
    console.warn('Aucune donnée utilisateur trouvée ou invalide.');
    return;
  }

  try {
    const userObj = JSON.parse(userData);
    this.user.name = userObj.name || '';
    this.user.firstName = userObj.firstName || userObj.name || '';
    this.user.status = 'Utilisateur';
    this.user.initials = this.getInitials(this.user.name);
  } catch (e) {
    console.error('Erreur parsing utilisateur:', e);

  }
}



  getInitials(fullName: string): string {
    return fullName.split(' ').map(n => n[0]).join('').toUpperCase();
  }


  // Weather info
  weather = {
    location: 'Tunis',
    temperature: '24°C',
    condition: 'Ensoleillé',
    humidity: '45%',
    icon: '☀️'
  };

  showToastMessage = '';
  showToast = false;

  toggleCaptureOptions(): void {
    this.showCaptureButtons = !this.showCaptureButtons;
  }

  async openCamera(event: Event): Promise<void> {
    event.stopPropagation();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      this.currentStream = stream;

      if (this.cameraPreview) {
        this.cameraPreview.nativeElement.srcObject = stream;
        this.cameraPreview.nativeElement.style.display = 'block';
        this.cameraPreview.nativeElement.play();
      }

      this.displayToast('Capture dans 3 secondes...');

      setTimeout(() => {
        this.stopCamera();
        this.analyzeMood();
      }, 3000);

    } catch (error) {
      console.error('Erreur caméra:', error);
      this.displayToast('Impossible d\'accéder à la caméra');
    }
  }

  uploadPhoto(event: Event): void {
    event.stopPropagation();

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        this.displayToast('Photo uploadée, analyse en cours...');
        this.analyzeMood();
      }
    };
    input.click();
  }

  stopCamera(): void {
    if (this.currentStream) {
      this.currentStream.getTracks().forEach(track => track.stop());
      this.currentStream = null;
    }

    if (this.cameraPreview) {
      this.cameraPreview.nativeElement.style.display = 'none';
    }
  }

  analyzeMood(): void {
    this.isAnalyzing = true;

    // Simulate mood analysis
    setTimeout(() => {
      this.isAnalyzing = false;
      this.moodAnalyzed = true;
      this.displayToast('Analyse terminée ! Voici vos recommandations.');
    }, 2000);
  }

  giveFeedback(type: 'like' | 'dislike', outfitIndex: number): void {

    this.displayToast(type === 'like' ? 'Merci pour votre retour positif !' : 'Nous prendrons en compte vos préférences.');
  }

  generateNewOutfit(): void {
    this.displayToast('Génération de nouvelles tenues en cours...');
    // Simulate new outfit generation
    setTimeout(() => {
      this.displayToast('Nouvelles recommandations disponibles !');
    }, 1500);
  }

  setNotificationTime(): void {
    this.displayToast('Paramètres de notification ouverts.');
  }

  viewHistory(): void {
    this.displayToast('Redirection vers l\'historique...');
  }

  shareStyle(): void {
    this.displayToast('Options de partage ouvertes.');
  }

  onActionClick(actionIndex: number): void {
    switch (actionIndex) {
      case 0:
        this.generateNewOutfit();
        break;
      case 1:
        this.setNotificationTime();
        break;
      case 2:
        this.viewHistory();
        break;
      case 3:
        this.shareStyle();
        break;
    }
  }

  onMenuItemClick(itemIndex: number): void {
    this.menuItems.forEach((item, index) => {
      item.active = index === itemIndex;
    });
  }

  toggleUserMenu(): void {
    this.displayToast('Menu utilisateur ouvert.');
  }

  private displayToast(message: string): void {
    this.showToastMessage = message;
    this.showToast = true;

    setTimeout(() => {
      this.showToast = false;
    }, 3000);
  }

}

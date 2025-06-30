import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { UploadService } from '../services/upload.service';
import { WeatherComponent } from '../weather/weather.component';

@Component({
  selector: 'app-dashboard',
 imports: [CommonModule, WeatherComponent],
  standalone: true,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  @ViewChild('cameraPreview') cameraPreview!: ElementRef<HTMLVideoElement>;

  currentStream: MediaStream | null = null;
  moodAnalyzed = false;
  isAnalyzing = false;
  showCaptureButtons = false;
  capturedImageUrl: string | null = null;

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
    initials: '',
    imageUrl: ''
  };

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

  constructor(private uploadService: UploadService) {}

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

      // Charger l'image de profil si elle existe
      if (userObj.image) {
        this.user.imageUrl = `http://localhost:8075/user/image/${userObj.image}`;
      }
    } catch (e) {
      console.error('Erreur parsing utilisateur:', e);
    }
  }

  getInitials(fullName: string): string {
    return fullName.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  toggleCaptureOptions(): void {
    this.showCaptureButtons = !this.showCaptureButtons;
  }

  async openCamera(event: Event): Promise<void> {
    event.stopPropagation();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      });
      this.currentStream = stream;

      if (this.cameraPreview) {
        this.cameraPreview.nativeElement.srcObject = stream;
        this.cameraPreview.nativeElement.style.display = 'block';
        this.cameraPreview.nativeElement.play();
      }

      this.displayToast('Capture dans 3 secondes...');

      setTimeout(() => {
        this.captureImageFromCamera();
      }, 3000);

    } catch (error) {
      console.error('Erreur caméra:', error);
      this.displayToast('Impossible d\'accéder à la caméra');
    }
  }

  captureImageFromCamera(): void {
    if (!this.cameraPreview || !this.currentStream) {
      return;
    }

    const video = this.cameraPreview.nativeElement;
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    if (!context) {
      this.displayToast('Erreur lors de la capture');
      return;
    }

    // Définir les dimensions du canvas
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Dessiner l'image de la vidéo sur le canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convertir en base64
    const base64DataUrl = canvas.toDataURL('image/jpeg', 0.8);

    // Arrêter la caméra
    this.stopCamera();

    // Uploader l'image
    this.uploadBase64Image(base64DataUrl);
  }

  uploadPhoto(event: Event): void {
    event.stopPropagation();

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        this.uploadFileImage(file);
      }
    };
    input.click();
  }

  uploadFileImage(file: File): void {
    this.isAnalyzing = true;
    this.displayToast('Upload en cours...');

    this.uploadService.uploadUserImage(file).subscribe({
      next: (fileName: string) => {
        console.log('Image uploadée avec succès:', fileName);
        this.capturedImageUrl = `http://localhost:8075/user/image/${fileName}`;
        this.analyzeMood();
        this.displayToast('Image uploadée avec succès!');
      },
      error: (error) => {
        console.error('Erreur lors de l\'upload:', error);
        this.isAnalyzing = false;
        this.displayToast('Erreur lors de l\'upload de l\'image');
      }
    });
  }

  uploadBase64Image(base64DataUrl: string): void {
    this.isAnalyzing = true;
    this.displayToast('Capture en cours de traitement...');

    this.uploadService.uploadBase64Image(base64DataUrl).subscribe({
      next: (fileName: string) => {
        console.log('Image capturée et uploadée avec succès:', fileName);
        this.capturedImageUrl = `http://localhost:8075/user/image/${fileName}`;
        this.analyzeMood();
        this.displayToast('Capture réussie!');
      },
      error: (error) => {
        console.error('Erreur lors de l\'upload de la capture:', error);
        this.isAnalyzing = false;
        this.displayToast('Erreur lors du traitement de la capture');
      }
    });
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
    // Simulate mood analysis
    setTimeout(() => {
      this.isAnalyzing = false;
      this.moodAnalyzed = true;

      // Simuler différentes humeurs basées sur l'analyse
      const moods = [
        { emoji: '😊', text: 'Vous semblez joyeux aujourd\'hui!', confidence: 87 },
        { emoji: '😌', text: 'Vous paraissez serein et détendu', confidence: 82 },
        { emoji: '😄', text: 'Votre sourire illumine votre journée!', confidence: 91 },
        { emoji: '🤔', text: 'Vous semblez pensif aujourd\'hui', confidence: 78 },
        { emoji: '😮', text: 'Vous paraissez surpris ou étonné', confidence: 75 }
      ];

      this.currentMood = moods[Math.floor(Math.random() * moods.length)];
      this.displayToast('Analyse terminée ! Voici vos recommandations.');
    }, 2000);
  }

  retakePhoto(): void {
    this.moodAnalyzed = false;
    this.capturedImageUrl = null;
    this.showCaptureButtons = false;
    this.displayToast('Prêt pour une nouvelle capture');
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

  // Méthode pour nettoyer les ressources lors de la destruction du composant
  ngOnDestroy(): void {
    this.stopCamera();
  }
}

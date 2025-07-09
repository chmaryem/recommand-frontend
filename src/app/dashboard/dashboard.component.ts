import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { UploadService } from '../services/upload.service';
import { WeatherComponent } from '../weather/weather.component';
import { RouterModule } from '@angular/router';
import { MenuItem, SidebareComponent } from "../sidebare/sidebare.component";

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, WeatherComponent, RouterModule, SidebareComponent],
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

  menuItems: MenuItem[] = [
    { icon: '🏠', label: 'Dashboard', route: '/dashboard', active: true },
    { icon: '📊', label: 'Historique', route: '/historique', active: false },
    { icon: '👤', label: 'Profil', route: '/performance', active: false },
    { icon: '⚙️', label: 'Paramètres', route: '/parametres', active: false },
    { icon: '🔔', label: 'Notifications', route: '/notifications', active: false }
  ];

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

  quickActions = [
    { icon: '🔄', title: 'Nouvelle Tenue', description: 'Générer d\'autres suggestions' },
    { icon: '⏰', title: 'Notifications', description: 'Programmer votre minute style' },
    { icon: '📊', title: 'Historique', description: 'Voir vos analyses passées' },
    { icon: '📤', title: 'Partager', description: 'Partager votre style du jour' }
  ];

  statistics = [
    { value: '127', label: 'Analyses d\'humeur' },
    { value: '89%', label: 'Satisfaction moyenne' },
    { value: '245', label: 'Tenues recommandées' },
    { value: '32', label: 'Jours consécutifs' }
  ];

  user = {
    name: '',
    firstName: '',
    status: '',
    initials: '',
    imageUrl: ''
  };

  weather = {
    location: 'Tunis',
    temperature: '24°C',
    condition: 'Ensoleillé',
    humidity: '45%',
    icon: '☀️'
  };

  showToastMessage = '';
  showToast = false;

  // Dimensions fixes pour l'image capturée
  readonly FIXED_IMAGE_WIDTH = 280;
  readonly FIXED_IMAGE_HEIGHT = 200;

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
          width: { ideal: this.FIXED_IMAGE_WIDTH },
          height: { ideal: this.FIXED_IMAGE_HEIGHT }
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

    // Utiliser les dimensions fixes
    canvas.width = this.FIXED_IMAGE_WIDTH;
    canvas.height = this.FIXED_IMAGE_HEIGHT;

    // Dessiner l'image en conservant les proportions
    const aspectRatio = video.videoWidth / video.videoHeight;
    let sourceWidth, sourceHeight, sourceX, sourceY;

    if (aspectRatio > (this.FIXED_IMAGE_WIDTH / this.FIXED_IMAGE_HEIGHT)) {
      sourceHeight = video.videoHeight;
      sourceWidth = sourceHeight * (this.FIXED_IMAGE_WIDTH / this.FIXED_IMAGE_HEIGHT);
      sourceX = (video.videoWidth - sourceWidth) / 2;
      sourceY = 0;
    } else {
      sourceWidth = video.videoWidth;
      sourceHeight = sourceWidth * (this.FIXED_IMAGE_HEIGHT / this.FIXED_IMAGE_WIDTH);
      sourceX = 0;
      sourceY = (video.videoHeight - sourceHeight) / 2;
    }

    context.drawImage(video, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, canvas.width, canvas.height);

    const base64DataUrl = canvas.toDataURL('image/jpeg', 0.8);
    this.stopCamera();
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
        this.processUploadedImage(file);
      }
    };
    input.click();
  }

  processUploadedImage(file: File): void {
    const reader = new FileReader();
    reader.onload = (event: any) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) return;

        // Utiliser les dimensions fixes
        canvas.width = this.FIXED_IMAGE_WIDTH;
        canvas.height = this.FIXED_IMAGE_HEIGHT;

        // Calculer le redimensionnement en conservant les proportions
        const aspectRatio = img.width / img.height;
        let sourceWidth, sourceHeight, sourceX, sourceY;

        if (aspectRatio > (this.FIXED_IMAGE_WIDTH / this.FIXED_IMAGE_HEIGHT)) {
          sourceHeight = img.height;
          sourceWidth = sourceHeight * (this.FIXED_IMAGE_WIDTH / this.FIXED_IMAGE_HEIGHT);
          sourceX = (img.width - sourceWidth) / 2;
          sourceY = 0;
        } else {
          sourceWidth = img.width;
          sourceHeight = sourceWidth * (this.FIXED_IMAGE_HEIGHT / this.FIXED_IMAGE_WIDTH);
          sourceX = 0;
          sourceY = (img.height - sourceHeight) / 2;
        }

        ctx.drawImage(img, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, canvas.width, canvas.height);

        const resizedImageUrl = canvas.toDataURL('image/jpeg', 0.8);
        this.uploadBase64Image(resizedImageUrl);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  }

  uploadBase64Image(base64DataUrl: string): void {
    this.isAnalyzing = true;
    this.displayToast('Traitement de l\'image...');

   this.uploadService.uploadBase64WithAnalysis(base64DataUrl).subscribe({
  next: (response) => {
    this.capturedImageUrl = `http://localhost:8075/user/image/${response.fileName}`;
    this.currentMood = {
      emoji: this.getEmoji(response.emotion),
      text: this.getMoodText(response.emotion),
      confidence: response.confidence
    };
    this.moodAnalyzed = true;
    this.isAnalyzing = false;
  },
  error: (err) => {
    this.displayToast('Erreur lors de l\'analyse');
    this.isAnalyzing = false;
  }
});

  }
 getEmoji(emotion: string): string {
  const map: { [key: string]: string } = {
    Happy: '😊',
    Sad: '😢',
    Angry: '😠',
    Disgust: '🤢',
    Neutral: '😐',
    Fear: '😨',
    Surprise: '😮'
  };
  return map[emotion] || '🙂';
}


getMoodText(emotion: string): string {
  const descriptions: { [key: string]: string } = {
    Happy: "Vous semblez joyeux aujourd'hui!",
    Sad: "Vous semblez triste ou mélancolique.",
    Angry: "Vous semblez en colère ou frustré.",
    Disgust: "Une émotion de dégoût a été détectée.",
    Neutral: "Votre humeur semble neutre.",
    Fear: "Une certaine peur ou anxiété a été détectée.",
    Surprise: "Vous paraissez surpris ou étonné."
  };
  return descriptions[emotion] || "Analyse d'humeur terminée.";
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
    setTimeout(() => {
      this.isAnalyzing = false;
      this.moodAnalyzed = true;

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

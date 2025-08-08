import { Component, ElementRef, HostListener, ViewChild, OnInit } from '@angular/core';
import { UploadService } from '../services/upload.service';
import { WeatherComponent } from '../weather/weather.component';
import { Router, RouterModule } from '@angular/router';
import { MenuItem, SidebareComponent } from '../sidebare/sidebare.component';
import { BaseChartDirective } from 'ng2-charts'; // Import directive
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { FeedbackService } from '../services/feedback.service';

type LikedType = 'like' | 'dislike' | null;

interface OutfitItem {
  icon: string;
  name: string;
  description: string;
}
// Add to interface section
interface OutfitRecommendationHistory {
  id: number;
  emotion: string;
  confidence: number;
  weather: string;
  temperature: string;
  outfit: string; // JSON string
  accepted?: boolean;
  timestamp: Date;
}
interface OutfitFeedback {
  id: number;
  rating: number;
  comment?: string;
  timestamp: Date;
  recommendation: OutfitRecommendationHistory;
  user?: any; // Optionnel si vous en avez besoin
}

interface Outfit {
  title: string;
  score: number;
  items: OutfitItem[];
  liked: LikedType;
}
interface User {
  id: number;
  name: string;
  email: string;
  // autres propriétés utilisateur
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, WeatherComponent, RouterModule, SidebareComponent, BaseChartDirective], // Add BaseChartDirective
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  @ViewChild('cameraPreview') cameraPreview!: ElementRef<HTMLVideoElement>;
  @ViewChild('userMenuTrigger') userMenuTrigger!: ElementRef;
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  currentStream: MediaStream | null = null;
  moodAnalyzed = false;
  isAnalyzing = false;
  showCaptureButtons = false;
  showUserMenu = false;
  hasNewRecommendation = false;

  capturedImageUrl: string | null = null;
  currentMood = {
    emoji: '😊',
    text: 'Vous semblez joyeux aujourd\'hui!',
    confidence: 87
  };
  historyId: number | null = null;
latestFeedback: OutfitFeedback | null = null;
availableTags = [
    { id: 'comfortable', label: 'Confortable', icon: '😌' },
    { id: 'stylish', label: 'Élégant', icon: '✨' },
    { id: 'weather-appropriate', label: 'Adapté à la météo', icon: '🌤️' },
    { id: 'color-match', label: 'Belles couleurs', icon: '🎨' },
    { id: 'trendy', label: 'Tendance', icon: '🔥' },
    { id: 'classic', label: 'Classique', icon: '👔' },
    { id: 'casual', label: 'Décontracté', icon: '👕' },
    { id: 'formal', label: 'Formel', icon: '🎩' },
    { id: 'not-my-style', label: 'Pas mon style', icon: '🤷' },
    { id: 'too-bold', label: 'Trop osé', icon: '⚡' },
    { id: 'too-simple', label: 'Trop simple', icon: '😐' },
    { id: 'poor-fit', label: 'Mauvaise coupe', icon: '📏' }
  ];
  menuItems: MenuItem[] = [
    { icon: '🏠', label: 'Dashboard', route: '/dashboard', active: true },
    { icon: '📊', label: 'Historique', route: '/history', active: false },
    { icon: '👤', label: 'Profil', route: '/performance', active: false },
    { icon: '⚙️', label: 'Paramètres', route: '/parametres', active: false },
    { icon: '🔔', label: 'Notifications', route: '/notifications', active: false }
  ];

  outfitRecommendations: Outfit[] = [
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

  ];

  quickActions = [
    { icon: '🔄', title: 'Nouvelle Tenue', description: 'Générer d\'autres suggestions' },
    { icon: '⏰', title: 'Notifications', description: 'Programmer votre minute style' },
    { icon: '📊', title: 'Historique', description: 'Voir vos analyses passées', route: '/history' },
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

  readonly FIXED_IMAGE_WIDTH = 780;
  readonly FIXED_IMAGE_HEIGHT = 600;

  public barChartData: any = {
    type: 'bar',
    data: {
      labels: [],
      datasets: [{ label: 'Valeurs', data: [], backgroundColor: ['#ab1dedff', '#e6b9f2ff', '#6e4a74ff', '#ac91b1ff'] }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: { y: { beginAtZero: true } }
    }
  };

  constructor(private uploadService: UploadService,
    private feedbackService: FeedbackService,
    private router: Router,
    private authService: AuthService) {}

  ngOnInit(): void {
    this.feedbackService.getLatestFeedback().subscribe({
      next: (feedback) => {
        this.latestFeedback = feedback || null;
      },
      error: () => {
        this.displayToast('Erreur lors du chargement du dernier feedback');
      }
    });
      this.hasNewRecommendation = false;
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

    this.uploadService.getUserStatistics().subscribe({
      next: (data) => {
        this.statistics = [
          { value: data.moodAnalyses.toString(), label: 'Analyses d\'humeur' },
          { value: data.averageSatisfaction, label: 'Satisfaction moyenne' },
          { value: data.recommendations.toString(), label: 'Tenues recommandées' },
          { value: data.streak.toString(), label: 'Jours d\'utilisation' }
        ];
        this.barChartData.data.labels = this.statistics.map(stat => stat.label);
        this.barChartData.data.datasets[0].data = this.statistics.map(stat => parseInt(stat.value.replace('%', '')) || 0);
        if (this.chart) this.chart.update(); // Update chart if reference exists
      },
      error: () => {
        this.displayToast('Erreur lors du chargement des statistiques');
      }
    });

    this.refreshStatistics();

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
      setTimeout(() => this.captureImageFromCamera(), 3000);
    } catch (error) {
      console.error('Erreur caméra:', error);
      this.displayToast('Impossible d\'accéder à la caméra');
    }
  }

  captureImageFromCamera(): void {
    if (!this.cameraPreview || !this.currentStream) return;
    const video = this.cameraPreview.nativeElement;
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) {
      this.displayToast('Erreur lors de la capture');
      return;
    }
    canvas.width = this.FIXED_IMAGE_WIDTH;
    canvas.height = this.FIXED_IMAGE_HEIGHT;
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
      if (file) this.processUploadedImage(file);
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
        canvas.width = this.FIXED_IMAGE_WIDTH;
        canvas.height = this.FIXED_IMAGE_HEIGHT;
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

        this.hasNewRecommendation = true;

     if (!response.historyId) {
          this.displayToast('Erreur : ID de recommandation manquant');
          return;
        }
        this.historyId = response.historyId;

        const newOutfit: Outfit = { ...response.outfit, score: response.outfit.score, liked: null };
        this.outfitRecommendations = [newOutfit];
      },
      error: () => {
        this.displayToast('Erreur lors de l\'analyse');
        this.isAnalyzing = false;
        // Reset en cas d'erreur
        this.hasNewRecommendation = false;
      }
    });
  }

  getEmoji(emotion: string): string {
    const map: { [key: string]: string } = {
      happy: '😊',
      sad: '😢',
      angry: '😠',
      disgust: '🤢',
      neutral: '😐',
      fear: '😨',
      surprise: '😮'
    };
    return map[emotion.toLowerCase()] || '🙂';
  }

  getMoodText(emotion: string): string {
    const descriptions: { [key: string]: string } = {
      happy: 'Vous semblez joyeux aujourd\'hui!',
      sad: 'Vous semblez triste aujourd\'hui!',
      angry: 'Vous semblez en colère ou frustré.',
      disgust: 'Une émotion de dégoût a été détectée.',
      neutral: 'Votre humeur semble neutre.',
      fear: 'Une certaine peur ou anxiété a été détectée.',
      surprise: 'Vous paraissez surpris ou étonné.'
    };
    return descriptions[emotion.toLowerCase()] || 'Analyse d\'humeur terminée.';
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
     this.hasNewRecommendation = false;
    this.displayToast('Prêt pour une nouvelle capture');
  }

 giveFeedback(type: 'like' | 'dislike', outfitIndex: number): void {
  const accepted = type === 'like';
  this.outfitRecommendations[outfitIndex].liked = type;
  if (this.historyId) {
    this.uploadService.saveRecommendationFeedback(this.historyId, accepted).subscribe({
      next: () => {
        this.displayToast(accepted ? 'Merci pour votre retour positif !' : 'Nous prendrons en compte vos préférences.');
        // Rafraîchir le dernier feedback après avoir donné un avis
        this.refreshLatestFeedback();
      },
      error: () => this.displayToast('Erreur lors de l\'enregistrement du feedback')
    });
  }
}

 generateNewOutfit(): void {
    this.displayToast('Génération de nouvelles tenues en cours...');
    const newOutfit = {
      title: 'Alternative Décontractée',
      score: 80,
      items: [
        { icon: '👕', name: 'Polo', description: 'Bleu marine' },
        { icon: '👖', name: 'Pantalon chino', description: 'Beige' },
        { icon: '👟', name: 'Sneakers', description: 'Casual' }
      ],
      liked: null
    };
    this.outfitRecommendations = [newOutfit]; // Replace instead of unshift
    this.hasNewRecommendation = true;
    const payload = {
      imagePath: this.capturedImageUrl?.split('/').pop(),
      emotion: this.currentMood.text,
      confidence: this.currentMood.confidence,
      weather: this.weather.condition,
      temperature: this.weather.temperature,
      outfit: JSON.stringify(newOutfit),
      accepted: null
    };
    this.uploadService.saveRecommendation(payload).subscribe({
      next: () => this.displayToast('Nouvelle recommandation enregistrée.'),
      error: () => this.displayToast('Erreur lors de l\'enregistrement.')
    });
  }

  openFeedbackPage(outfitIndex: number): void {
    const outfit = this.outfitRecommendations[outfitIndex];
    this.router.navigate(['/feedback'], {
      state: {
        outfitItems: outfit.items,
        outfitId: this.historyId?.toString(),
        style: outfit.title.includes('Alternative') ? 'alternative' : 'sunny',
        image: this.capturedImageUrl,
        feedbackSentFor: this.historyId?.toString()
      }
    });
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
    const action = this.quickActions[actionIndex];
    if (action.route) {
      this.router.navigate([action.route]);
      return;
    }
    switch (actionIndex) {
      case 0:
        this.generateNewOutfit();
        break;
      case 1:
        this.setNotificationTime();
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

  toggleUserMenu(event: MouseEvent): void {
    this.showUserMenu = !this.showUserMenu;
    event.stopPropagation();
  }

  refreshStatistics(): void {
    this.uploadService.getUserStatistics().subscribe({
      next: (data) => {
        this.statistics = [
          { value: data.moodAnalyses.toString(), label: 'Analyses d\'humeur' },
          { value: data.averageSatisfaction, label: 'Satisfaction moyenne' },
          { value: data.recommendations.toString(), label: 'Tenues recommandées' },
          { value: data.streak.toString(), label: 'Jours d\'utilisation' }
        ];
        this.barChartData.data.labels = this.statistics.map(stat => stat.label);
        this.barChartData.data.datasets[0].data = this.statistics.map(stat => parseInt(stat.value.replace('%', '')) || 0);
        if (this.chart) this.chart.update(); // Update chart if reference exists
        this.displayToast('Statistiques mises à jour.');
      },
      error: () => this.displayToast('Erreur lors du rafraîchissement.')
    });
  }

  private displayToast(message: string): void {
    this.showToastMessage = message;
    this.showToast = true;
    setTimeout(() => {
      this.showToast = false;
    }, 3000);
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    const userMenu = this.userMenuTrigger?.nativeElement;
    if (userMenu && !userMenu.contains(event.target)) {
      this.showUserMenu = false;
    }
  }

  ngOnDestroy(): void {
    this.stopCamera();
  }
  logout(): void {
    this.authService.logout(); // Call AuthService logout
    this.router.navigate(['/login']); // Redirect to login page
  }

  formatDate(timestamp: string | Date): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

  if (diffInHours < 1) {
    return 'Il y a moins d\'une heure';
  } else if (diffInHours < 24) {
    return `Il y a ${diffInHours} heure${diffInHours > 1 ? 's' : ''}`;
  } else {
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `Il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`;
    } else {
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    }
  }
}

refreshLatestFeedback(): void {
  this.feedbackService.getLatestFeedback().subscribe({
    next: (feedback) => {
      this.latestFeedback = feedback || null;
    },
    error: (error) => {
      console.error('Erreur lors du chargement du feedback:', error);
      this.displayToast('Erreur lors du chargement du feedback');
    }
  });
}
}

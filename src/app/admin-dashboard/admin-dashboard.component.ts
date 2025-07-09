import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
interface Recommendation {
  id: number;
  user: string;
  emotion: string;
  weather: string;
  temperature: number;
  location: string;
  outfit: string;
  rating: number;
  feedback: string;
  timestamp: string;
}

interface DashboardStats {
  totalRecommendations: number;
  activeUsers: number;
  avgRating: number;
  conversionRate: number;
}
@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
   imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent  implements OnInit {
activeTab: string = 'overview';
  filterPeriod: string = '7d';
  selectedEmotion: string = 'all';

  dashboardStats: DashboardStats = {
    totalRecommendations: 15420,
    activeUsers: 2847,
    avgRating: 4.2,
    conversionRate: 68.5
  };

  recommendations: Recommendation[] = [
    {
      id: 1,
      user: 'Alice Martin',
      emotion: 'happy',
      weather: 'sunny',
      temperature: 22,
      location: 'Paris',
      outfit: 'Robe d\'été colorée, sandales plates',
      rating: 5,
      feedback: 'Parfait pour ma journée au parc !',
      timestamp: '2024-07-09 14:30'
    },
    {
      id: 2,
      user: 'Marc Dubois',
      emotion: 'confident',
      weather: 'cloudy',
      temperature: 18,
      location: 'Lyon',
      outfit: 'Costume bleu marine, chaussures en cuir',
      rating: 4,
      feedback: 'Très bien pour ma réunion importante',
      timestamp: '2024-07-09 09:15'
    },
    {
      id: 3,
      user: 'Sophie Laurent',
      emotion: 'relaxed',
      weather: 'rainy',
      temperature: 15,
      location: 'Marseille',
      outfit: 'Jean, pull cozy, bottes imperméables',
      rating: 4,
      feedback: 'Confortable et pratique',
      timestamp: '2024-07-09 11:45'
    },
    {
      id: 4,
      user: 'Thomas Chen',
      emotion: 'energetic',
      weather: 'sunny',
      temperature: 25,
      location: 'Nice',
      outfit: 'Short cargo, t-shirt technique, baskets',
      rating: 5,
      feedback: 'Idéal pour ma session de sport !',
      timestamp: '2024-07-08 16:20'
    },
    {
      id: 5,
      user: 'Emma Rodriguez',
      emotion: 'romantic',
      weather: 'clear',
      temperature: 20,
      location: 'Bordeaux',
      outfit: 'Robe midi fleurie, escarpins, veste légère',
      rating: 5,
      feedback: 'Parfait pour mon rendez-vous',
      timestamp: '2024-07-08 19:00'
    }
  ];

  emotionStats = {
    happy: 32,
    confident: 28,
    relaxed: 25,
    energetic: 15,
    romantic: 12,
    sad: 8
  };

  weatherStats = {
    sunny: 45,
    cloudy: 30,
    rainy: 15,
    clear: 10
  };

  emotions = ['all', 'happy', 'confident', 'relaxed', 'energetic', 'romantic', 'sad'];

  ngOnInit() {
    // Initialisation des données
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  getEmotionColor(emotion: string): string {
    const colors: { [key: string]: string } = {
      happy: 'emotion-happy',
      confident: 'emotion-confident',
      relaxed: 'emotion-relaxed',
      energetic: 'emotion-energetic',
      romantic: 'emotion-romantic',
      sad: 'emotion-sad'
    };
    return colors[emotion] || 'emotion-default';
  }

  getWeatherIcon(weather: string): string {
    const icons: { [key: string]: string } = {
      sunny: '☀️',
      cloudy: '☁️',
      rainy: '🌧️',
      clear: '🌤️'
    };
    return icons[weather] || '🌤️';
  }

  getStarArray(rating: number): boolean[] {
    return Array.from({ length: 5 }, (_, i) => i < rating);
  }

  get filteredRecommendations(): Recommendation[] {
    if (this.selectedEmotion === 'all') {
      return this.recommendations;
    }
    return this.recommendations.filter(rec => rec.emotion === this.selectedEmotion);
  }

  exportData() {
    console.log('Export des données...');
    // Implémentation de l'export
  }

  getEmotionPercentage(count: number): number {
    return (count / 50) * 100;
  }

  getWeatherPercentage(count: number): number {
    return (count / 50) * 100;
  }
}

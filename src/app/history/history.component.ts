import { Component, OnInit } from '@angular/core';
import { UploadService } from '../services/upload.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebareComponent } from '../sidebare/sidebare.component';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebareComponent],
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css']
})
export class HistoryComponent implements OnInit {
  historique: any[] = [];
  filteredHistory: any[] = [];
  searchTerm: string = '';
  filterEmotion: string = '';
  filterWeather: string = '';
  sortBy: string = 'recent';

  // Émotions et météo disponibles pour les filtres
  emotions: string[] = ['Joyeux', 'Calme', 'Énergique', 'Triste', 'Stressé'];
  weathers: string[] = ['Ensoleillé', 'Nuageux', 'Pluvieux', 'Neigeux', 'Venteux'];

  constructor(private historiqueService: UploadService) {}

  ngOnInit(): void {
    this.loadHistory();
  }

  loadHistory(): void {
    this.historiqueService.getHistory().subscribe(data => {
      this.historique = data;
      this.filteredHistory = [...data];
      this.applyFilters();
    });
  }

  getImageUrl(imagePath: string): string {
    return `http://localhost:8075/user/image/${imagePath}`;
  }

  parseOutfit(json: string): any[] {
    try {
      return JSON.parse(json).items;
    } catch {
      return [];
    }
  }

  onSearch(): void {
    this.applyFilters();
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = [...this.historique];

    // Recherche textuelle
    if (this.searchTerm) {
      filtered = filtered.filter(item =>
        item.emotion.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        item.weather.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    // Filtre par émotion
    if (this.filterEmotion) {
      filtered = filtered.filter(item => item.emotion === this.filterEmotion);
    }

    // Filtre par météo
    if (this.filterWeather) {
      filtered = filtered.filter(item => item.weather === this.filterWeather);
    }

    // Tri
    this.sortHistory(filtered);
    this.filteredHistory = filtered;
  }

  sortHistory(items: any[]): void {
    items.sort((a, b) => {
      switch (this.sortBy) {
        case 'recent':
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        case 'oldest':
          return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
        case 'emotion':
          return a.emotion.localeCompare(b.emotion);
        case 'weather':
          return a.weather.localeCompare(b.weather);
        default:
          return 0;
      }
    });
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.filterEmotion = '';
    this.filterWeather = '';
    this.sortBy = 'recent';
    this.applyFilters();
  }

  getEmotionIcon(emotion: string): string {
    const icons: { [key: string]: string } = {
      'Joyeux': '😊',
      'Calme': '😌',
      'Énergique': '⚡',
      'Triste': '😢',
      'Stressé': '😰'
    };
    return icons[emotion] || '😐';
  }

  getWeatherIcon(weather: string): string {
    const icons: { [key: string]: string } = {
      'Ensoleillé': '☀️',
      'Nuageux': '☁️',
      'Pluvieux': '🌧️',
      'Neigeux': '❄️',
      'Venteux': '💨'
    };
    return icons[weather] || '🌤️';
  }

  deleteHistoryItem(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette recommandation ?')) {
      this.historique = this.historique.filter(item => item.id !== id);
      this.applyFilters();
    }
  }

   trackByFn(index: number, item: any): any {
    return item.id || index;
  }
}

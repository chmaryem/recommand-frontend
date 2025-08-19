import { Component, OnInit } from '@angular/core';
import { UploadService } from '../../services/upload.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebareComponent } from '../sidebare/sidebare.component';
import { Chart, registerables, ChartConfiguration, Tick } from 'chart.js';
import { finalize } from 'rxjs/operators';

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
  showErrorModal = false;
  errorMessage = '';
  showLoading = false;
  confirmModalVisible = false;
  itemToDeleteId: number | null = null;

  emotions: string[] = ['sad', 'fear', 'neutral', 'happy', 'angry'];
  weathers: string[] = ['Ensoleillé', 'Nuageux', 'Pluvieux', 'Neigeux', 'Venteux'];
  emotionData: { date: string, emotion: string, value: number }[] = [];

  constructor(private historiqueService: UploadService) {
    Chart.register(...registerables);
  }

  ngOnInit(): void {
    this.loadHistory();
  }

  loadHistory(): void {
    this.historiqueService.getHistory().subscribe(data => {
      
      this.historique = data.filter(item => this.hasRecommendation(item));
      this.filteredHistory = [...this.historique];
      this.aggregateEmotionData();
      this.applyFilters();
      this.renderEmotionChart();
    });
  }

  aggregateEmotionData(): void {
    const emotionMap: { [key: string]: { emotion: string, timestamp: string } } = {};

    // Take the most recent emotion for each day
    this.historique.forEach(item => {
      const date = new Date(item.timestamp).toLocaleDateString('fr-FR');
      if (!emotionMap[date] || new Date(item.timestamp) > new Date(emotionMap[date].timestamp)) {
        emotionMap[date] = { emotion: item.emotion, timestamp: item.timestamp };
      }
    });

    const emotionValues: { [key: string]: number } = {
      sad: 1,
      fear: 2,
      neutral: 3,
      happy: 4,
      angry: 5
    };

    this.emotionData = Object.keys(emotionMap).map(date => ({
      date,
      emotion: emotionMap[date].emotion,
      value: emotionValues[emotionMap[date].emotion] || 3 // Default to neutral if unknown
    })).sort((a, b) => new Date(a.date.split('/').reverse().join('-')).getTime() - new Date(b.date.split('/').reverse().join('-')).getTime());
  }

  renderEmotionChart(): void {
    const ctx = (document.getElementById('emotionChart') as HTMLCanvasElement)?.getContext('2d');
    if (ctx) {
      const labels: string[] = ['', 'Sad', 'fear', 'angry', 'neutral', 'happy', ''];
      const config: ChartConfiguration = {
        type: 'line',
        data: {
          labels: this.emotionData.map(data => data.date),
          datasets: [{
            label: 'Progression des émotions',
            data: this.emotionData.map(data => data.value),
            borderColor: 'rgba(242, 168, 243, 1)',
            backgroundColor: 'rgba(212, 142, 237, 0.2)',
            fill: true,
            tension: 0.4,
            pointBackgroundColor: this.emotionData.map(data => this.getEmotionColor(data.emotion)),
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgba(206, 136, 213, 1)'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: { title: { display: true, text: 'Date' } },
            y: {
              min: 0,
              max: 6,
              ticks: {
                stepSize: 1,
                callback: (tickValue: string | number, index: number, ticks: Tick[]): string | undefined => {
                  const value = typeof tickValue === 'number' ? tickValue : parseFloat(tickValue);
                  return Number.isFinite(value) ? labels[value] || '' : '';
                }
              },
              title: { display: true, text: 'Émotion' }
            }
          },
          plugins: {
            legend: { position: 'top' },
            title: {
              display: true,
              text: 'Progression des émotions par jour',
              font: { size: 18 }
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const index = context.dataIndex;
                  const emotion = this.emotionData[index].emotion;
                  return `Émotion: ${emotion.charAt(0).toUpperCase() + emotion.slice(1)}`;
                }
              }
            }
          }
        }
      };
      new Chart(ctx, config);
    }
  }

  getEmotionColor(emotion: string): string {
    const colors: { [key: string]: string } = {
      happy: 'rgba(75, 192, 192, 1)',
      neutral: 'rgba(201, 203, 207, 1)',
      angry: 'rgba(255, 99, 132, 1)',
      sad: 'rgba(54, 162, 235, 1)',
      fear: 'rgba(255, 206, 86, 1)'
    };
    return colors[emotion] || 'rgba(128, 128, 128, 1)';
  }

  getImageUrl(imagePath: string): string {
    return `http://localhost:8075/user/image/${imagePath}`;
  }

  parseOutfit(outfitData: any): any[] {
    try {
      // Si c'est déjà un objet, vérifier le format
      if (typeof outfitData === 'object') {
        // Format avec propriétés séparées (haut, bas, chaussures)
        if (outfitData.haut || outfitData.bas || outfitData.chaussures) {
          const items = [];
          if (outfitData.haut) items.push({ category: 'Haut', name: outfitData.haut, icon: '👕' });
          if (outfitData.bas) items.push({ category: 'Bas', name: outfitData.bas, icon: '👖' });
          if (outfitData.chaussures) items.push({ category: 'Chaussures', name: outfitData.chaussures, icon: '👟' });
          return items;
        }
       
        else if (Array.isArray(outfitData.items)) {
          return outfitData.items;
        }
      }
    
      else if (typeof outfitData === 'string') {
        const parsed = JSON.parse(outfitData);
        return this.parseOutfit(parsed);
      }
    } catch (e) {
      console.error('Erreur parsing outfit:', e);
    }
    return [];
  }

  onSearch(): void {
    this.applyFilters();
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = [...this.historique];

    if (this.searchTerm) {
      filtered = filtered.filter(item =>
        item.emotion.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        item.weather.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    if (this.filterEmotion) {
      filtered = filtered.filter(item => item.emotion === this.filterEmotion);
    }

    if (this.filterWeather) {
      filtered = filtered.filter(item => item.weather === this.filterWeather);
    }

    this.sortHistory(filtered);
    this.filteredHistory = filtered;
    this.aggregateEmotionData();
    this.renderEmotionChart();
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
      happy: '😊',
      neutral: '😌',
      angry: '😣',
      sad: '😢',
      fear: '😰'
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

  askDeleteConfirmation(id: number): void {
    this.itemToDeleteId = id;
    this.confirmModalVisible = true;
  }

  confirmDelete(): void {
    if (this.itemToDeleteId !== null) {
      this.showLoading = true;

      this.historiqueService.deleteHistoryItem(this.itemToDeleteId)
        .pipe(
          finalize(() => {
            this.showLoading = false;
            this.confirmModalVisible = false;
            this.itemToDeleteId = null;
          })
        )
        .subscribe({
          next: () => {
            this.historique = this.historique.filter(item => item.id !== this.itemToDeleteId);
            this.applyFilters();
          },
          error: () => {
            this.errorMessage = 'Erreur lors de la suppression.';
            this.showErrorModal = true;
          }
        });
    }
  }

  cancelDelete(): void {
    this.confirmModalVisible = false;
    this.itemToDeleteId = null;
  }

  closeModal(): void {
    this.showErrorModal = false;
  }

  trackByFn(index: number, item: any): any {
    return item.id || index;
  }

  private hasRecommendation(rec: any): boolean {
    if (!rec) return false;

    
    const hasImage = !!rec.imagePath;

   
    let hasValidOutfit = false;
    const raw = rec.recommendedOutfit;

    if (raw) {
      try {
        const data = typeof raw === 'string' ? JSON.parse(raw) : raw;

        
        if (data.haut || data.bas || data.chaussures) {
          hasValidOutfit = true;
        }
        // Cas 2: format { items: [...] }
        else if (Array.isArray(data?.items)) {
          hasValidOutfit = data.items.length > 0;
        }
        // Cas 3: autre format d'objet
        else if (data && typeof data === 'object') {
          hasValidOutfit = Object.keys(data).length > 0;
        }
      } catch {
       
        hasValidOutfit = false;
      }
    }

   
    return hasImage && hasValidOutfit;
  }
}

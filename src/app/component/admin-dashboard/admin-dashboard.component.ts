import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminDashboardApi } from '../../services/AdminDashboardApi.service';
import { catchError, forkJoin, of } from 'rxjs';

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
  satisfactionRate: number;
}

interface ActivityData {
  day: string;
  recommendations: number;
  users: number;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  activeTab: string = 'overview';
  filterPeriod: string = '30d';
  selectedEmotion: string = 'all';
  isLoading: boolean = false;
  animatedStats: boolean = false;

  // Configuration du graphique

  svgContainerWidth: number = 0;
  isChartInitialized: boolean = false;

chartHeight = 200;
groupWidth = 60;  // Augmenté pour plus d'espace
barWidth = 20;    // Augmenté pour des barres plus larges
barGap = 12;      // Augmenté pour plus d'espace entre les barres
labelSpace = 40;
  @ViewChild('svgContainer') svgContainer!: ElementRef;
  private resizeObserver!: ResizeObserver;

  dashboardStats: DashboardStats = {
    totalRecommendations: 0,
    activeUsers: 0,
    avgRating: 0,
    conversionRate: 0,
    satisfactionRate: 0
  };

  displayStats: DashboardStats = {
    totalRecommendations: 0,
    activeUsers: 0,
    avgRating: 0,
    conversionRate: 0,
    satisfactionRate: 0
  };

  recommendations: Recommendation[] = [];
  page = 0;
  size = 20;
  totalElements = 0;
  totalPages = 0;

  emotionStats: Record<string, number> = {};
  weatherStats: Record<string, number> = {};
  private emotionTotal = 0;
  private weatherTotal = 0;

  emotions = ['all', 'happy', 'angry', 'disgust', 'neutral', 'fear', 'surprise', 'sad'];

  activityData: ActivityData[] = [];
  detailsOpen = false;
  selectedRec: Recommendation | null = null;


  constructor(private api: AdminDashboardApi) {}

  ngOnInit() {
    this.loadAll();
  }

  ngAfterViewInit() {
    this.setupResizeObserver();
  }

  ngOnDestroy() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }
 barX(index: number, which: 'recos' | 'users'): number {
  const groupCenter = index * this.groupWidth + this.groupWidth / 2;
  const offset = which === 'recos' ? -this.barWidth - this.barGap/2 : this.barGap/2;
  return groupCenter + offset;
}

  setupResizeObserver() {
    this.resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        if (entry.target === this.svgContainer.nativeElement) {
          this.calculateSvgWidth();
        }
      }
    });

    if (this.svgContainer && this.svgContainer.nativeElement) {
      this.resizeObserver.observe(this.svgContainer.nativeElement);
    }
  }

 calculateSvgWidth() {
  if (this.svgContainer && this.svgContainer.nativeElement) {
    this.svgContainerWidth = this.svgContainer.nativeElement.clientWidth - 40; // Retirer les marges
    this.isChartInitialized = true;

    // Recalculer les dimensions des barres si nécessaire
    if (this.activityData.length > 0) {
      this.recalculateBarDimensions();
    }
  }
}
private recalculateBarDimensions() {
  if (this.svgContainerWidth && this.activityData.length > 0) {
    // Calculer l'espace disponible pour les barres (en excluant les marges)
    const availableWidth = this.svgContainerWidth - 80; // 40px à gauche, 40px à droite
    const optimalGroupWidth = availableWidth / this.activityData.length;

    // Ajuster les dimensions si nécessaire
    if (optimalGroupWidth > 30) { // Minimum viable
      this.groupWidth = Math.min(optimalGroupWidth, 80); // Maximum 80px
      this.barWidth = Math.min(this.groupWidth * 0.35, 25); // 35% de la largeur du groupe, max 25px
      this.barGap = Math.min(this.groupWidth * 0.15, 8); // 15% de la largeur du groupe, max 8px
    }
  }
}

  loadAll() {
    this.isLoading = true;
    const period = this.filterPeriod;

    forkJoin({
      kpis: this.api.kpis(period).pipe(catchError(err => this.handleError(err, 'kpis'))),
      activity: this.api.activity(period).pipe(catchError(err => this.handleError(err, 'activity'))),
      emo: this.api.emotionDistribution(period).pipe(catchError(err => this.handleError(err, 'emotion'))),
      weather: this.api.weatherDistribution(period).pipe(catchError(err => this.handleError(err, 'weather'))),
      table: this.api.recommendations({
        period, emotion: this.selectedEmotion, page: this.page, size: this.size, sort: 'timestamp,desc'
      }).pipe(catchError(err => this.handleError(err, 'recommendations')))
    }).subscribe({
      next: (results) => {
        this.activityData = Array.isArray(results.activity) ? this.formatActivityData(results.activity) : [];

        this.dashboardStats = results.kpis as any;
        this.animateStatsOnLoad();

        const emoArr = results.emo as Array<{ key: string; count: number }>;
        this.emotionStats = Object.fromEntries(emoArr.map(e => [e.key, e.count]));
        this.emotionTotal = emoArr.reduce((s, e) => s + e.count, 0);

        const wArr = results.weather as Array<{ key: string; count: number }>;
        this.weatherStats = Object.fromEntries(wArr.map(w => [w.key, w.count]));
        this.weatherTotal = wArr.reduce((s, w) => s + w.count, 0);

        const t = results.table as {
          content: any[]; page: number; size: number;
          totalElements: number; totalPages: number; last: boolean;
        };
        this.recommendations = t.content as any[];
        this.page = t.page;
        this.size = t.size;
        this.totalElements = t.totalElements;
        this.totalPages = t.totalPages;

        this.isLoading = false;
        setTimeout(() => this.calculateSvgWidth(), 0);
      },
      error: (err) => {
        console.error('Global error:', err);
        this.isLoading = false;
      }
    });
  }

  // Formater les données d'activité pour s'assurer qu'elles sont correctes
  private formatActivityData(data: any[]): ActivityData[] {
    return data.map(item => ({
      day: this.formatDayLabel(item.day),
      recommendations: Number(item.recommendations) || 0,
      users: Number(item.users) || 0
    }));
  }

  // Formater les étiquettes de jour pour qu'elles soient plus lisibles
  private formatDayLabel(day: string): string {
    // Si le jour est dans un format de date, le formater
    if (day.includes('/') || day.includes('-')) {
      try {
        const date = new Date(day);
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString('fr-FR', {
            month: 'short',
            day: 'numeric'
          });
        }
      } catch (e) {
        console.warn('Erreur de format de date:', day, e);
      }
    }

    // Si ce n'est pas une date, retourner la valeur telle quelle
    return day.length > 8 ? day.substring(0, 8) + '...' : day;
  }

  private handleError(error: any, context: string) {
    console.error(`Error in ${context}:`, {
      status: error.status,
      message: error.message,
      url: error.url
    });

    switch(context) {
      case 'activity':
        // Données factices pour le développement
        return of(this.generateMockActivityData());
      case 'kpis':
        return of({
          totalRecommendations: 1254,
          activeUsers: 342,
          avgRating: 4.2,
          conversionRate: 78.5,
          satisfactionRate: 82.3
        });
      case 'recommendations':
        return of({
          content: [],
          totalElements: 0,
          page: 0,
          size: 10,
          totalPages: 0,
          last: true
        });
      default:
        return of([]);
    }
  }

  // Générer des données factices pour le développement
  private generateMockActivityData(): ActivityData[] {
    const days = [];
    const now = new Date();

    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);

      days.push({
        day: date.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' }),
        recommendations: Math.floor(Math.random() * 50) + 20,
        users: Math.floor(Math.random() * 30) + 10
      });
    }

    return days;
  }

  animateStatsOnLoad() {
    this.animatedStats = true;

    this.displayStats = {
      totalRecommendations: 0, activeUsers: 0, avgRating: 0,
      conversionRate: 0, satisfactionRate: 0
    };

    setTimeout(() => {
      this.animateNumber('totalRecommendations', this.dashboardStats.totalRecommendations);
      this.animateNumber('activeUsers', this.dashboardStats.activeUsers);
      this.animateNumber('avgRating', this.dashboardStats.avgRating, 10);
      this.animateNumber('conversionRate', this.dashboardStats.conversionRate, 10);
      this.animateNumber('satisfactionRate', this.dashboardStats.satisfactionRate, 10);
    }, 50);
  }

  animateNumber(property: keyof DashboardStats, target: number, divisor: number = 100) {
    const duration = 800;
    const increment = target / (duration / 16);
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      (this.displayStats as any)[property] =
        property === 'avgRating' || property === 'conversionRate' || property === 'satisfactionRate'
          ? Math.round(current * 10) / 10
          : Math.floor(current);
    }, 16);
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  onPeriodChange() {
    this.page = 0;
    this.loadAll();
  }

  onEmotionFilterChange() {
    this.page = 0;

    const table = document.querySelector('.modern-table tbody');
    table?.classList.add('fade-transition');
    setTimeout(() => table?.classList.remove('fade-transition'), 300);

    this.loadAll();
  }

  refreshData() {
    this.loadAll();
  }

  getEmotionColor(emotion: string): string {
    const colors: { [key: string]: string } = {
      happy: 'emotion-happy',
      angry: 'emotion-confident',
      disgust: 'emotion-relaxed',
      neutral: 'emotion-energetic',
      fear: 'emotion-romantic',
      surprise: 'emotion-surprise',
      sad: 'emotion-sad'
    };
    return colors[emotion] || 'emotion-default';
  }

  getWeatherIcon(weather: string): string {
    const icons: { [key: string]: string } = {
      sunny: '☀️',
      cloudy: '☁️',
      rainy: '🌧️',
      clear: '🌤️',
      snowy: '❄️',
      windy: '💨',
      stormy: '⛈️'
    };
    return icons[weather] || '🌤️';
  }

  getStarArray(rating: number): boolean[] {
    return Array.from({ length: 5 }, (_, i) => i < rating);
  }

  getEmotionPercentage(count: number): number {
    if (!this.emotionTotal) return 0;
    return Math.round((count / this.emotionTotal) * 100);
  }

  getWeatherPercentage(count: number): number {
    if (!this.weatherTotal) return 0;
    return Math.round((count / this.weatherTotal) * 100);
  }

  get avgRecommendationsPerUser(): number {
    return this.dashboardStats.activeUsers > 0
      ? Math.round((this.dashboardStats.totalRecommendations / this.dashboardStats.activeUsers) * 10) / 10
      : 0;
  }

  barHeight(value: number): number {
    const v = Number(value) || 0;
    const m = this.maxActivityValue || 1;
    const h = (v / m) * (this.chartHeight - 20); // Réserver de l'espace pour les labels
    return v > 0 && h < 6 ? 6 : h;
  }



  barY(value: number): number {
    const h = this.barHeight(value);
    return this.chartHeight - h - 5; // Ajuster pour l'espace en bas
  }

svgWidth(): number {
  if (!this.activityData.length) return this.svgContainerWidth || 800;

  // Utiliser toute la largeur du conteneur
  const calculatedWidth = this.activityData.length * this.groupWidth + 80;
  const containerWidth = this.svgContainerWidth || 800;

  // Utiliser au minimum la largeur du conteneur
  return Math.max(calculatedWidth, containerWidth);
}

  get maxActivityValue(): number {
    if (!this.activityData.length) return 1;
    const recos = this.activityData.map(d => d.recommendations);
    const users = this.activityData.map(d => d.users);
    const max = Math.max(...recos, ...users);
    return Number.isFinite(max) && max > 0 ? max : 1;
  }

  getTrendIcon(change: number): string {
    if (change > 0) return '📈';
    if (change < 0) return '📉';
    return '➡️';
  }

  // ====== Pagination & export ======
  nextPage() {
    if (this.page + 1 < this.totalPages) {
      this.page++;
      this.loadAll();
    }
  }

  prevPage() {
    if (this.page > 0) {
      this.page--;
      this.loadAll();
    }
  }

  exportData() {
    this.isLoading = true;
    this.api.exportRecommendations(this.filterPeriod, this.selectedEmotion).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `recommendations_${this.filterPeriod}_${this.selectedEmotion}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        this.isLoading = false;
      },
      error: _ => { this.isLoading = false; }
    });
  }
  openDetails(rec: Recommendation) {
    this.selectedRec = rec;
    this.detailsOpen = true;

    // Petit lock scroll (optionnel)
    document.body.style.overflow = 'hidden';

    // Focus dans le modal
    setTimeout(() => {
      const el = document.querySelector('.modal') as HTMLElement | null;
      el?.focus();
    }, 0);
  }


  closeDetails() {
    this.detailsOpen = false;
    this.selectedRec = null;
    document.body.style.overflow = '';
  }


  onBackdropClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.closeDetails();
    }
  }


  editSelected() {
    if (!this.selectedRec) return;

  }
}

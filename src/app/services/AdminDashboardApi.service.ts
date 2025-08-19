// src/app/services/admin-dashboard.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { catchError, map, of } from 'rxjs';
// src/app/services/admin-dashboard.service.ts
@Injectable({ providedIn: 'root' })
export class AdminDashboardApi {
  private base = 'http://localhost:8075/admin';
  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders(
      token ? { 'Authorization': `Bearer ${token}` } : {}
    );
  }

  kpis(period = '30d') {
    return this.http.get<{
      totalRecommendations: number;
      activeUsers: number;
      avgRating: number;
      conversionRate: number;
      satisfactionRate: number;
    }>(`${this.base}/kpis`, { params: { period }, headers: this.getAuthHeaders() });
  }

  activity(period = '30d') {
  return this.http.get<Array<{ day: string; recommendations: number; users: number }>>(
    `${this.base}/activity`,
    { params: { period }, headers: this.getAuthHeaders() }
  ).pipe(
    map(rows => (rows ?? []).map(r => ({
      day: (r as any).day,
      recommendations: Number((r as any).recommendations) || 0,
      users: Number((r as any).users) || 0,
    }))),
    catchError(_ => of([]))
  );
}


  emotionDistribution(period='30d'){
    return this.http.get<Array<{ key: string; count: number }>>(
      `${this.base}/distributions/emotions`, { params: { period }, headers: this.getAuthHeaders() }
    );
  }

  weatherDistribution(period='30d'){
    return this.http.get<Array<{ key: string; count: number }>>(
      `${this.base}/distributions/weather`, { params: { period }, headers: this.getAuthHeaders() }
    );
  }

  recommendations(opts: { period?: string; emotion?: string; page?: number; size?: number; sort?: string } = {}) {
    const params = new HttpParams({ fromObject: {
      period: opts.period || '7d',
      emotion: opts.emotion || 'all',
      page: String(opts.page ?? 0),
      size: String(opts.size ?? 10),
      sort: opts.sort || 'timestamp,desc'
    }});
    return this.http.get<{
      content: any[], page: number, size: number,
      totalElements: number, totalPages: number, last: boolean
    }>(`${this.base}/recommendations`, { params, headers: this.getAuthHeaders() });
  }

  exportRecommendations(period='30d', emotion='all'){
    return this.http.get(`${this.base}/recommendations/export`, {
      params: { period, emotion },
      headers: this.getAuthHeaders(),
      responseType: 'blob'
    });
  }
}

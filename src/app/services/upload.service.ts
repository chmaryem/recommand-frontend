import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UploadService {
  private uploadUrl = 'http://localhost:8075/user/uploadImage';
  private baseUrl = 'http://localhost:8075';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  uploadUserImage(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(this.uploadUrl, formData, { headers: this.getHeaders(), responseType: 'text' });
  }

  uploadBase64Image(base64DataUrl: string): Observable<string> {
    const body = { image: base64DataUrl };
    return this.http.post<string>(`${this.baseUrl}/user/uploadBase64`, body, {
      headers: this.getHeaders(),
      responseType: 'text' as 'json'
    });
  }

  uploadBase64WithAnalysis(base64DataUrl: string): Observable<any> {
    const body = { image: base64DataUrl };
    return this.http.post<any>(`${this.baseUrl}/user/uploadBase64WithAnalysis`, body, {
      headers: this.getHeaders()
    });
  }

  saveRecommendationFeedback(historyId: number, accepted: boolean): Observable<void> {
    const body = { historyId, accepted };
    return this.http.post<void>(`${this.baseUrl}/user/saveRecommendationFeedback`, body, {
      headers: this.getHeaders()
    });
  }

  saveRecommendation(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/user/saveRecommendation`, data, {
      headers: this.getHeaders()
    });
  }

  getHistory(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/user/history`, { headers: this.getHeaders() });
  }

  deleteHistoryItem(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/user/history/${id}`, { headers: this.getHeaders() });
  }

  getUserStatistics(): Observable<any> {
    return this.http.get(`${this.baseUrl}/user/statistics`, { headers: this.getHeaders() });
  }
}

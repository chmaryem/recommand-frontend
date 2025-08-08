// src/app/services/upload.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FeedbackService {

  constructor(private http: HttpClient) {}


  submitFeedback(feedback: any) {
     const token = localStorage.getItem('token');
  const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

  return this.http.post('http://localhost:8075/user/feedback', feedback,{ headers });
}

getRatingByOutfitId(historyId: number | null) {
  const token = localStorage.getItem('token');
  const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
  return this.http.get<number>(`http://localhost:8075/user/feedback/${historyId}`,{ headers });
}
getLatestFeedback(): Observable<any> {
  const token = localStorage.getItem('token');
  const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.get<any>(`http://localhost:8075/user/feedback/latest`,{ headers })
  }








}

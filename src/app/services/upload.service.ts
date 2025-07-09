// src/app/services/upload.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UploadService {

  private uploadUrl = 'http://localhost:8075/user/uploadImage';
  constructor(private http: HttpClient) {}

  uploadUserImage(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.post(this.uploadUrl, formData, { headers, responseType: 'text' });
  }

  uploadBase64Image(base64DataUrl: string): Observable<string> {
  const token = localStorage.getItem('token');
  const headers = new HttpHeaders({
    Authorization: `Bearer ${token}`
  });
  const body = { image: base64DataUrl };

  return this.http.post<string>('http://localhost:8075/user/uploadBase64', body, { headers, responseType: 'text' as 'json' });
}

uploadBase64WithAnalysis(base64DataUrl: string): Observable<any> {
  const token = localStorage.getItem('token');
  const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
  const body = { image: base64DataUrl };

  return this.http.post<any>(
    'http://localhost:8075/user/uploadBase64WithAnalysis',
    body,
    { headers }
  );
}



}

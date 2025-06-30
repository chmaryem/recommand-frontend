import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class WeatherService {
  constructor(private http: HttpClient) {}


  getWeatherByCoords(lat: number, lon: number): Observable<any> {
    return this.http.get(`http://localhost:8075/public/weather/by-coords?lat=${lat}&lon=${lon}`);
  }
}

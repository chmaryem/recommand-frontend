import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { WeatherApiResponse } from '../models/weather.model';

@Injectable({ providedIn: 'root' })
export class WeatherService {
  constructor(private http: HttpClient) {}


  getWeatherByCoords(lat: number, lon: number): Observable<WeatherApiResponse> {
    return this.http.get<WeatherApiResponse>(`http://localhost:8075/public/weather/by-coords?lat=${lat}&lon=${lon}`);
  }
}

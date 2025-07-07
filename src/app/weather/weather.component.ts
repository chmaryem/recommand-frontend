import { Component, OnInit } from '@angular/core';
import { WeatherService } from '../services/weather.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-weather',
  standalone: true,
   imports: [CommonModule, FormsModule],

  templateUrl: './weather.component.html',
  styleUrls: ['./weather.component.css']
})
export class WeatherComponent implements OnInit {
weather: any = null;
  loading = true;
  error = '';

  constructor(private weatherService: WeatherService) {}

  ngOnInit(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;

          this.weatherService.getWeatherByCoords(lat, lon).subscribe({
            next: (data) => {
              this.weather = data;
              this.loading = false;
            },
            error: (err) => {
              this.error = 'Erreur météo';
              console.error(err);
              this.loading = false;
            }
          });
        },
        (err) => {
          this.error = 'Permission de localisation refusée.';
          console.error(err);
          this.loading = false;
        }
      );
    } else {
      this.error = 'Géolocalisation non supportée.';
      this.loading = false;
    }
  }


}

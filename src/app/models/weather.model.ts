export interface WeatherCondition {
  main: string;
  description: string;
}

export interface WeatherMain {
  temp: number;
  humidity: number;
}

export interface WeatherApiResponse {
  name: string;
  weather: WeatherCondition[];
  main: WeatherMain;
}
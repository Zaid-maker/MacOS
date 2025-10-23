import { Cloud, CloudRain, CloudSnow, Droplets, Eye, Gauge, Sun, Wind } from 'lucide-react';
import type React from 'react';
import { useEffect, useState } from 'react';

interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  visibility: number;
  pressure: number;
  feelsLike: number;
  high: number;
  low: number;
  hourly: HourlyForecast[];
  daily: DailyForecast[];
}

interface HourlyForecast {
  time: string;
  temp: number;
  condition: string;
}

interface DailyForecast {
  day: string;
  high: number;
  low: number;
  condition: string;
  precipitation: number;
}

export const Weather: React.FC = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchCity, setSearchCity] = useState('');
  const [locationPermission, setLocationPermission] = useState<'prompt' | 'granted' | 'denied' | null>(null);

  // OpenWeatherMap API key from environment variables
  const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
  const BASE_URL = 'https://api.openweathermap.org/data/2.5';

  const fetchWeatherByCoords = async (lat: number, lon: number) => {
    try {
      setLoading(true);
      setError(null);

      if (!API_KEY) {
        throw new Error('Weather API key not configured. Please add VITE_OPENWEATHER_API_KEY to your .env file');
      }

      // Fetch current weather by coordinates
      const currentResponse = await fetch(`${BASE_URL}/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`);

      if (!currentResponse.ok) {
        throw new Error('Unable to fetch weather for your location');
      }

      const currentData = await currentResponse.json();

      // Fetch forecast by coordinates
      const forecastResponse = await fetch(`${BASE_URL}/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`);

      if (!forecastResponse.ok) {
        throw new Error('Unable to fetch forecast');
      }

      const forecastData = await forecastResponse.json();

      // Process hourly forecast (next 24 hours)
      const hourly: HourlyForecast[] = forecastData.list.slice(0, 8).map((item: any) => ({
        time: new Date(item.dt * 1000).toLocaleTimeString('en-US', {
          hour: 'numeric',
          hour12: true,
        }),
        temp: Math.round(item.main.temp),
        condition: item.weather[0].main,
      }));

      // Process daily forecast (next 7 days)
      const dailyMap = new Map<string, any>();
      forecastData.list.forEach((item: any) => {
        const date = new Date(item.dt * 1000);
        const dayKey = date.toLocaleDateString('en-US', { weekday: 'long' });

        if (!dailyMap.has(dayKey) || dailyMap.size < 7) {
          if (!dailyMap.has(dayKey)) {
            dailyMap.set(dayKey, {
              day: dayKey,
              high: item.main.temp_max,
              low: item.main.temp_min,
              condition: item.weather[0].main,
              precipitation: item.pop ? Math.round(item.pop * 100) : 0,
            });
          } else {
            const existing = dailyMap.get(dayKey);
            dailyMap.set(dayKey, {
              ...existing,
              high: Math.max(existing.high, item.main.temp_max),
              low: Math.min(existing.low, item.main.temp_min),
            });
          }
        }
      });

      const daily: DailyForecast[] = Array.from(dailyMap.values()).map((day) => ({
        ...day,
        high: Math.round(day.high),
        low: Math.round(day.low),
      }));

      // Build weather data object
      const weatherData: WeatherData = {
        location: currentData.name,
        temperature: Math.round(currentData.main.temp),
        condition: currentData.weather[0].main,
        humidity: currentData.main.humidity,
        windSpeed: Math.round(currentData.wind.speed * 3.6), // Convert m/s to km/h
        visibility: Math.round(currentData.visibility / 1000), // Convert m to km
        pressure: currentData.main.pressure,
        feelsLike: Math.round(currentData.main.feels_like),
        high: Math.round(currentData.main.temp_max),
        low: Math.round(currentData.main.temp_min),
        hourly,
        daily,
      };

      setWeather(weatherData);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch weather data');
      setLoading(false);
    }
  };

  const fetchWeatherData = async (city: string) => {
    try {
      setLoading(true);
      setError(null);

      if (!API_KEY) {
        throw new Error('Weather API key not configured. Please add VITE_OPENWEATHER_API_KEY to your .env file');
      }

      // Fetch current weather
      const currentResponse = await fetch(
        `${BASE_URL}/weather?q=${encodeURIComponent(city)}&units=metric&appid=${API_KEY}`
      );

      if (!currentResponse.ok) {
        throw new Error('City not found');
      }

      const currentData = await currentResponse.json();

      // Fetch forecast (5 day / 3 hour)
      const forecastResponse = await fetch(
        `${BASE_URL}/forecast?q=${encodeURIComponent(city)}&units=metric&appid=${API_KEY}`
      );

      if (!forecastResponse.ok) {
        throw new Error('Unable to fetch forecast');
      }

      const forecastData = await forecastResponse.json();

      // Process hourly forecast (next 24 hours)
      const hourly: HourlyForecast[] = forecastData.list.slice(0, 8).map((item: any) => ({
        time: new Date(item.dt * 1000).toLocaleTimeString('en-US', {
          hour: 'numeric',
          hour12: true,
        }),
        temp: Math.round(item.main.temp),
        condition: item.weather[0].main,
      }));

      // Process daily forecast (next 7 days)
      const dailyMap = new Map<string, any>();
      forecastData.list.forEach((item: any) => {
        const date = new Date(item.dt * 1000);
        const dayKey = date.toLocaleDateString('en-US', { weekday: 'long' });

        if (!dailyMap.has(dayKey) || dailyMap.size < 7) {
          if (!dailyMap.has(dayKey)) {
            dailyMap.set(dayKey, {
              day: dayKey,
              high: item.main.temp_max,
              low: item.main.temp_min,
              condition: item.weather[0].main,
              precipitation: item.pop ? Math.round(item.pop * 100) : 0,
            });
          } else {
            const existing = dailyMap.get(dayKey);
            dailyMap.set(dayKey, {
              ...existing,
              high: Math.max(existing.high, item.main.temp_max),
              low: Math.min(existing.low, item.main.temp_min),
            });
          }
        }
      });

      const daily: DailyForecast[] = Array.from(dailyMap.values()).map((day) => ({
        ...day,
        high: Math.round(day.high),
        low: Math.round(day.low),
      }));

      // Build weather data object
      const weatherData: WeatherData = {
        location: currentData.name,
        temperature: Math.round(currentData.main.temp),
        condition: currentData.weather[0].main,
        humidity: currentData.main.humidity,
        windSpeed: Math.round(currentData.wind.speed * 3.6), // Convert m/s to km/h
        visibility: Math.round(currentData.visibility / 1000), // Convert m to km
        pressure: currentData.main.pressure,
        feelsLike: Math.round(currentData.main.feels_like),
        high: Math.round(currentData.main.temp_max),
        low: Math.round(currentData.main.temp_min),
        hourly,
        daily,
      };

      setWeather(weatherData);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch weather data');
      setLoading(false);
    }
  };

  useEffect(() => {
    // Request user's location on mount
    const requestLocation = async () => {
      if ('geolocation' in navigator) {
        setLocationPermission('prompt');
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setLocationPermission('granted');
            fetchWeatherByCoords(position.coords.latitude, position.coords.longitude);
          },
          (error) => {
            console.error('Geolocation error:', error);
            setLocationPermission('denied');
            // Fallback to default city
            fetchWeatherData('San Francisco');
          }
        );
      } else {
        // Geolocation not supported, use default city
        setLocationPermission('denied');
        fetchWeatherData('San Francisco');
      }
    };

    requestLocation();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchCity.trim()) {
      fetchWeatherData(searchCity);
      setSearchCity('');
    }
  };

  const getWeatherGradient = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'clear':
        return 'linear-gradient(135deg, #4A90E2 0%, #87CEEB 100%)';
      case 'clouds':
        return 'linear-gradient(135deg, #5C6B7D 0%, #8B9AAF 100%)';
      case 'rain':
      case 'drizzle':
        return 'linear-gradient(135deg, #4A5568 0%, #718096 100%)';
      case 'thunderstorm':
        return 'linear-gradient(135deg, #2D3748 0%, #4A5568 100%)';
      case 'snow':
        return 'linear-gradient(135deg, #E2E8F0 0%, #CBD5E0 100%)';
      case 'mist':
      case 'smoke':
      case 'haze':
      case 'dust':
      case 'fog':
      case 'sand':
      case 'ash':
      case 'squall':
      case 'tornado':
        return 'linear-gradient(135deg, #6B8FB8 0%, #A9C7E0 100%)';
      default:
        return 'linear-gradient(135deg, #4A90E2 0%, #87CEEB 100%)';
    }
  };

  const WeatherIcon: React.FC<{ condition: string; size?: number }> = ({ condition, size = 24 }) => {
    switch (condition.toLowerCase()) {
      case 'clear':
        return <Sun size={size} />;
      case 'clouds':
        return <Cloud size={size} />;
      case 'rain':
      case 'drizzle':
        return <CloudRain size={size} />;
      case 'thunderstorm':
        return <CloudRain size={size} />;
      case 'snow':
        return <CloudSnow size={size} />;
      case 'mist':
      case 'smoke':
      case 'haze':
      case 'dust':
      case 'fog':
      case 'sand':
      case 'ash':
      case 'squall':
      case 'tornado':
        return <Cloud size={size} />;
      default:
        return <Sun size={size} />;
    }
  };

  if (loading) {
    return (
      <div className="weather-app">
        <div className="weather-loading">
          <div className="weather-loading-spinner"></div>
          <p>{locationPermission === 'prompt' ? 'Requesting location access...' : 'Loading weather data...'}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="weather-app">
        <div className="weather-error">
          <p>{error}</p>
          <button
            onClick={() => {
              setError(null);
              setLoading(true);
              fetchWeatherData('San Francisco');
            }}
          >
            Show Default Location
          </button>
        </div>
      </div>
    );
  }

  if (!weather) return null;

  return (
    <div className="weather-app" style={{ background: getWeatherGradient(weather.condition) }}>
      {/* Search Bar */}
      <div className="weather-search">
        <form onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search for a city..."
            value={searchCity}
            onChange={(e) => setSearchCity(e.target.value)}
            className="weather-search-input"
          />
        </form>
      </div>

      {/* Current Weather */}
      <div className="weather-current">
        <div className="weather-location">{weather.location}</div>
        <div className="weather-icon-large">
          <WeatherIcon condition={weather.condition} size={120} />
        </div>
        <div className="weather-temp-large">{weather.temperature}°</div>
        <div className="weather-condition">{weather.condition}</div>
        <div className="weather-high-low">
          H: {weather.high}° L: {weather.low}°
        </div>
      </div>

      {/* Weather Details */}
      <div className="weather-details">
        <div className="weather-detail-card">
          <div className="weather-detail-icon">
            <Droplets size={20} />
          </div>
          <div className="weather-detail-label">Humidity</div>
          <div className="weather-detail-value">{weather.humidity}%</div>
        </div>

        <div className="weather-detail-card">
          <div className="weather-detail-icon">
            <Wind size={20} />
          </div>
          <div className="weather-detail-label">Wind</div>
          <div className="weather-detail-value">{weather.windSpeed} km/h</div>
        </div>

        <div className="weather-detail-card">
          <div className="weather-detail-icon">
            <Eye size={20} />
          </div>
          <div className="weather-detail-label">Visibility</div>
          <div className="weather-detail-value">{weather.visibility} km</div>
        </div>

        <div className="weather-detail-card">
          <div className="weather-detail-icon">
            <Gauge size={20} />
          </div>
          <div className="weather-detail-label">Pressure</div>
          <div className="weather-detail-value">{weather.pressure} mb</div>
        </div>
      </div>

      {/* Hourly Forecast */}
      <div className="weather-section">
        <div className="weather-section-title">Hourly Forecast</div>
        <div className="weather-hourly">
          {weather.hourly.slice(0, 12).map((hour, index) => (
            <div key={index} className="weather-hourly-item">
              <div className="weather-hourly-time">{hour.time}</div>
              <div className="weather-hourly-icon">
                <WeatherIcon condition={hour.condition} size={24} />
              </div>
              <div className="weather-hourly-temp">{hour.temp}°</div>
            </div>
          ))}
        </div>
      </div>

      {/* 7-Day Forecast */}
      <div className="weather-section">
        <div className="weather-section-title">7-Day Forecast</div>
        <div className="weather-daily">
          {weather.daily.map((day, index) => (
            <div key={index} className="weather-daily-item">
              <div className="weather-daily-day">{day.day}</div>
              <div className="weather-daily-icon">
                <WeatherIcon condition={day.condition} size={20} />
              </div>
              <div className="weather-daily-precip">{day.precipitation}%</div>
              <div className="weather-daily-temps">
                <span className="weather-daily-high">{day.high}°</span>
                <span className="weather-daily-low">{day.low}°</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

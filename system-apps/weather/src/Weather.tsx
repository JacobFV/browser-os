import React, { useState, useEffect } from 'react';
import { Search, MapPin, Droplets, Wind, Eye, Sunrise, Sunset } from 'lucide-react';
import './Weather.css';

interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  visibility: number;
  sunrise: string;
  sunset: string;
  forecast: Array<{
    day: string;
    condition: string;
    high: number;
    low: number;
  }>;
}

const getWeatherIcon = (condition: string) => {
  const cond = condition.toLowerCase();
  if (cond.includes('rain')) return '🌧️';
  if (cond.includes('snow')) return '❄️';
  if (cond.includes('cloud')) return '☁️';
  if (cond.includes('sun') || cond.includes('clear')) return '☀️';
  if (cond.includes('fog') || cond.includes('mist')) return '🌫️';
  return '🌤️';
};

const MOCK_WEATHER: WeatherData = {
  location: 'San Francisco, CA',
  temperature: 72,
  condition: 'Partly Cloudy',
  humidity: 65,
  windSpeed: 8,
  visibility: 10,
  sunrise: '6:45 AM',
  sunset: '7:30 PM',
  forecast: [
    { day: 'Today', condition: 'Partly Cloudy', high: 72, low: 58 },
    { day: 'Tomorrow', condition: 'Sunny', high: 75, low: 60 },
    { day: 'Wed', condition: 'Cloudy', high: 68, low: 55 },
    { day: 'Thu', condition: 'Rainy', high: 65, low: 52 },
    { day: 'Fri', condition: 'Sunny', high: 70, low: 57 },
    { day: 'Sat', condition: 'Partly Cloudy', high: 73, low: 59 },
    { day: 'Sun', condition: 'Sunny', high: 76, low: 61 },
  ],
};

export const Weather: React.FC<{ os: any }> = ({ os }) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState('');

  useEffect(() => {
    // Simulate loading weather data
    setTimeout(() => {
      setWeather(MOCK_WEATHER);
      setLoading(false);
    }, 500);
  }, []);

  const handleSearch = async () => {
    if (!location.trim()) return;
    
    setLoading(true);
    setError(null);
    
    // Simulate API call
    setTimeout(() => {
      // In a real app, this would fetch from a weather API
      setWeather({
        ...MOCK_WEATHER,
        location: location.trim(),
      });
      setLoading(false);
    }, 800);
  };

  const handleGetCurrentLocation = async () => {
    try {
      // Try to get location from OS API
      const position = await os.location?.getCurrentPosition?.();
      if (position) {
        setLocation(`${position.latitude.toFixed(2)}, ${position.longitude.toFixed(2)}`);
        handleSearch();
      } else {
        // Fallback to mock
        setLocation('Current Location');
        handleSearch();
      }
    } catch (e) {
      console.error('Failed to get location:', e);
      setError('Could not get your location');
    }
  };

  if (loading) {
    return (
      <div className="weather-app">
        <div className="loading">Loading weather data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="weather-app">
        <div className="error">{error}</div>
      </div>
    );
  }

  if (!weather) return null;

  return (
    <div className="weather-app">
      <div className="weather-header">
        <div className="location-input">
          <input
            type="text"
            placeholder="Search location..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button className="location-btn" onClick={handleSearch}>
            <Search size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />
            Search
          </button>
          <button className="location-btn" onClick={handleGetCurrentLocation}>
            <MapPin size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />
            Current
          </button>
        </div>
        <div style={{ color: 'rgba(255, 255, 255, 0.9)', fontWeight: 600 }}>
          {weather.location}
        </div>
      </div>

      <div className="weather-content">
        <div className="current-weather">
          <div className="weather-icon">{getWeatherIcon(weather.condition)}</div>
          <div className="current-temp">{weather.temperature}°</div>
          <div className="current-condition">{weather.condition}</div>
          
          <div className="current-details">
            <div className="detail-item">
              <div className="detail-label">
                <Droplets size={14} style={{ marginRight: 5, verticalAlign: 'middle' }} />
                Humidity
              </div>
              <div className="detail-value">{weather.humidity}%</div>
            </div>
            
            <div className="detail-item">
              <div className="detail-label">
                <Wind size={14} style={{ marginRight: 5, verticalAlign: 'middle' }} />
                Wind
              </div>
              <div className="detail-value">{weather.windSpeed} mph</div>
            </div>
            
            <div className="detail-item">
              <div className="detail-label">
                <Eye size={14} style={{ marginRight: 5, verticalAlign: 'middle' }} />
                Visibility
              </div>
              <div className="detail-value">{weather.visibility} mi</div>
            </div>
            
            <div className="detail-item">
              <div className="detail-label">
                <Sunrise size={14} style={{ marginRight: 5, verticalAlign: 'middle' }} />
                Sunrise
              </div>
              <div className="detail-value">{weather.sunrise}</div>
            </div>
            
            <div className="detail-item">
              <div className="detail-label">
                <Sunset size={14} style={{ marginRight: 5, verticalAlign: 'middle' }} />
                Sunset
              </div>
              <div className="detail-value">{weather.sunset}</div>
            </div>
          </div>
        </div>

        <div className="forecast-section">
          <div className="forecast-title">7-Day Forecast</div>
          <div className="forecast-grid">
            {weather.forecast.map((day, index) => (
              <div key={index} className="forecast-card">
                <div className="forecast-day">{day.day}</div>
                <div className="forecast-icon">{getWeatherIcon(day.condition)}</div>
                <div className="forecast-temp">{day.high}°</div>
                <div style={{ fontSize: 14, color: '#999', marginBottom: 5 }}>{day.low}°</div>
                <div className="forecast-condition">{day.condition}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};


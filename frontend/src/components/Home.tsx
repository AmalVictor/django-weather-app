import React, { useState, useEffect, useRef } from 'react';
import { getWeather, getCitySuggestions } from '../services/api';
import { WeatherData, CitySuggestion } from '../types';

const Home: React.FC = () => {
  const [city, setCity] = useState<string>('');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<CitySuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const suggestionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Handle input changes for city name
  const handleCityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCity(value);
    
    // Clear any existing timeout
    if (suggestionTimeoutRef.current) {
      clearTimeout(suggestionTimeoutRef.current);
    }
    
    // Set a new timeout for debouncing the API call
    suggestionTimeoutRef.current = setTimeout(() => {
      fetchCitySuggestions(value);
    }, 300);
  };
  
  // Fetch city suggestions from the API
  const fetchCitySuggestions = async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    
    try {
      const data = await getCitySuggestions(query);
      setSuggestions(data);
      setShowSuggestions(data.length > 0);
    } catch (err) {
      console.error('Error fetching city suggestions:', err);
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };
  
  // Handle selecting a suggestion
  const handleSelectSuggestion = async (suggestion: CitySuggestion) => {
    setCity(suggestion.name);
    setSuggestions([]);
    setShowSuggestions(false);
    
    // Automatically search for the selected city
    await searchCity(suggestion.name);
  };

  // Common search function to be used by both form submission and suggestion selection
  const searchCity = async (cityName: string) => {
    if (!cityName.trim()) {
      setError('Please enter a city name');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const data = await getWeather(cityName);
      setWeather(data);
    } catch (err) {
      setError('City not found. Please try again.');
      setWeather(null);
    } finally {
      setLoading(false);
    }
  };

  // Handle search form submission
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    await searchCity(city);
  };
  
  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowSuggestions(false);
    };
    
    document.addEventListener('click', handleClickOutside);
    
    return () => {
      document.removeEventListener('click', handleClickOutside);
      // Clear any pending timeouts when component unmounts
      if (suggestionTimeoutRef.current) {
        clearTimeout(suggestionTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="row justify-content-center">
      <div className="col-md-8">
        <div className="card shadow">
          <div className="card-body">
            <h2 className="text-center mb-4">Weather Dashboard</h2>
            
            <form onSubmit={handleSearch}>
              <div className="input-group mb-3 position-relative">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter city name"
                  value={city}
                  onChange={handleCityChange}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (suggestions.length > 0) {
                      setShowSuggestions(true);
                    }
                  }}
                />
                <button 
                  className="btn btn-primary" 
                  type="submit"
                  disabled={loading}
                >
                  {loading ? 'Searching...' : 'Search'}
                </button>
                
                {showSuggestions && suggestions.length > 0 && (
                  <div 
                    className="position-absolute w-100 mt-1 bg-white border rounded shadow-sm suggestions-dropdown"
                    style={{ top: '100%' }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="p-2 border-bottom bg-light">
                      <small className="text-muted">Click on a city to search</small>
                    </div>
                    {suggestions.map((suggestion, index) => (
                      <div 
                        key={index}
                        className="p-2 border-bottom suggestion-item d-flex align-items-center"
                        onClick={() => handleSelectSuggestion(suggestion)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="d-flex align-items-center flex-grow-1">
                          <i className="bi bi-geo-alt-fill me-2 text-primary"></i>
                          <span>{suggestion.display_name}</span>
                        </div>
                        <i className="bi bi-search text-muted ms-2"></i>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </form>
            
            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}
            
            {weather && (
              <div className="weather-card card mt-4">
                <div className="card-header bg-primary text-white">
                  <h3 className="mb-0">
                    {weather.name}, {weather.sys.country}
                  </h3>
                </div>
                <div className="card-body">
                  <div className="row align-items-center">
                    <div className="col-md-6 text-center">
                      <img
                        src={`http://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
                        alt={weather.weather[0].description}
                        className="img-fluid weather-icon"
                      />
                      <h4>{weather.weather[0].main}</h4>
                      <p className="text-muted">{weather.weather[0].description}</p>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-2">
                        <h2>{Math.round(weather.main.temp)}°C</h2>
                        <p className="text-muted">Feels like: {Math.round(weather.main.feels_like)}°C</p>
                      </div>
                      <div className="row mt-3">
                        <div className="col-6">
                          <p><strong>Humidity:</strong> {weather.main.humidity}%</p>
                        </div>
                        <div className="col-6">
                          <p><strong>Wind:</strong> {weather.wind.speed} m/s</p>
                        </div>
                        <div className="col-6">
                          <p><strong>Pressure:</strong> {weather.main.pressure} hPa</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;

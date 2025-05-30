import React, { useState, useEffect } from 'react';
import { getSearchHistory } from '../services/api';
import { SearchHistoryItem } from '../types';

const History: React.FC = () => {
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await getSearchHistory();
        setHistory(data);
        setError(null);
      } catch (err) {
        setError('Failed to load search history.');
        console.error('Failed to fetch history:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center my-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        {error}
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="card shadow">
        <div className="card-body text-center">
          <h2 className="mb-4">Search History</h2>
          <p className="lead">You haven't searched for any cities yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card shadow">
      <div className="card-body">
        <h2 className="mb-4">Search History</h2>
        
        <div className="table-responsive">
          <table className="table table-hover">
            <thead className="table-light">
              <tr>
                <th>City</th>
                <th>Temperature</th>
                <th>Weather</th>
                <th>Date/Time</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item) => (
                <tr key={item.id}>
                  <td>{item.city}</td>
                  <td>{item.temperature}°C</td>
                  <td>{item.weather_description}</td>
                  <td>{new Date(item.searched_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default History; 
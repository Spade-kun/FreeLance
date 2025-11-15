import { useState, useEffect } from 'react';
import api from '../services/api';

/**
 * Custom hook for fetching data from API
 * @param {Function} apiCall - The API function to call
 * @param {Array} dependencies - Dependencies array for useEffect
 */
export const useAPI = (apiCall, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiCall();
      setData(response.data || response);
    } catch (err) {
      setError(err.message || 'An error occurred');
      console.error('API Hook Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, dependencies);

  return { data, loading, error, refetch: fetchData };
};

/**
 * Custom hook for API mutations (POST, PUT, DELETE)
 */
export const useAPIMutation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = async (apiCall, successCallback, errorCallback) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiCall();
      if (successCallback) successCallback(response);
      return response;
    } catch (err) {
      const errorMessage = err.message || 'An error occurred';
      setError(errorMessage);
      if (errorCallback) errorCallback(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { mutate, loading, error };
};

export default { useAPI, useAPIMutation };

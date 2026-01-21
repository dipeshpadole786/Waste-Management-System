import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

class WasteClassificationAPI {
  // Health check
  async checkHealth() {
    try {
      const response = await api.get('/health');
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Health check failed:', error);
      return {
        success: false,
        error: error.message,
        data: null,
      };
    }
  }

  // Predict single image
  async predictImage(imageFile) {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await axios.post(`${API_BASE_URL}/predict`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000, // 60 seconds for prediction
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Prediction failed:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Prediction failed',
        data: null,
      };
    }
  }

  // Batch predict multiple images
  async predictMultipleImages(imageFiles) {
    try {
      const formData = new FormData();
      imageFiles.forEach((file) => {
        formData.append('images', file);
      });

      const response = await axios.post(`${API_BASE_URL}/batch-predict`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 120000, // 2 minutes for batch prediction
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Batch prediction failed:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Batch prediction failed',
        data: null,
      };
    }
  }

  // List available models (from your API)
  async listModels() {
    try {
      const response = await api.get('/list-models');
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Failed to list models:', error);
      return {
        success: false,
        error: error.message,
        data: null,
      };
    }
  }

  // Test endpoint
  async testConnection() {
    try {
      const response = await api.get('/test');
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Test connection failed:', error);
      return {
        success: false,
        error: error.message,
        data: null,
      };
    }
  }
}

export default new WasteClassificationAPI();
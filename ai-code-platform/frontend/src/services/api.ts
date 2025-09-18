import axios from 'axios';
import {
  CodeGenerationRequest,
  CodeGenerationResponse,
  TestGenerationRequest,
  TestGenerationResponse,
  CodeReviewRequest,
  CodeReviewResponse,
  HealthResponse
} from '../types/api';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const apiService = {
  // Health check
  async healthCheck(): Promise<HealthResponse> {
    const response = await api.get('/api/v1/health');
    return response.data;
  },

  // Code generation
  async generateCode(request: CodeGenerationRequest): Promise<CodeGenerationResponse> {
    const response = await api.post('/api/v1/generate-code', request);
    return response.data;
  },

  // Test generation
  async generateTests(request: TestGenerationRequest): Promise<TestGenerationResponse> {
    const response = await api.post('/api/v1/generate-tests', request);
    return response.data;
  },

  // Code review
  async reviewCode(request: CodeReviewRequest): Promise<CodeReviewResponse> {
    const response = await api.post('/api/v1/review-code', request);
    return response.data;
  },
};

export default apiService;
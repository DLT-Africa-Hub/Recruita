import axios from 'axios';
import { CandidatesResponse, CandidateFilters } from '../types/explore';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3090/api/v1';

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Get paginated candidates for company
 * GET /api/companies/candidates
 */
export const getCandidates = async (
  filters: CandidateFilters = {}
): Promise<CandidatesResponse> => {
  try {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.experience) params.append('experience', filters.experience);
    if (filters.availability) params.append('availability', filters.availability);
    if (filters.rank) params.append('rank', filters.rank);
    if (filters.skills && filters.skills.length > 0) {
      filters.skills.forEach((skill) => params.append('skills[]', skill));
    }

    const response = await apiClient.get<CandidatesResponse>(
      `/companies/candidates?${params.toString()}`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching candidates:', error);
    throw error;
  }
};

/**
 * Get candidate by ID
 * GET /api/companies/candidates/:id
 */
export const getCandidateById = async (id: number) => {
  try {
    const response = await apiClient.get(`/companies/candidates/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching candidate:', error);
    throw error;
  }
};


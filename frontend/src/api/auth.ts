import api from './client';

export const authApi = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  register: async (email: string, password: string, role: string) => {
    const response = await api.post('/auth/register', { email, password, role });
    return response.data;
  },
};

export default api;


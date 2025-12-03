import api from './client';

export const interviewApi = {
  getInterviewBySlug: async (slug: string) => {
    const response = await api.get(`/interviews/${slug}`);
    return response.data;
  },
  getStreamToken: async (slug: string) => {
    const response = await api.get(`/interviews/${slug}/token`);
    return response.data;
  },
};

export default interviewApi;


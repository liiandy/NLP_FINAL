import axios from 'axios';

const API_URL = 'http://localhost:8000/api/v1';

export interface Paper {
  id: number;
  title: string;
  authors: string[];
  journal: string;
  year: string;
  topic: string;
  abstract: string;
  summary: string;
  keywords: string[];
}

export const paperService = {
  async getAllPapers(): Promise<Paper[]> {
    const response = await axios.get(`${API_URL}/papers`);
    return response.data;
  },

  async getPaper(id: number): Promise<Paper> {
    const response = await axios.get(`${API_URL}/papers/${id}`);
    return response.data;
  },

  async uploadPaper(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axios.post(`${API_URL}/papers/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async searchPapers(query: string): Promise<Paper[]> {
    const response = await axios.get(`${API_URL}/papers/search?q=${query}`);
    return response.data;
  },

  async listPapers(): Promise<Paper[]> {
    const response = await axios.get(`${API_URL}/papers/`);
    return response.data;
  },

  async deletePaper(id: number): Promise<void> {
    await axios.delete(`${API_URL}/papers/${id}`, { 
      headers: { Authorization: "Bearer dummy_admin_token" },
      withCredentials: true 
    });
  }
};

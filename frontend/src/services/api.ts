import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 300000, // 設置 5 分鐘的超時時間
});

// 添加請求攔截器
api.interceptors.request.use(
  (config) => {
    // 自動加上 Authorization header
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = config.headers || {};
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    console.log('Request:', config);
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// 添加響應攔截器
api.interceptors.response.use(
  (response) => {
    console.log('Response:', response);
    return response;
  },
  (error) => {
    console.error('Response Error:', error.response || error);
    return Promise.reject(error);
  }
);

export interface Keyword {
  id: number;
  word: string;
}

export interface Summary {
  id: number;
  paper_id: number;
  content: string;
  created_at: string;
}

export interface Topic {
  id: number;
  name: string;
  description: string | null;
}

export interface Figure {
  id: number;
  path: string;
  caption: string | null;
  page: number;
}

export interface Paper {
  id: number;
  title: string;
  authors: string[];
  journal: string | null;
  year: number | null;
  abstract: string | null;
  content: string | null;
  file_path: string | null;
  github_link: string | null;
  created_at: string;
  updated_at: string;
  topic: {
    id: number;
    name: string;
    description: string | null;
  } | null;
  summary: {
    id: number;
    paper_id: number;
    content: string;
    created_at: string;
  } | null;
  keywords: {
    id: number;
    word: string;
  }[];
  figures: Figure[];
}

export interface PaperList {
  id: number;
  title: string;
  authors: string[];
  journal: string | null;
  year: number | null;
  abstract: string | null;
  content: string | null;
  file_path: string | null;
  created_at: string;
  updated_at: string;
  topic: string | null;
  summary: string | null;
  keywords: string[];
  figures: Figure[];
}

export interface PaperResponse {
  id: number;
  title: string;
  authors: string[];
  journal: string | null;
  year: number | null;
  abstract: string | null;
  content: string | null;
  file_path: string | null;
  github_link: string | null;
  created_at: string;
  updated_at: string;
  topic: {
    id: number;
    name: string;
    description: string | null;
  } | null;
  summary: {
    id: number;
    paper_id: number;
    content: string;
    created_at: string;
  } | null;
  keywords: {
    id: number;
    word: string;
  }[];
  figures: Figure[];
}

export const paperService = {
  // 獲取所有論文
  getAllPapers: async () => {
    try {
      const response = await api.get<Paper[]>('/papers/');
      return response.data;
    } catch (error) {
      console.error('Error fetching papers:', error);
      throw error;
    }
  },

  // 獲取單篇論文
  getPaper: async (id: number): Promise<Paper> => {
    try {
      const response = await api.get<Paper>(`/papers/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching paper ${id}:`, error);
      throw error;
    }
  },

  // 上傳新論文
  uploadPaper: async (file: File, onProgress?: (progress: number) => void): Promise<Paper> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      console.log('Uploading file:', file.name, 'Size:', file.size, 'Type:', file.type);
      
      const response = await api.post<Paper>('/papers/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            console.log('Upload progress:', percentCompleted, '%');
            if (onProgress) {
              onProgress(percentCompleted);
            }
          }
        },
        timeout: 300000, // 設置 5 分鐘的超時時間
      });
      
      console.log('Upload response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error uploading paper:', error);
      if (axios.isAxiosError(error)) {
        console.error('Response data:', error.response?.data);
        console.error('Response status:', error.response?.status);
        if (error.code === 'ECONNABORTED') {
          throw new Error('上傳超時，請稍後重試');
        }
      }
      throw error;
    }
  },

  // 搜索論文
  searchPapers: async (query: string) => {
    try {
      const response = await api.get<Paper[]>(`/papers/search?query=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      console.error('Error searching papers:', error);
      throw error;
    }
  },

  // 獲取論文列表
  listPapers: async (): Promise<PaperList[]> => {
    try {
      const response = await api.get<PaperList[]>('/papers');
      return response.data;
    } catch (error) {
      console.error('Error fetching papers:', error);
      throw error;
    }
  },
};

export default api;

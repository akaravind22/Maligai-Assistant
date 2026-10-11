import api from './api';

export interface LoginResponse {
  success: boolean;
  token: string;
  user: { id: number; username: string; name: string };
  message: string;
}

export const authService = {
  login: async (username: string, password: string): Promise<LoginResponse> => {
    const res = await api.post('/auth/login', { username, password });
    return res.data;
  },
  changePassword: async (currentPassword: string, newPassword: string) => {
    const res = await api.post('/auth/change-password', { currentPassword, newPassword });
    return res.data;
  },
};

export interface Product {
  id: number;
  product_name: string;
  tamil_name: string | null;
  brand: string | null;
  size: number | null;
  unit: string | null;
  price: number;
  availability_status: 'AVAILABLE' | 'OUT_OF_STOCK';
  notes: string | null;
  aliases: string[];
  created_at: string;
  updated_at: string;
}

export interface ProductsResponse {
  success: boolean;
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const productService = {
  getAll: async (params?: Record<string, string | number>) => {
    const res = await api.get('/products', { params });
    return res.data as ProductsResponse;
  },
  getById: async (id: number) => {
    const res = await api.get(`/products/${id}`);
    return res.data.product as Product;
  },
  create: async (data: Partial<Product> & { aliases?: string[] }) => {
    const res = await api.post('/products', data);
    return res.data;
  },
  update: async (id: number, data: Partial<Product> & { aliases?: string[] }) => {
    const res = await api.put(`/products/${id}`, data);
    return res.data;
  },
  updatePrice: async (id: number, price: number) => {
    const res = await api.patch(`/products/${id}/price`, { price });
    return res.data;
  },
  updateStatus: async (id: number, availability_status: 'AVAILABLE' | 'OUT_OF_STOCK') => {
    const res = await api.patch(`/products/${id}/status`, { availability_status });
    return res.data;
  },
  delete: async (id: number) => {
    const res = await api.delete(`/products/${id}`);
    return res.data;
  },
  getStats: async () => {
    const res = await api.get('/products/stats');
    return res.data;
  },
  getHistory: async (limit = 20) => {
    const res = await api.get('/products/history', { params: { limit } });
    return res.data;
  },
};

export const importService = {
  preview: async (file: File) => {
    const form = new FormData();
    form.append('file', file);
    const res = await api.post('/import/preview', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
  confirm: async (importId: number, filePath: string, originalName: string) => {
    const res = await api.post('/import/confirm', { importId, filePath, originalName });
    return res.data;
  },
  downloadTemplate: () => {
    window.open(`${import.meta.env.VITE_API_URL}/import/template`, '_blank');
  },
  exportInventory: () => {
    const token = localStorage.getItem('token');
    const url = `${import.meta.env.VITE_API_URL}/import/export`;
    // Use fetch to handle auth header for download
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.blob())
      .then(blob => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `maligai-inventory-${new Date().toISOString().split('T')[0]}.xlsx`;
        a.click();
      });
  },
};

export const assistantService = {
  query: async (query: string, inputType: 'VOICE' | 'TEXT' = 'TEXT') => {
    const res = await api.post('/assistant/query', { query, inputType });
    return res.data;
  },
};

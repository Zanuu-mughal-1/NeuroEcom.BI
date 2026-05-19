import axios from 'axios';
import type { Product } from './types';

export const getApiBaseUrl = () => (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api';

export const getBackendOrigin = () => getApiBaseUrl().replace(/\/api\/?$/i, '');

const api = axios.create({
  baseURL: getApiBaseUrl(),
});

export const getProducts = async () => {
  const response = await api.get('/products');
  return response.data;
};

export const mapBackendProduct = (p: any): Product => {
  const imageUrl = p.ImageUrl ?? p.imageUrl ?? '';
  const fallbackImage = 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800';
  return {
    id: String(p.Id ?? p.id ?? p.SKU ?? p.sku ?? ''),
    name: p.Name ?? p.name ?? 'Untitled Product',
    description: p.Description ?? p.description ?? '',
    price: Number(p.Price ?? p.price ?? 0),
    image: imageUrl.startsWith('/') ? `${getBackendOrigin()}${imageUrl}` : (imageUrl || fallbackImage),
    category: String(p.Category ?? p.category ?? 'all').toLowerCase(),
    sku: p.SKU ?? p.sku,
    inventory: p.Stock ?? p.stock,
  };
};

export default api;

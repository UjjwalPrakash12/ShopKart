import axios from 'axios';

// Create Axios client configured with baseURL and withCredentials
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
  withCredentials: true, // Crucial: sends & receives HttpOnly cookies with cross-origin requests
  headers: {
    'Content-Type': 'application/json',
  },
});

// Customer Authentication Services (Lab 01 & 02)
export const registerCustomer = async (customerData) => {
  const response = await api.post('/customers/register', customerData);
  return response.data;
};

export const loginCustomer = async (credentials) => {
  const response = await api.post('/customers/login', credentials);
  return response.data;
};

export const getCustomerProfile = async () => {
  const response = await api.get('/customers/me');
  return response.data;
};

export const logoutCustomer = async () => {
  const response = await api.post('/customers/logout');
  return response.data;
};

// Product Discovery Services (Lab 03)
export const getProducts = async (params = {}) => {
  const response = await api.get('/products', { params });
  return response.data;
};

export const getProductById = async (id) => {
  const response = await api.get(`/products/${id}`);
  return response.data;
};

export const createProduct = async (productData) => {
  const response = await api.post('/products', productData);
  return response.data;
};

// Wishlist Services (Lab 04)
export const getWishlist = async () => {
  const response = await api.get('/wishlist');
  return response.data;
};

export const addToWishlist = async (productId) => {
  const response = await api.post(`/wishlist/${productId}`);
  return response.data;
};

export const removeFromWishlist = async (productId) => {
  const response = await api.delete(`/wishlist/${productId}`);
  return response.data;
};

export const toggleWishlist = async (productId) => {
  const response = await api.patch(`/wishlist/${productId}/toggle`);
  return response.data;
};

// Shopping Cart Services (Lab 05)
export const getCart = async () => {
  const response = await api.get('/cart');
  return response.data;
};

export const addToCart = async (productId) => {
  const response = await api.post(`/cart/${productId}`);
  return response.data;
};

export const updateCartQuantity = async (productId, quantity) => {
  const response = await api.patch(`/cart/${productId}`, { quantity });
  return response.data;
};

export const removeFromCart = async (productId) => {
  const response = await api.delete(`/cart/${productId}`);
  return response.data;
};

// Payment Order APIs (Lab 06)
export const createPaymentOrder = async (payload) => {
  const { data } = await api.post('/orders/create-payment-order', payload);
  return data;
};

export const verifyPayment = async (payload) => {
  const { data } = await api.post('/orders/verify-payment', payload);
  return data;
};

export default api;

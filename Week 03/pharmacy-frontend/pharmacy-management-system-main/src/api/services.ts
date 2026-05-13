// src/api/services.ts
// All API service calls for PharmaCare frontend
// Authors: Muhammad Hussain & Ali Ahmed Mansoor

import API from './axios';

// ── Dashboard ─────────────────────────────────
export const getDashboardStats  = () => API.get('/dashboard/stats');
export const getStockLevels     = () => API.get('/dashboard/stock-levels');
export const getRecentDispenses = () => API.get('/dashboard/recent-dispenses');
export const getDashboardExpiry = () => API.get('/dashboard/expiry-alerts');

// ── Medicines ─────────────────────────────────
export const getMedicines       = () => API.get('/medicines');
export const getMedicine        = (id: number) => API.get(`/medicines/${id}`);
export const createMedicine     = (data: object) => API.post('/medicines', data);
export const updateMedicine     = (id: number, data: object) => API.put(`/medicines/${id}`, data);
export const deleteMedicine     = (id: number) => API.delete(`/medicines/${id}`);

// ── Suppliers ─────────────────────────────────
export const getSuppliers       = () => API.get('/suppliers');
export const createSupplier     = (data: object) => API.post('/suppliers', data);
export const updateSupplier     = (id: number, data: object) => API.put(`/suppliers/${id}`, data);
export const deleteSupplier     = (id: number) => API.delete(`/suppliers/${id}`);

// ── Orders ────────────────────────────────────
export const getOrders          = () => API.get('/orders');
export const createOrder        = (data: object) => API.post('/orders', data);
export const markDelivered      = (id: number) => API.put(`/orders/${id}/deliver`, {});

// ── Dispense ──────────────────────────────────
export const getDispenseHistory = () => API.get('/dispense');
export const dispenseMedicine   = (data: object) => API.post('/dispense', data)
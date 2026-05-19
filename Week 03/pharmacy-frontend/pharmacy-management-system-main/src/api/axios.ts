// src/api/axios.ts
// API client for PharmaCare backend
// Authors: Muhammad Hussain & Ali Ahmed Mansoor
// Bahria University Islamabad — DBMS Lab 2026

import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
});

export default API;
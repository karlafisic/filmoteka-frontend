// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api', // prilagodi ako koristiš drukčiji port
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  auth: {
    username: 'korisnik@gmail.com',
    password: 'lozinka123'
  }
});

export default api;

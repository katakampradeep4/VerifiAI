import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

const client = axios.create({
  baseURL: API_BASE,
  timeout: 120000
});

export async function checkUrl(url) {
  const resp = await client.post('/api/check', { url });
  return resp.data;
}

export async function getRules() {
  const resp = await client.get('/api/rules');
  return resp.data;
}

export async function addRule(rule) {
  const resp = await client.post('/api/rules', rule);
  return resp.data;
}

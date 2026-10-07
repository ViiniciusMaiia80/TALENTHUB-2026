const API_ROOT = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(message, statusCode, details) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

function errorMessage(data, fallback) {
  if (typeof data === 'string') return data;
  if (data?.detail) return data.detail;
  if (data && typeof data === 'object') {
    const first = Object.values(data).flat(Infinity).find((value) => typeof value === 'string');
    if (first) return first;
  }
  return fallback;
}

export async function api(path, { token, ...options } = {}) {
  const headers = new Headers(options.headers || {});
  if (options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) headers.set('Authorization', `Bearer ${token}`);

  let response;
  try {
    response = await fetch(`${API_ROOT}${path}`, { ...options, headers });
  } catch {
    throw new ApiError(
      'Não foi possível conectar ao servidor. Verifique se o backend Django está rodando.',
      0,
    );
  }

  if (response.status === 204) return null;

  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await response.json() : await response.text();
  if (response.status === 401 && token) {
    window.dispatchEvent(new CustomEvent('talenthub:unauthorized'));
  }
  if (!response.ok) {
    throw new ApiError(errorMessage(data, `A solicitação falhou (${response.status}).`), response.status, data);
  }
  return data;
}

export function apiPost(path, payload, token) {
  return api(path, {
    method: 'POST',
    token,
    body: JSON.stringify(payload),
  });
}

export function apiPatch(path, payload, token) {
  return api(path, {
    method: 'PATCH',
    token,
    body: JSON.stringify(payload),
  });
}

export function errorForField(error, field) {
  const value = error?.details?.[field];
  if (Array.isArray(value)) return value.join(' ');
  return typeof value === 'string' ? value : '';
}

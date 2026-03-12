import type {
  TokenResponse,
  LoginRequest,
  CurrencyResponse,
  ExchangeRateResponse,
  ConversionResponse,
  HistoricalRatesPageResponse,
  GetLatestRatesRequest,
  GetHistoricalRatesRequest,
  ConvertCurrencyRequest,
  GetHistoricalRatesRangeRequest,
} from '../types/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://converter-dev.rahmatov.net';
export const AUTH_EXPIRED_EVENT = 'auth-expired';

function getToken(): string | null {
  return localStorage.getItem('auth_token');
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401 && token) {
      localStorage.removeItem('auth_token');
      window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
    }

    let errorMessage = `Request failed: ${response.status} ${response.statusText}`;
    try {
      const errorBody = await response.json();
      if (errorBody?.errors) {
        const messages = Object.values(errorBody.errors as Record<string, string[]>)
          .flat()
          .join(', ');
        errorMessage = messages || errorMessage;
      } else if (errorBody?.title) {
        errorMessage = errorBody.title;
      } else if (errorBody?.error) {
        errorMessage = errorBody.error;
      } else if (typeof errorBody === 'string') {
        errorMessage = errorBody;
      }
    } catch {
      // keep original message
    }
    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

// Auth API
export const authApi = {
  login: (data: LoginRequest): Promise<TokenResponse> =>
    request<TokenResponse>('/api/auth/token', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// Currencies API
export const currenciesApi = {
  getAll: (): Promise<CurrencyResponse[]> =>
    request<CurrencyResponse[]>('/api/currencies'),
};

// Exchange Rates API
export const exchangeRatesApi = {
  getLatest: (data: GetLatestRatesRequest): Promise<ExchangeRateResponse> =>
    request<ExchangeRateResponse>('/api/exchangerates/conversion', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getByDate: (data: GetHistoricalRatesRequest): Promise<ExchangeRateResponse> =>
    request<ExchangeRateResponse>('/api/exchangerates/by-date', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  convertAmount: (data: ConvertCurrencyRequest): Promise<ConversionResponse> =>
    request<ConversionResponse>('/api/exchangerates/amount-conversion', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getHistory: (data: GetHistoricalRatesRangeRequest): Promise<HistoricalRatesPageResponse> =>
    request<HistoricalRatesPageResponse>('/api/exchangerates/history', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

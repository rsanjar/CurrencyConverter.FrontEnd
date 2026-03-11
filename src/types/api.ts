// Auth types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface TokenResponse {
  token: string;
  expiresIn: number;
}

// Currency types
export interface CurrencyResponse {
  code: string;
  name: string;
}

// Exchange rate types
export interface ExchangeRateResponse {
  amount: number;
  base: string;
  date: string;
  rates: Record<string, number>;
}

export interface ConversionResponse {
  amount: number;
  from: string;
  date: string;
  rates: Record<string, number>;
}

export interface HistoricalRateItemResponse {
  date: string;
  rates: Record<string, number>;
}

export interface HistoricalRatesPageResponse {
  base: string;
  startDate: string;
  endDate: string;
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  items: HistoricalRateItemResponse[];
}

// Request types
export interface GetLatestRatesRequest {
  baseCurrency?: string;
  targetCurrencies?: string[];
}

export interface GetHistoricalRatesRequest {
  date: string;
  baseCurrency?: string;
  targetCurrencies?: string[];
}

export interface ConvertCurrencyRequest {
  amount: number;
  fromCurrency: string;
  toCurrencies: string[];
}

export interface GetHistoricalRatesRangeRequest {
  startDate: string;
  endDate: string;
  baseCurrency?: string;
  targetCurrencies?: string[];
  page?: number;
  pageSize?: number;
}

// API error type
export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

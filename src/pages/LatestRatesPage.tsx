import { useState, useEffect, type FormEvent } from 'react';
import { currenciesApi, exchangeRatesApi } from '../services/api';
import type { CurrencyResponse, ExchangeRateResponse } from '../types/api';
import CurrencySelect from '../components/CurrencySelect';
import MultiCurrencySelect from '../components/MultiCurrencySelect';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

export default function LatestRatesPage() {
  const [currencies, setCurrencies] = useState<CurrencyResponse[]>([]);
  const [currenciesLoading, setCurrenciesLoading] = useState(true);
  const [currenciesError, setCurrenciesError] = useState<string | null>(null);

  const [baseCurrency, setBaseCurrency] = useState('EUR');
  const [targetCurrencies, setTargetCurrencies] = useState<string[]>([]);

  const [result, setResult] = useState<ExchangeRateResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCurrencies = async () => {
      try {
        const data = await currenciesApi.getAll();
        setCurrencies(data);
      } catch (err) {
        setCurrenciesError(err instanceof Error ? err.message : 'Failed to load currencies');
      } finally {
        setCurrenciesLoading(false);
      }
    };
    loadCurrencies();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    setLoading(true);
    try {
      const data = await exchangeRatesApi.getLatest({
        baseCurrency,
        targetCurrencies: targetCurrencies.length > 0 ? targetCurrencies : undefined,
      });
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch rates. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (currenciesLoading) return <LoadingSpinner message="Loading currencies..." />;
  if (currenciesError) return <ErrorMessage message={currenciesError} />;

  return (
    <div className="page">
      <div className="page-header">
        <h2 className="page-title">Latest Exchange Rates</h2>
        <p className="page-subtitle">Get the latest exchange rates for a base currency</p>
      </div>

      <div className="content-grid">
        <form onSubmit={handleSubmit} className="card" noValidate>
          {error && (
            <ErrorMessage
              message={error}
              onDismiss={() => setError(null)}
            />
          )}

          <CurrencySelect
            id="baseCurrency"
            label="Base Currency"
            value={baseCurrency}
            onChange={setBaseCurrency}
            currencies={currencies}
            disabled={loading}
            required
          />

          <MultiCurrencySelect
            id="targetCurrencies"
            label="Target Currencies (optional — leave empty for all)"
            values={targetCurrencies}
            onChange={setTargetCurrencies}
            currencies={currencies}
            excludeCode={baseCurrency}
            disabled={loading}
          />

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || !baseCurrency}
          >
            {loading ? 'Fetching...' : 'Get Latest Rates'}
          </button>
        </form>

        {result && (
          <div className="card result-card">
            <h3 className="result-title">
              Rates for {result.base} — {result.date}
            </h3>
            <div className="rates-table">
              <div className="rates-table-header">
                <span>Currency</span>
                <span>Rate</span>
              </div>
              {Object.entries(result.rates).map(([code, value]) => (
                <div key={code} className="rates-table-row">
                  <span className="currency-code">{code}</span>
                  <span className="rate-value">
                    {value.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 6 })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import { useState, type ReactEventHandler } from 'react';
import { exchangeRatesApi } from '../services/api';
import type { ExchangeRateResponse } from '../types/api';
import CurrencySelect from '../components/CurrencySelect';
import MultiCurrencySelect from '../components/MultiCurrencySelect';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { useCurrencies } from '../hooks/useCurrencies';

export default function HistoricalByDatePage() {
  const { currencies, isLoading: currenciesLoading, error: currenciesError } = useCurrencies();

  const today = new Date().toISOString().split('T')[0];
  const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [date, setDate] = useState(oneMonthAgo);
  const [baseCurrency, setBaseCurrency] = useState('EUR');
  const [targetCurrencies, setTargetCurrencies] = useState<string[]>([]);

  const [result, setResult] = useState<ExchangeRateResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit: ReactEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setValidationError(null);
    setError(null);

    if (!date) {
      setValidationError('Please select a date.');
      return;
    }
    if (date > today) {
      setValidationError('Date cannot be in the future.');
      return;
    }

    setLoading(true);
    try {
      const data = await exchangeRatesApi.getByDate({
        date,
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

  const displayError = validationError || error;

  return (
    <div className="page">
      <div className="page-header">
        <h2 className="page-title">Historical Rates by Date</h2>
        <p className="page-subtitle">Look up exchange rates for a specific date</p>
      </div>

      <div className="content-grid">
        <form onSubmit={handleSubmit} className="card" noValidate>
          {displayError && (
            <ErrorMessage
              message={displayError}
              onDismiss={() => { setValidationError(null); setError(null); }}
            />
          )}

          <div className="form-group">
            <label htmlFor="date" className="form-label">
              Date <span className="required">*</span>
            </label>
            <input
              id="date"
              type="date"
              className="form-input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              max={today}
              disabled={loading}
              required
            />
          </div>

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
            disabled={loading || !date || !baseCurrency}
          >
            {loading ? 'Fetching...' : 'Get Rates'}
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

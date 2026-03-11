import { useState, useEffect, type FormEvent } from 'react';
import { currenciesApi, exchangeRatesApi } from '../services/api';
import type { CurrencyResponse, ConversionResponse } from '../types/api';
import CurrencySelect from '../components/CurrencySelect';
import MultiCurrencySelect from '../components/MultiCurrencySelect';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

export default function CurrencyConversionPage() {
  const [currencies, setCurrencies] = useState<CurrencyResponse[]>([]);
  const [currenciesLoading, setCurrenciesLoading] = useState(true);
  const [currenciesError, setCurrenciesError] = useState<string | null>(null);

  const [amount, setAmount] = useState('1');
  const [fromCurrency, setFromCurrency] = useState('EUR');
  const [toCurrencies, setToCurrencies] = useState<string[]>(['USD', 'GBP', 'JPY']);

  const [result, setResult] = useState<ConversionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

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
    setValidationError(null);
    setError(null);

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setValidationError('Please enter a valid positive amount.');
      return;
    }
    if (!fromCurrency) {
      setValidationError('Please select a source currency.');
      return;
    }
    if (toCurrencies.length === 0) {
      setValidationError('Please select at least one target currency.');
      return;
    }

    setLoading(true);
    try {
      const data = await exchangeRatesApi.convertAmount({
        amount: parsedAmount,
        fromCurrency,
        toCurrencies,
      });
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Conversion failed. Please try again.');
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
        <h2 className="page-title">Convert Currency</h2>
        <p className="page-subtitle">Convert an amount from one currency to others</p>
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
            <label htmlFor="amount" className="form-label">
              Amount <span className="required">*</span>
            </label>
            <input
              id="amount"
              type="number"
              className="form-input"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0.01"
              step="any"
              placeholder="Enter amount"
              disabled={loading}
              required
            />
          </div>

          <CurrencySelect
            id="fromCurrency"
            label="From Currency"
            value={fromCurrency}
            onChange={setFromCurrency}
            currencies={currencies}
            disabled={loading}
            required
          />

          <MultiCurrencySelect
            id="toCurrencies"
            label="To Currencies"
            values={toCurrencies}
            onChange={setToCurrencies}
            currencies={currencies}
            excludeCode={fromCurrency}
            disabled={loading}
          />

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Converting...' : 'Convert'}
          </button>
        </form>

        {result && (
          <div className="card result-card">
            <h3 className="result-title">
              {result.amount} {result.from} on {result.date}
            </h3>
            <div className="rates-table">
              <div className="rates-table-header">
                <span>Currency</span>
                <span>Amount</span>
              </div>
              {Object.entries(result.rates).map(([code, value]) => (
                <div key={code} className="rates-table-row">
                  <span className="currency-code">{code}</span>
                  <span className="rate-value">
                    {value.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 })}
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

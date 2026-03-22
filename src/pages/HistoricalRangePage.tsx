import { useEffect, useRef, useState, type ReactEventHandler } from 'react';
import { exchangeRatesApi } from '../services/api';
import type { HistoricalRatesPageResponse } from '../types/api';
import CurrencySelect from '../components/CurrencySelect';
import MultiCurrencySelect from '../components/MultiCurrencySelect';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { useCurrencies } from '../hooks/useCurrencies';

const PAGE_SIZE_OPTIONS = [10, 20, 50];

export default function HistoricalRangePage() {
  const { currencies, isLoading: currenciesLoading, error: currenciesError } = useCurrencies();

  const today = new Date().toISOString().split('T')[0];
  const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(oneMonthAgo);
  const [endDate, setEndDate] = useState(today);
  const [baseCurrency, setBaseCurrency] = useState('EUR');
  const [targetCurrencies, setTargetCurrencies] = useState<string[]>([]);
  const [pageSize, setPageSize] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);

  const [result, setResult] = useState<HistoricalRatesPageResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [lastQuery, setLastQuery] = useState<{
    startDate: string;
    endDate: string;
    baseCurrency: string;
    targetCurrencies: string[];
    pageSize: number;
  } | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const fetchPage = async (page: number, query = lastQuery) => {
    if (!query) return;

    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setError(null);
    try {
      const data = await exchangeRatesApi.getHistory(
        {
          ...query,
          targetCurrencies: query.targetCurrencies.length > 0 ? query.targetCurrencies : undefined,
          page,
          pageSize: query.pageSize,
        },
        controller.signal,
      );
      if (controller.signal.aborted) return;
      setResult(data);
      setCurrentPage(page);
    } catch (err) {
      if (controller.signal.aborted) return;
      setError(err instanceof Error ? err.message : 'Failed to fetch historical rates.');
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  };

  const handleSubmit: ReactEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setValidationError(null);
    setError(null);

    if (!startDate || !endDate) {
      setValidationError('Please select both start and end dates.');
      return;
    }
    if (startDate > endDate) {
      setValidationError('Start date must be before or equal to end date.');
      return;
    }
    if (endDate > today) {
      setValidationError('End date cannot be in the future.');
      return;
    }
    if (!baseCurrency) {
      setValidationError('Please select a base currency.');
      return;
    }

    const query = { startDate, endDate, baseCurrency, targetCurrencies, pageSize };
    setLastQuery(query);
    await fetchPage(1, query);
  };

  if (currenciesLoading) return <LoadingSpinner message="Loading currencies..." />;
  if (currenciesError) return <ErrorMessage message={currenciesError} />;

  const displayError = validationError || error;

  return (
    <div className="page">
      <div className="page-header">
        <h2 className="page-title">Historical Rates Range</h2>
        <p className="page-subtitle">Browse historical exchange rates over a date range with pagination</p>
      </div>

      <form onSubmit={handleSubmit} className="card" noValidate>
        {displayError && (
          <ErrorMessage
            message={displayError}
            onDismiss={() => { setValidationError(null); setError(null); }}
          />
        )}

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="startDate" className="form-label">
              Start Date <span className="required">*</span>
            </label>
            <input
              id="startDate"
              type="date"
              className="form-input"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              max={today}
              disabled={loading}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="endDate" className="form-label">
              End Date <span className="required">*</span>
            </label>
            <input
              id="endDate"
              type="date"
              className="form-input"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate}
              max={today}
              disabled={loading}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <CurrencySelect
            id="baseCurrency"
            label="Base Currency"
            value={baseCurrency}
            onChange={setBaseCurrency}
            currencies={currencies}
            disabled={loading}
            required
          />
          <div className="form-group">
            <label htmlFor="pageSize" className="form-label">
              Results per Page
            </label>
            <select
              id="pageSize"
              className="form-select"
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              disabled={loading}
            >
              {PAGE_SIZE_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

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
          disabled={loading}
        >
          {loading ? 'Fetching...' : 'Search'}
        </button>
      </form>

      {loading && <LoadingSpinner message="Loading historical rates..." />}

      {result && !loading && (
        <div className="card">
          <div className="result-meta">
            <span>
              Base: <strong>{result.base}</strong>
            </span>
            <span>
              {result.startDate} → {result.endDate}
            </span>
            <span>
              Showing page {result.page} of {result.totalPages} ({result.totalCount} total entries)
            </span>
          </div>

          {result.items.length === 0 ? (
            <p className="empty-message">No data available for the selected range.</p>
          ) : (
            <div className="history-table-wrapper">
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    {Object.keys(result.items[0]?.rates ?? {}).map((code) => (
                      <th key={code}>{code}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.items.map((item) => (
                    <tr key={item.date}>
                      <td className="date-cell">{item.date}</td>
                      {Object.entries(item.rates).map(([code, value]) => (
                        <td key={code}>
                          {value.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 })}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {result.totalPages > 1 && (
            <div className="pagination">
              <button
                className="btn btn-outline btn-sm"
                onClick={() => fetchPage(1)}
                disabled={currentPage === 1 || loading}
              >
                ««
              </button>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => fetchPage(currentPage - 1)}
                disabled={currentPage === 1 || loading}
              >
                ‹ Prev
              </button>

              <span className="pagination-info">
                Page {currentPage} / {result.totalPages}
              </span>

              <button
                className="btn btn-outline btn-sm"
                onClick={() => fetchPage(currentPage + 1)}
                disabled={currentPage === result.totalPages || loading}
              >
                Next ›
              </button>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => fetchPage(result.totalPages)}
                disabled={currentPage === result.totalPages || loading}
              >
                »»
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

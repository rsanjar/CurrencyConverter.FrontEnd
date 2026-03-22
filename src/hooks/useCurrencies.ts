import { useEffect, useState } from 'react';
import { currenciesApi } from '../services/api';
import type { CurrencyResponse } from '../types/api';

interface UseCurrenciesResult {
    currencies: CurrencyResponse[];
    isLoading: boolean;
    error: string | null;
}

export function useCurrencies(): UseCurrenciesResult {
    const [currencies, setCurrencies] = useState<CurrencyResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const abortController = new AbortController();

        const loadCurrencies = async () => {
            setError(null);

            try {
                const data = await currenciesApi.getAll({ signal: abortController.signal });
                setCurrencies(data);
            } catch (err) {
                if (abortController.signal.aborted) {
                    return;
                }

                setError(err instanceof Error ? err.message : 'Failed to load currencies');
            } finally {
                if (!abortController.signal.aborted) {
                    setIsLoading(false);
                }
            }
        };

        void loadCurrencies();

        return () => {
            abortController.abort();
        };
    }, []);

    return {
        currencies,
        isLoading,
        error,
    };
}
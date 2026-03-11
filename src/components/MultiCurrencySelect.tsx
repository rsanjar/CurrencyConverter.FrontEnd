import type { CurrencyResponse } from '../types/api';

interface MultiCurrencySelectProps {
  id: string;
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  currencies: CurrencyResponse[];
  disabled?: boolean;
  excludeCode?: string;
}

export default function MultiCurrencySelect({
  id,
  label,
  values,
  onChange,
  currencies,
  disabled = false,
  excludeCode,
}: MultiCurrencySelectProps) {
  const available = currencies.filter((c) => c.code !== excludeCode);

  const toggle = (code: string) => {
    if (values.includes(code)) {
      onChange(values.filter((v) => v !== code));
    } else {
      onChange([...values, code]);
    }
  };

  const selectAll = () => onChange(available.map((c) => c.code));
  const clearAll = () => onChange([]);

  return (
    <div className="form-group">
      <div className="multi-select-header">
        <label className="form-label">{label}</label>
        <div className="multi-select-actions">
          <button
            type="button"
            className="btn btn-xs btn-outline"
            onClick={selectAll}
            disabled={disabled}
          >
            All
          </button>
          <button
            type="button"
            className="btn btn-xs btn-outline"
            onClick={clearAll}
            disabled={disabled}
          >
            None
          </button>
        </div>
      </div>
      <div className="multi-select-grid" id={id}>
        {available.map((c) => (
          <label key={c.code} className={`currency-chip${values.includes(c.code) ? ' selected' : ''}`}>
            <input
              type="checkbox"
              checked={values.includes(c.code)}
              onChange={() => toggle(c.code)}
              disabled={disabled}
              className="sr-only"
            />
            <span>{c.code}</span>
          </label>
        ))}
      </div>
      {values.length > 0 && (
        <p className="form-hint">{values.length} selected</p>
      )}
    </div>
  );
}

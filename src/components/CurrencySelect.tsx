import type { CurrencyResponse } from '../types/api';

interface CurrencySelectProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  currencies: CurrencyResponse[];
  disabled?: boolean;
  required?: boolean;
}

export default function CurrencySelect({
  id,
  label,
  value,
  onChange,
  currencies,
  disabled = false,
  required = false,
}: CurrencySelectProps) {
  return (
    <div className="form-group">
      <label htmlFor={id} className="form-label">
        {label}
        {required && <span className="required">*</span>}
      </label>
      <select
        id={id}
        className="form-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        required={required}
      >
        <option value="">-- Select Currency --</option>
        {currencies.map((c) => (
          <option key={c.code} value={c.code}>
            {c.code} - {c.name}
          </option>
        ))}
      </select>
    </div>
  );
}

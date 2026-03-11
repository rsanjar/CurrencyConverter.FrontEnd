interface LoadingSpinnerProps {
  message?: string;
}

export default function LoadingSpinner({ message = 'Loading...' }: LoadingSpinnerProps) {
  return (
    <div className="loading-container">
      <div className="spinner" aria-label="Loading"></div>
      <p className="loading-text">{message}</p>
    </div>
  );
}

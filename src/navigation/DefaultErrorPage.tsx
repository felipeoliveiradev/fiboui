import React from 'react';
import { joinBasename } from './Router';
import { useRouterOptional } from './RouterContext';

interface DefaultErrorPageProps {
  error?: Error;
  onReset?: () => void;
}

const TITLE_ID = 'fibo-error-title';
const DETAIL_ID = 'fibo-error-detail';

/** Read env at runtime so Vite does not inline `process.env.NODE_ENV`. */
function envName(key: string): string | undefined {
  try {
    return process.env[key];
  } catch {
    return undefined;
  }
}

function errorDetail(error?: Error): string {
  if (!error) return '';
  const message = typeof error.message === 'string' ? error.message.trim() : '';
  if (message) return message;
  const asString = String(error).trim();
  if (asString && asString !== 'Error') return asString;
  return 'An unexpected error occurred';
}

export const DefaultErrorPage: React.FC<DefaultErrorPageProps> = ({ error, onReset }) => {
  const router = useRouterOptional();
  const homeHref = joinBasename(router?.basename ?? '', '/');
  const detail = errorDetail(error);

  const handleReload = () => {
    if (typeof window === 'undefined') return;
    window.location.reload();
  };

  const handleTryAgain = () => {
    if (onReset) {
      onReset();
      return;
    }
    handleReload();
  };

  return (
    <div
      role="alert"
      aria-live="assertive"
      aria-labelledby={TITLE_ID}
      aria-describedby={detail ? DETAIL_ID : undefined}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '2rem',
        backgroundColor: '#f9fafb',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: '600px',
          width: '100%',
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '3rem',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            margin: '0 auto 1.5rem',
            backgroundColor: '#fee2e2',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#dc2626"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>

        <h1
          id={TITLE_ID}
          style={{
            fontSize: '1.875rem',
            fontWeight: '700',
            color: '#111827',
            marginBottom: '0.5rem',
          }}
        >
          Oops! Something went wrong
        </h1>

        {detail ? (
          <div
            style={{
              marginTop: '1.5rem',
              padding: '1rem',
              backgroundColor: '#fef2f2',
              borderRadius: '8px',
              border: '1px solid #fecaca',
            }}
          >
            <p
              id={DETAIL_ID}
              style={{
                fontSize: '0.875rem',
                color: '#991b1b',
                fontFamily: 'monospace',
                margin: 0,
                wordBreak: 'break-word',
              }}
            >
              {detail}
            </p>
          </div>
        ) : null}

        <p
          style={{
            fontSize: '1rem',
            color: '#6b7280',
            marginTop: '1rem',
            marginBottom: '2rem',
          }}
        >
          We're sorry for the inconvenience. Please try one of the options below.
        </p>

        <div
          style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          <button
            type="button"
            onClick={handleTryAgain}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#2563eb';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#3b82f6';
            }}
          >
            Try Again
          </button>

          <button
            type="button"
            onClick={handleReload}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#4b5563';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#6b7280';
            }}
          >
            Reload Page
          </button>

          <a
            href={homeHref}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: 'white',
              color: '#374151',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s',
              textDecoration: 'none',
              display: 'inline-block',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f9fafb';
              e.currentTarget.style.borderColor = '#9ca3af';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'white';
              e.currentTarget.style.borderColor = '#d1d5db';
            }}
          >
            Go Home
          </a>
        </div>

        {error?.stack && envName('NODE_ENV') !== 'production' ? (
          <details
            style={{
              marginTop: '2rem',
              textAlign: 'left',
            }}
          >
            <summary
              style={{
                cursor: 'pointer',
                fontSize: '0.875rem',
                color: '#6b7280',
                fontWeight: '500',
              }}
            >
              Stack Trace
            </summary>
            <pre
              style={{
                marginTop: '1rem',
                padding: '1rem',
                backgroundColor: '#1f2937',
                color: '#f3f4f6',
                borderRadius: '8px',
                fontSize: '0.75rem',
                overflow: 'auto',
                maxHeight: '300px',
              }}
            >
              {error.stack}
            </pre>
          </details>
        ) : null}
      </div>
    </div>
  );
};

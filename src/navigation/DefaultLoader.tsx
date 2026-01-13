import React from 'react';

interface DefaultLoaderProps {
  message?: string;
}

export const DefaultLoader: React.FC<DefaultLoaderProps> = ({ message = 'Loading...' }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        padding: '2rem',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {}
      <div
        style={{
          width: '48px',
          height: '48px',
          border: '4px solid #e5e7eb',
          borderTop: '4px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }}
      />

      {}
      <p
        style={{
          marginTop: '1rem',
          fontSize: '1rem',
          color: '#6b7280',
          fontWeight: '500',
        }}
      >
        {message}
      </p>

      {}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

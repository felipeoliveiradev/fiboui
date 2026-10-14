export function Blob() {
  return (
    <svg
      className="blob"
      viewBox="0 0 420 420"
      role="img"
      aria-label="Abstract three-dimensional black form"
    >
      <defs>
        <radialGradient id="blob-body" cx="38%" cy="32%" r="68%">
          <stop offset="0%" stopColor="#3a3a3a" />
          <stop offset="42%" stopColor="#161616" />
          <stop offset="100%" stopColor="#050505" />
        </radialGradient>
        <radialGradient id="blob-spec" cx="34%" cy="28%" r="28%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <filter id="blob-goo" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="16" result="blur" />
          <feColorMatrix
            in="blur"
            mode="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 26 -10"
            result="goo"
          />
        </filter>
      </defs>
      <g filter="url(#blob-goo)" fill="url(#blob-body)">
        <circle cx="168" cy="168" r="96" />
        <circle cx="256" cy="154" r="86" />
        <circle cx="248" cy="248" r="92" />
        <circle cx="160" cy="246" r="80" />
        <circle cx="210" cy="210" r="70" />
      </g>
      <ellipse cx="176" cy="156" rx="54" ry="36" fill="url(#blob-spec)" />
    </svg>
  );
}

export function LogoMark() {
  return (
    <span className="nav-logo" aria-hidden="true">
      <span className="nav-logo-inner" />
    </span>
  );
}

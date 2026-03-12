export default function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" width={size} height={size}>
      <defs>
        <linearGradient id="lg1" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#e74c3c" />
          <stop offset="100%" stopColor="#ff6b6b" />
        </linearGradient>
        <linearGradient id="lg2" x1="0" y1="32" x2="32" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2c3e50" />
          <stop offset="100%" stopColor="#e74c3c" />
        </linearGradient>
        <linearGradient id="lg3" x1="16" y1="2" x2="16" y2="14" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ff6b6b" />
          <stop offset="100%" stopColor="#e74c3c" stopOpacity="0.3" />
        </linearGradient>
      </defs>
      <ellipse cx="16" cy="18" rx="9" ry="3.2" stroke="url(#lg1)" strokeWidth="1.6" />
      <path d="M7 18v7.5c0 1.77 4 3.2 9 3.2s9-1.43 9-3.2V18" stroke="url(#lg1)" strokeWidth="1.6" strokeLinecap="round" />
      <ellipse cx="16" cy="25.5" rx="9" ry="3.2" stroke="url(#lg1)" strokeWidth="1.6" />
      <path d="M7 21.8c0 1.77 4 3.2 9 3.2s9-1.43 9-3.2" stroke="url(#lg2)" strokeWidth="1" strokeLinecap="round" opacity="0.45" />
      <path d="M16 14.8 L16 6" stroke="url(#lg3)" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M16 11.5 L11 7.5" stroke="url(#lg3)" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="10" cy="6.8" r="1.5" fill="url(#lg1)" opacity="0.85" />
      <path d="M16 11.5 L21 7.5" stroke="url(#lg3)" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="22" cy="6.8" r="1.5" fill="url(#lg1)" opacity="0.85" />
      <circle cx="16" cy="4.5" r="2" fill="url(#lg1)" />
      <circle cx="12.5" cy="18" r="1" fill="#ff6b6b" opacity="0.7" />
      <circle cx="19.5" cy="18" r="1" fill="#e74c3c" opacity="0.7" />
    </svg>
  );
}

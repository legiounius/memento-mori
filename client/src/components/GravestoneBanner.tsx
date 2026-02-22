import { useState, useEffect } from 'react';

interface GravestoneBannerProps {
  position: 'top' | 'bottom';
  patternId: string;
}

function SmallPattern({ id }: { id: string }) {
  return (
    <pattern id={id} x="0" y="0" width="160" height="60" patternUnits="userSpaceOnUse">
      <rect x="4" y="28" width="38" height="32" fill="currentColor" />
      <path d="M4 28 Q4 14 23 14 Q42 14 42 28" fill="currentColor" />

      <rect x="52" y="24" width="36" height="36" fill="currentColor" />
      <rect x="65" y="10" width="10" height="18" fill="currentColor" />
      <rect x="58" y="16" width="24" height="7" fill="currentColor" />

      <rect x="98" y="20" width="40" height="40" fill="currentColor" />
      <path d="M98 20 Q98 4 118 4 Q138 4 138 20" fill="currentColor" />
    </pattern>
  );
}

function LargePattern({ id }: { id: string }) {
  return (
    <pattern id={id} x="0" y="0" width="200" height="60" patternUnits="userSpaceOnUse">
      <rect x="4" y="26" width="32" height="34" fill="currentColor" />
      <path d="M4 26 Q4 10 20 10 Q36 10 36 26" fill="currentColor" />

      <rect x="46" y="22" width="30" height="38" fill="currentColor" />
      <rect x="57" y="6" width="8" height="20" fill="currentColor" />
      <rect x="50" y="12" width="22" height="6" fill="currentColor" />

      <rect x="86" y="16" width="34" height="44" fill="currentColor" />
      <path d="M86 16 Q86 0 103 0 Q120 0 120 16" fill="currentColor" />

      <rect x="130" y="32" width="26" height="28" fill="currentColor" />
      <path d="M130 32 Q130 20 143 20 Q156 20 156 32" fill="currentColor" />

      <rect x="166" y="28" width="28" height="32" fill="currentColor" />
      <rect x="176" y="14" width="8" height="18" fill="currentColor" />
      <rect x="170" y="18" width="20" height="6" fill="currentColor" />
    </pattern>
  );
}

export function GravestoneBanner({ position, patternId }: GravestoneBannerProps) {
  const [isSmall, setIsSmall] = useState(false);

  useEffect(() => {
    const check = () => setIsSmall(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const posStyle = position === 'top'
    ? { top: '38px', height: '60px', opacity: 0.06, overflow: 'hidden' as const }
    : { bottom: '0', height: '60px', opacity: 0.06, overflow: 'hidden' as const };

  return (
    <div
      className="absolute left-0 w-full pointer-events-none select-none"
      style={posStyle}
      data-testid={`gravestone-banner${position === 'bottom' ? '-bottom' : ''}`}
    >
      <svg
        width="100%"
        height="60"
        preserveAspectRatio="none"
        viewBox="0 0 1200 60"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
        style={{ minWidth: '100%' }}
      >
        <defs>
          {isSmall ? <SmallPattern id={patternId} /> : <LargePattern id={patternId} />}
        </defs>
        <rect width="1200" height="60" fill={`url(#${patternId})`} />
      </svg>
    </div>
  );
}

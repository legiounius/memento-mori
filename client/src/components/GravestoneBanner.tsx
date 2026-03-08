import tombstoneImage from "@assets/tombstones_1773000175414.jpg";

interface GravestoneBannerProps {
  position: 'top' | 'bottom';
  patternId?: string;
}

export function GravestoneBanner({ position }: GravestoneBannerProps) {
  const isTop = position === 'top';

  return (
    <div
      className="absolute left-0 w-full pointer-events-none select-none overflow-hidden"
      style={{
        ...(isTop ? { top: '38px' } : { bottom: '0' }),
        height: '80px',
        opacity: 0.15,
      }}
      data-testid={`gravestone-banner${isTop ? '' : '-bottom'}`}
    >
      <img
        src={tombstoneImage}
        alt=""
        className="w-full h-full object-cover object-center"
        style={isTop ? undefined : { transform: 'scaleY(-1)' }}
      />
    </div>
  );
}

import { useMemo } from 'react';
import { differenceInWeeks } from 'date-fns';

interface LifeGridProps {
  birthdate: Date | undefined;
}

const TOTAL_YEARS = 80;
const WEEKS_PER_YEAR = 52;
const TOTAL_WEEKS = TOTAL_YEARS * WEEKS_PER_YEAR;

export function LifeGrid({ birthdate }: LifeGridProps) {
  const weeksLived = useMemo(() => {
    if (!birthdate) return 0;
    const today = new Date();
    return Math.min(TOTAL_WEEKS, Math.max(0, differenceInWeeks(today, birthdate)));
  }, [birthdate]);

  const weeksRemaining = TOTAL_WEEKS - weeksLived;
  const percentRemaining = birthdate
    ? ((weeksRemaining / TOTAL_WEEKS) * 100).toFixed(1)
    : null;

  const weekNumbers = Array.from({ length: WEEKS_PER_YEAR }, (_, i) => i + 1);

  return (
    <div className="w-full max-w-[960px] mx-auto p-4 md:p-8">
      <div className="overflow-x-auto flex flex-col items-center">
        <div className="text-center mb-4 font-mono text-sm text-muted-foreground uppercase tracking-widest border-b border-border pb-2 w-full" style={{ maxWidth: 'fit-content' }}>
          <span data-testid="text-stats">
            {birthdate
              ? `${weeksLived.toLocaleString()} weeks lived · ${percentRemaining}% remaining until age 80`
              : "Select your birthdate"}
          </span>
        </div>

        <div className="relative">
          <div
            className="absolute font-mono text-muted-foreground select-none"
            style={{
              fontSize: '9px',
              writingMode: 'vertical-rl',
              transform: 'rotate(180deg)',
              left: '-18px',
              top: '12px',
              bottom: '0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              letterSpacing: '2px',
              textTransform: 'uppercase',
            }}
          >
            Years
          </div>

          <div
            className="text-center font-mono text-muted-foreground select-none mb-1"
            style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase' }}
          >
            Weeks
          </div>

          <div className="inline-grid" style={{
            gridTemplateColumns: `32px repeat(${WEEKS_PER_YEAR}, minmax(0, 1fr))`,
            gap: '3px',
            minWidth: '500px',
          }}>
            <div />
            {weekNumbers.map((w) => (
              <div
                key={`wh-${w}`}
                className="text-center font-mono text-muted-foreground select-none"
                style={{ fontSize: '8px', lineHeight: '12px' }}
              >
                {w}
              </div>
            ))}

            {Array.from({ length: TOTAL_YEARS }).flatMap((_, yearIndex) => {
              const yearLabel = (
                <div
                  key={`yl-${yearIndex}`}
                  className="flex items-center justify-end pr-1 font-mono text-muted-foreground select-none"
                  style={{ fontSize: '9px', lineHeight: '12px' }}
                >
                  {yearIndex + 1}
                </div>
              );

              const dots = Array.from({ length: WEEKS_PER_YEAR }, (_, weekIndex) => {
                const dotIndex = yearIndex * WEEKS_PER_YEAR + weekIndex;
                const isLived = birthdate && dotIndex < weeksLived;

                return (
                  <div
                    key={`d-${dotIndex}`}
                    className={`
                      aspect-square rounded-full w-full
                      transition-colors duration-300
                      ${isLived
                        ? 'bg-red-600'
                        : 'bg-zinc-300 dark:bg-zinc-700'
                      }
                    `}
                    title={`Year ${yearIndex + 1}, Week ${weekIndex + 1}`}
                    data-testid={`dot-${dotIndex}`}
                  />
                );
              });

              return [yearLabel, ...dots];
            })}
          </div>
        </div>

        <div className="mt-6 text-center font-mono text-sm text-muted-foreground">
          <p>1 row = 1 year  ·  1 dot = 1 week</p>
        </div>
      </div>
    </div>
  );
}

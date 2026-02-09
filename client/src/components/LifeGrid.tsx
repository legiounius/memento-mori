import { useMemo } from 'react';
import { differenceInWeeks } from 'date-fns';
import { Star } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { LifeEvent } from './EventForm';
const SKULL_SVG = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M50 5C28 5 15 22 15 42c0 12 5 22 13 28v10c0 3 2 5 5 5h2v5c0 3 2 5 5 5s5-2 5-5v-5h10v5c0 3 2 5 5 5s5-2 5-5v-5h2c3 0 5-2 5-5V70c8-6 13-16 13-28C85 22 72 5 50 5zM35 50c-5 0-9-4-9-9s4-9 9-9 9 4 9 9-4 9-9 9zm30 0c-5 0-9-4-9-9s4-9 9-9 9 4 9 9-4 9-9 9zM50 68c-6 0-11-2-11-5s5-5 11-5 11 2 11 5-5 5-11 5z" fill="black"/></svg>`)}`;

interface LifeGridProps {
  birthdate: Date | undefined;
  targetAge: number;
  events: LifeEvent[];
}

const WEEKS_PER_YEAR = 52;

const skullStyle = {
  WebkitMaskImage: `url("${SKULL_SVG}")`,
  maskImage: `url("${SKULL_SVG}")`,
  WebkitMaskSize: 'contain',
  maskSize: 'contain',
  WebkitMaskRepeat: 'no-repeat',
  maskRepeat: 'no-repeat',
  WebkitMaskPosition: 'center',
  maskPosition: 'center',
} as React.CSSProperties;

export function LifeGrid({ birthdate, targetAge, events }: LifeGridProps) {
  const totalWeeks = targetAge * WEEKS_PER_YEAR;

  const weeksLived = useMemo(() => {
    if (!birthdate) return 0;
    const today = new Date();
    return Math.min(totalWeeks, Math.max(0, differenceInWeeks(today, birthdate)));
  }, [birthdate, totalWeeks]);

  const currentWeekIndex = birthdate ? weeksLived - 1 : -1;

  const eventWeekMap = useMemo(() => {
    if (!birthdate) return new Map<number, string[]>();
    const map = new Map<number, string[]>();
    for (const event of events) {
      const eventDate = new Date(event.date);
      const diffMs = eventDate.getTime() - birthdate.getTime();
      const weekIndex = Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000));
      if (weekIndex >= 0 && weekIndex < totalWeeks) {
        const existing = map.get(weekIndex);
        if (existing) {
          existing.push(event.label);
        } else {
          map.set(weekIndex, [event.label]);
        }
      }
    }
    return map;
  }, [birthdate, events, totalWeeks]);

  const weeksRemaining = totalWeeks - weeksLived;
  const percentLived = birthdate
    ? ((weeksLived / totalWeeks) * 100).toFixed(1)
    : null;
  const percentRemaining = birthdate
    ? ((weeksRemaining / totalWeeks) * 100).toFixed(1)
    : null;

  const weekNumbers = Array.from({ length: WEEKS_PER_YEAR }, (_, i) => i + 1);

  return (
    <div className="w-full max-w-[960px] mx-auto p-4 md:p-8">
      <div className="overflow-x-auto flex flex-col items-center">
        <div className="text-center mb-4 font-mono text-sm text-muted-foreground uppercase tracking-widest border-b border-border pb-2 w-full" style={{ maxWidth: 'fit-content' }}>
          <span data-testid="text-stats">
            {birthdate
              ? `${weeksLived.toLocaleString()} weeks lived (${percentLived}%) · ${weeksRemaining.toLocaleString()} weeks remaining (${percentRemaining}%)`
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
            gridTemplateColumns: `24px repeat(${WEEKS_PER_YEAR}, minmax(0, 1fr))`,
            gap: '2px',
            minWidth: '460px',
          }}>
            <div />
            {weekNumbers.map((w) => (
              <div
                key={`wh-${w}`}
                className="text-center font-mono text-muted-foreground select-none hidden md:block"
                style={{ fontSize: '8px', lineHeight: '12px' }}
              >
                {w}
              </div>
            ))}

            {Array.from({ length: targetAge }).flatMap((_, yearIndex) => {
              const yearLabel = (
                <div
                  key={`yl-${yearIndex}`}
                  className="flex items-center justify-end pr-1 font-mono text-muted-foreground select-none"
                  style={{ fontSize: '9px', lineHeight: '12px' }}
                >
                  {yearIndex}
                </div>
              );

              const dots = Array.from({ length: WEEKS_PER_YEAR }, (_, weekIndex) => {
                const dotIndex = yearIndex * WEEKS_PER_YEAR + weekIndex;
                const eventLabels = eventWeekMap.get(dotIndex);
                const isLived = birthdate && dotIndex < weeksLived;
                const isCurrentWeek = dotIndex === currentWeekIndex;

                if (isCurrentWeek && birthdate) {
                  return (
                    <Tooltip key={`d-${dotIndex}`}>
                      <TooltipTrigger asChild>
                        <div
                          className="aspect-square w-full flex items-center justify-center"
                          data-testid={`dot-${dotIndex}`}
                        >
                          <Star className="w-full h-full text-black fill-black dark:text-white dark:fill-white" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs">
                        <p className="font-medium">You are here</p>
                        <p className="text-muted-foreground">Year {yearIndex}, Week {weekIndex + 1}</p>
                      </TooltipContent>
                    </Tooltip>
                  );
                }

                const isEvent = !!eventLabels;

                if (isEvent) {
                  return (
                    <Tooltip key={`d-${dotIndex}`}>
                      <TooltipTrigger asChild>
                        <div
                          className="aspect-square w-full flex items-center justify-center"
                          data-testid={`dot-${dotIndex}`}
                        >
                          <Star className="w-full h-full text-black fill-black dark:text-white dark:fill-white" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs max-w-[200px]">
                        <p className="font-medium">{eventLabels.join(", ")}</p>
                        <p className="text-muted-foreground">Year {yearIndex}, Week {weekIndex + 1}</p>
                      </TooltipContent>
                    </Tooltip>
                  );
                }

                const dot = (
                  <div
                    className={`
                      aspect-square w-full
                      transition-colors duration-300
                      ${isLived ? 'bg-red-600' : 'bg-zinc-300 dark:bg-zinc-700'}
                    `}
                    style={skullStyle}
                    data-testid={`dot-${dotIndex}`}
                  />
                );

                return (
                  <div key={`d-${dotIndex}`} title={`Year ${yearIndex}, Week ${weekIndex + 1}`}>
                    {dot}
                  </div>
                );
              });

              return [yearLabel, ...dots];
            })}
          </div>
        </div>

        <div className="mt-6 text-center font-mono text-sm text-muted-foreground">
          <p>1 row = 1 year  ·  1 skull = 1 week</p>
        </div>
      </div>
    </div>
  );
}

import { useMemo } from 'react';
import { differenceInWeeks } from 'date-fns';
import { Star } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { LifeEvent } from './EventForm';

interface LifeGridProps {
  birthdate: Date | undefined;
  targetAge: number;
  events: LifeEvent[];
}

const WEEKS_PER_YEAR = 52;

export function LifeGrid({ birthdate, targetAge, events }: LifeGridProps) {
  const totalWeeks = targetAge * WEEKS_PER_YEAR;

  const weeksLived = useMemo(() => {
    if (!birthdate) return 0;
    const today = new Date();
    return Math.min(totalWeeks, Math.max(0, differenceInWeeks(today, birthdate)));
  }, [birthdate, totalWeeks]);

  const currentWeekIndex = birthdate ? weeksLived - 1 : -1;

  const eventWeekMap = useMemo(() => {
    if (!birthdate) return new Map<number, { color: string; labels: string[] }>();
    const map = new Map<number, { color: string; labels: string[] }>();
    for (const event of events) {
      const eventDate = new Date(event.date);
      const diffMs = eventDate.getTime() - birthdate.getTime();
      const weekIndex = Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000));
      if (weekIndex >= 0 && weekIndex < totalWeeks) {
        const existing = map.get(weekIndex);
        if (existing) {
          existing.labels.push(event.label);
        } else {
          map.set(weekIndex, { color: event.color, labels: [event.label] });
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
                const eventData = eventWeekMap.get(dotIndex);
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

                let dotColor: string;
                if (eventData) {
                  dotColor = eventData.color;
                } else if (isLived) {
                  dotColor = 'bg-red-600';
                } else {
                  dotColor = 'bg-zinc-300 dark:bg-zinc-700';
                }

                const dot = (
                  <div
                    className={`
                      aspect-square rounded-full w-full
                      transition-colors duration-300
                      ${dotColor}
                    `}
                    data-testid={`dot-${dotIndex}`}
                  />
                );

                if (eventData) {
                  return (
                    <Tooltip key={`d-${dotIndex}`}>
                      <TooltipTrigger asChild>
                        {dot}
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs max-w-[200px]">
                        <p className="font-medium">{eventData.labels.join(", ")}</p>
                        <p className="text-muted-foreground">Year {yearIndex}, Week {weekIndex + 1}</p>
                      </TooltipContent>
                    </Tooltip>
                  );
                }

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
          <p>1 row = 1 year  ·  1 dot = 1 week</p>
        </div>
      </div>
    </div>
  );
}

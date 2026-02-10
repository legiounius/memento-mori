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

interface YearEvent {
  weekInYear: number;
  labels: string[];
}

export function LifeGrid({ birthdate, targetAge, events }: LifeGridProps) {
  const totalWeeks = targetAge * WEEKS_PER_YEAR;

  const weeksLived = useMemo(() => {
    if (!birthdate) return 0;
    const today = new Date();
    return Math.min(totalWeeks, Math.max(0, differenceInWeeks(today, birthdate)));
  }, [birthdate, totalWeeks]);

  const currentYearIndex = birthdate ? Math.floor((weeksLived - 1) / WEEKS_PER_YEAR) : -1;
  const currentWeekInYear = birthdate ? ((weeksLived - 1) % WEEKS_PER_YEAR) : -1;

  const eventsByYear = useMemo(() => {
    if (!birthdate) return new Map<number, YearEvent[]>();
    const map = new Map<number, YearEvent[]>();
    for (const event of events) {
      const eventDate = new Date(event.date);
      const diffMs = eventDate.getTime() - birthdate.getTime();
      const weekIndex = Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000));
      if (weekIndex >= 0 && weekIndex < totalWeeks) {
        const yearIdx = Math.floor(weekIndex / WEEKS_PER_YEAR);
        const weekInYear = weekIndex % WEEKS_PER_YEAR;
        const existing = map.get(yearIdx);
        const yearEvent: YearEvent = { weekInYear, labels: [event.label] };
        if (existing) {
          const found = existing.find(e => e.weekInYear === weekInYear);
          if (found) {
            found.labels.push(event.label);
          } else {
            existing.push(yearEvent);
          }
        } else {
          map.set(yearIdx, [yearEvent]);
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

  return (
    <div className="w-full max-w-[700px] mx-auto p-4 md:p-8">
      <div className="flex flex-col items-center">
        <div className="text-center mb-4 font-mono text-sm text-muted-foreground uppercase tracking-widest border-b border-border pb-2 w-full">
          <span data-testid="text-stats">
            {birthdate
              ? `${weeksLived.toLocaleString()} weeks lived (${percentLived}%) · ${weeksRemaining.toLocaleString()} weeks remaining (${percentRemaining}%)`
              : "Select your birthdate"}
          </span>
        </div>

        <div className="w-full space-y-[2px]">
          {Array.from({ length: targetAge }).map((_, yearIndex) => {
            const yearStartWeek = yearIndex * WEEKS_PER_YEAR;
            const yearEndWeek = yearStartWeek + WEEKS_PER_YEAR;

            let fillPercent: number;
            if (!birthdate) {
              fillPercent = 0;
            } else if (weeksLived >= yearEndWeek) {
              fillPercent = 100;
            } else if (weeksLived <= yearStartWeek) {
              fillPercent = 0;
            } else {
              fillPercent = ((weeksLived - yearStartWeek) / WEEKS_PER_YEAR) * 100;
            }

            const isCurrentYear = yearIndex === currentYearIndex;
            const yearEvents = eventsByYear.get(yearIndex) || [];

            const showEveryLabel = yearIndex % 5 === 0;

            return (
              <div
                key={`year-${yearIndex}`}
                className="flex items-center gap-2"
                data-testid={`year-row-${yearIndex}`}
              >
                <div
                  className="font-mono text-muted-foreground select-none text-right shrink-0"
                  style={{ fontSize: '9px', width: '28px' }}
                >
                  {showEveryLabel ? yearIndex : ''}
                </div>

                <div className="relative flex-1 h-[8px] rounded-sm border border-zinc-300 dark:border-zinc-600 bg-zinc-200 dark:bg-zinc-800">
                  {fillPercent > 0 && (
                    <div
                      className="absolute inset-y-0 left-0 bg-red-600 rounded-sm transition-all duration-300"
                      style={{ width: `${fillPercent}%` }}
                      data-testid={`bar-fill-${yearIndex}`}
                    />
                  )}

                  {isCurrentYear && birthdate && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className="absolute flex items-center justify-center"
                          style={{
                            left: `${(currentWeekInYear / WEEKS_PER_YEAR) * 100}%`,
                            top: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: '14px',
                            height: '14px',
                            zIndex: 10,
                          }}
                          data-testid="marker-current-week"
                        >
                          <div
                            className="w-full h-full bg-black dark:bg-white"
                            style={{
                              WebkitMaskImage: `url("${SKULL_SVG}")`,
                              maskImage: `url("${SKULL_SVG}")`,
                              WebkitMaskSize: 'contain',
                              maskSize: 'contain',
                              WebkitMaskRepeat: 'no-repeat',
                              maskRepeat: 'no-repeat',
                              WebkitMaskPosition: 'center',
                              maskPosition: 'center',
                            }}
                          />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs">
                        <p className="font-medium">You are here</p>
                        <p className="text-muted-foreground">Age {yearIndex}, Week {currentWeekInYear + 1}</p>
                      </TooltipContent>
                    </Tooltip>
                  )}

                  {yearEvents.map((evt, i) => (
                    <Tooltip key={`evt-${yearIndex}-${i}`}>
                      <TooltipTrigger asChild>
                        <div
                          className="absolute flex items-center justify-center"
                          style={{
                            left: `${(evt.weekInYear / WEEKS_PER_YEAR) * 100}%`,
                            top: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: '12px',
                            height: '12px',
                            zIndex: 10,
                          }}
                          data-testid={`marker-event-${yearIndex}-${evt.weekInYear}`}
                        >
                          <Star className="w-full h-full text-black fill-black dark:text-white dark:fill-white" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs max-w-[200px]">
                        <p className="font-medium">{evt.labels.join(", ")}</p>
                        <p className="text-muted-foreground">Age {yearIndex}, Week {evt.weekInYear + 1}</p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 text-center font-mono text-sm text-muted-foreground space-y-1">
          <p>1 row = 1 year · bar fills by weeks lived</p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-4 h-[8px] bg-red-600 rounded-sm border border-zinc-300 dark:border-zinc-600" />
              <span className="text-xs">Lived</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-4 h-[8px] bg-zinc-200 dark:bg-zinc-800 rounded-sm border border-zinc-300 dark:border-zinc-600" />
              <span className="text-xs">Remaining</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-[14px] h-[14px] bg-black dark:bg-white" style={{
                WebkitMaskImage: `url("${SKULL_SVG}")`,
                maskImage: `url("${SKULL_SVG}")`,
                WebkitMaskSize: 'contain',
                maskSize: 'contain',
                WebkitMaskRepeat: 'no-repeat',
                maskRepeat: 'no-repeat',
                WebkitMaskPosition: 'center',
                maskPosition: 'center',
              }} />
              <span className="text-xs">Now</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Star className="w-3 h-3 text-black fill-black dark:text-white dark:fill-white" />
              <span className="text-xs">Event</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

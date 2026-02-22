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
  bornLabel?: string;
  deadLabel?: string;
  onChangeBirthdate?: () => void;
}

const WEEKS_PER_YEAR = 52;

interface YearEvent {
  weekInYear: number;
  labels: string[];
}

export function LifeGrid({ birthdate, targetAge, events, bornLabel, deadLabel, onChangeBirthdate }: LifeGridProps) {
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

  const { hoursLived, hoursLeft } = useMemo(() => {
    if (!birthdate) return { hoursLived: null, hoursLeft: null };
    const now = new Date();
    const targetDate = new Date(birthdate);
    targetDate.setFullYear(targetDate.getFullYear() + targetAge);
    const livedMs = now.getTime() - birthdate.getTime();
    const leftMs = targetDate.getTime() - now.getTime();
    return {
      hoursLived: Math.max(0, Math.floor(livedMs / (1000 * 60 * 60))),
      hoursLeft: Math.max(0, Math.floor(leftMs / (1000 * 60 * 60))),
    };
  }, [birthdate, targetAge]);

  return (
    <div className="w-full max-w-[700px] mx-auto p-4 md:p-8">
      <div className="flex flex-col items-center">
        <div className="mb-4 text-muted-foreground border-b border-border pb-2 w-full space-y-0.5">
          {birthdate ? (
            <>
              <div className="flex items-start text-[11px] tracking-widest uppercase" data-testid="text-column-headers">
                <span className="font-bold underline underline-offset-4 decoration-muted-foreground/40 w-1/3">Lived</span>
                <div className="w-1/3 flex flex-col items-center" data-testid="birthdate-display">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold text-foreground normal-case tracking-normal">Born: {bornLabel}</span>
                    {onChangeBirthdate && (
                      <button
                        onClick={onChangeBirthdate}
                        className="text-[9px] text-muted-foreground underline underline-offset-2 decoration-muted-foreground/40 normal-case tracking-normal"
                        data-testid="button-change-birthdate"
                      >
                        change
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold text-foreground normal-case tracking-normal" data-testid="text-death-date">Dead: {deadLabel}</span>
                    {onChangeBirthdate && (
                      <span className="text-[9px] invisible" aria-hidden="true">change</span>
                    )}
                  </div>
                </div>
                <span className="font-bold underline underline-offset-4 decoration-muted-foreground/40 w-1/3 text-right">Left</span>
              </div>
              <div className="flex justify-between text-[11px] tracking-widest uppercase" data-testid="text-weeks-stats">
                <span className="font-bold">{weeksLived.toLocaleString()} Weeks ({percentLived}%)</span>
                <span className="font-bold">{weeksRemaining.toLocaleString()} Weeks ({percentRemaining}%)</span>
              </div>
              {hoursLived !== null && hoursLeft !== null && (
                <div className="flex justify-between text-[11px] tracking-widest uppercase" data-testid="text-hours-stats">
                  <span className="font-bold">{hoursLived.toLocaleString()} Hours</span>
                  <span className="font-bold">{hoursLeft.toLocaleString()} Hours</span>
                </div>
              )}
            </>
          ) : (
            <div className="text-center text-sm uppercase tracking-widest" data-testid="text-stats">Select your birthdate</div>
          )}
        </div>

        <div className="w-full flex">
          <div className="flex flex-col items-center mr-1.5" style={{ width: '18px', marginTop: '70px', height: '120px' }}>
            <span className="text-xs font-bold text-muted-foreground select-none" style={{ writingMode: 'vertical-lr', transform: 'rotate(180deg)' }} data-testid="label-years">Years</span>
            <div className="flex-1 mt-1 flex flex-col items-center">
              <div className="flex-1 w-[1px] bg-muted-foreground/30" />
              <svg width="10" height="8" viewBox="0 0 10 8" className="text-muted-foreground/50 shrink-0">
                <path d="M0 0 L5 8 L10 0" fill="currentColor" />
              </svg>
            </div>
          </div>

          <div className="flex-1">
            <div className="w-full flex items-center gap-2 mb-1">
              <div className="shrink-0" style={{ width: '32px' }} />
              <div className="flex-1 flex items-center">
                <span className="text-xs font-bold text-muted-foreground select-none" data-testid="label-0wks">Week 1</span>
                <div className="flex-1 mx-1.5 flex items-center">
                  <div className="flex-1 h-[1px] bg-muted-foreground/30" />
                  <svg width="8" height="10" viewBox="0 0 8 10" className="text-muted-foreground/50 shrink-0">
                    <path d="M0 0 L8 5 L0 10" fill="currentColor" />
                  </svg>
                </div>
                <span className="text-xs font-bold text-muted-foreground select-none" data-testid="label-52wks">Week 52</span>
              </div>
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

            const nowPercent = isCurrentYear ? (currentWeekInYear / WEEKS_PER_YEAR) * 100 : 0;
            const barFillPercent = isCurrentYear ? nowPercent : fillPercent;

            return (
              <div
                key={`year-${yearIndex}`}
                className="flex items-center gap-2"
                data-testid={`year-row-${yearIndex}`}
              >
                <div
                  className={`${yearIndex === 0 ? 'text-[10px]' : 'text-xs'} font-bold text-muted-foreground select-none text-right shrink-0`}
                  style={{ width: '32px' }}
                >
                  {yearIndex === 0 ? 'Born' : yearIndex}
                </div>

                <div className="relative flex-1 h-[8px] rounded-sm border border-zinc-300 dark:border-zinc-600 bg-transparent">
                  {barFillPercent > 0 && (() => {
                    const lastFilledYear = Math.floor((weeksLived - 1) / WEEKS_PER_YEAR);
                    const progress = lastFilledYear > 0 ? yearIndex / lastFilledYear : 1;
                    const lightness = Math.round(75 - (75 * progress));
                    const fillColor = `hsl(0, 0%, ${lightness}%)`;
                    return (
                      <div
                        className="absolute inset-y-0 left-0 rounded-sm transition-all duration-300"
                        style={{ width: `${barFillPercent}%`, backgroundColor: fillColor }}
                        data-testid={`bar-fill-${yearIndex}`}
                      />
                    );
                  })()}

                  {isCurrentYear && birthdate && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className="absolute"
                          style={{
                            left: `${nowPercent}%`,
                            top: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: '16px',
                            height: '16px',
                            borderRadius: '50%',
                            border: '3px solid #dc2626',
                            backgroundColor: 'black',
                            zIndex: 10,
                          }}
                          data-testid="marker-current-week"
                        />
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
                            width: '18px',
                            height: '18px',
                            zIndex: 10,
                          }}
                          data-testid={`marker-event-${yearIndex}-${evt.weekInYear}`}
                        >
                          <Star className="w-full h-full" style={{ color: '#dc2626', fill: '#dc2626' }} />
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
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-muted-foreground space-y-1">
          <p>1 row = 1 year · bar fills by weeks lived</p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-8 h-[8px] rounded-sm border border-zinc-300 dark:border-zinc-600 overflow-hidden flex">
                <span className="h-full flex-1" style={{ backgroundColor: 'hsl(0, 0%, 75%)' }} />
                <span className="h-full flex-1" style={{ backgroundColor: 'hsl(0, 0%, 50%)' }} />
                <span className="h-full flex-1" style={{ backgroundColor: 'hsl(0, 0%, 25%)' }} />
                <span className="h-full flex-1" style={{ backgroundColor: 'hsl(0, 0%, 0%)' }} />
              </span>
              <span className="text-xs">Lived</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-4 h-[8px] bg-transparent rounded-sm border border-zinc-300 dark:border-zinc-600" />
              <span className="text-xs">Remaining</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-[14px] h-[14px] rounded-full" style={{ border: '3px solid #dc2626', backgroundColor: 'black' }} />
              <span className="text-xs">Now</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Star className="w-4 h-4" style={{ color: '#dc2626', fill: '#dc2626' }} />
              <span className="text-xs">Event</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

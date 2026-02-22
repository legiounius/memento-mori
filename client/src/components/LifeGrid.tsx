import { useMemo } from 'react';
import { differenceInMonths, differenceInWeeks } from 'date-fns';
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
  onChangeTargetAge?: () => void;
}

const MONTHS_PER_YEAR = 12;

interface YearEvent {
  monthInYear: number;
  labels: string[];
}

export function LifeGrid({ birthdate, targetAge, events, bornLabel, deadLabel, onChangeBirthdate, onChangeTargetAge }: LifeGridProps) {
  const totalMonths = targetAge * MONTHS_PER_YEAR;

  const monthsLived = useMemo(() => {
    if (!birthdate) return 0;
    const today = new Date();
    return Math.min(totalMonths, Math.max(0, differenceInMonths(today, birthdate)));
  }, [birthdate, totalMonths]);

  const currentYearIndex = birthdate ? Math.floor((monthsLived - 1) / MONTHS_PER_YEAR) : -1;
  const currentMonthInYear = birthdate ? ((monthsLived - 1) % MONTHS_PER_YEAR) : -1;

  const eventsByYear = useMemo(() => {
    if (!birthdate) return new Map<number, YearEvent[]>();
    const map = new Map<number, YearEvent[]>();
    for (const event of events) {
      const eventDate = new Date(event.date);
      const monthIndex = differenceInMonths(eventDate, birthdate);
      if (monthIndex >= 0 && monthIndex < totalMonths) {
        const yearIdx = Math.floor(monthIndex / MONTHS_PER_YEAR);
        const monthInYear = monthIndex % MONTHS_PER_YEAR;
        const existing = map.get(yearIdx);
        const yearEvent: YearEvent = { monthInYear, labels: [event.label] };
        if (existing) {
          const found = existing.find(e => e.monthInYear === monthInYear);
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
  }, [birthdate, events, totalMonths]);

  const monthsRemaining = totalMonths - monthsLived;
  const percentLived = birthdate
    ? ((monthsLived / totalMonths) * 100).toFixed(1)
    : null;
  const percentRemaining = birthdate
    ? ((monthsRemaining / totalMonths) * 100).toFixed(1)
    : null;

  const { weeksLived, weeksLeft } = useMemo(() => {
    if (!birthdate) return { weeksLived: null, weeksLeft: null };
    const now = new Date();
    const targetDate = new Date(birthdate);
    targetDate.setFullYear(targetDate.getFullYear() + targetAge);
    const lived = differenceInWeeks(now, birthdate);
    const left = differenceInWeeks(targetDate, now);
    return {
      weeksLived: Math.max(0, lived),
      weeksLeft: Math.max(0, left),
    };
  }, [birthdate, targetAge]);

  return (
    <div className="w-full max-w-[700px] mx-auto px-4 md:px-8 pt-1 pb-4">
      <div className="flex flex-col items-center">
        <div className="mb-4 text-muted-foreground border-b border-border pb-2 w-full space-y-0.5">
          {birthdate ? (
            <>
              <div className="flex items-center text-[11px] tracking-widest uppercase" data-testid="text-column-headers">
                <span className="font-bold underline underline-offset-4 decoration-muted-foreground/40 w-1/3">Lived</span>
                <div className="w-1/3 flex items-center justify-center gap-1.5" data-testid="target-age-display">
                  <span className="font-bold text-foreground normal-case tracking-normal">Months to age {targetAge}</span>
                  {onChangeTargetAge && (
                    <button
                      onClick={onChangeTargetAge}
                      className="text-[9px] text-muted-foreground underline underline-offset-2 decoration-muted-foreground/40 normal-case tracking-normal"
                      data-testid="button-change-target-age"
                    >
                      change
                    </button>
                  )}
                </div>
                <span className="font-bold underline underline-offset-4 decoration-muted-foreground/40 w-1/3 text-right">Left</span>
              </div>
              <div className="flex items-center text-[11px] tracking-widest uppercase" data-testid="text-months-stats">
                <span className="font-bold w-1/3">{monthsLived.toLocaleString()} Months ({percentLived}%)</span>
                <div className="w-1/3 flex items-center justify-center gap-1.5" data-testid="birthdate-display">
                  <span className="font-bold text-foreground normal-case tracking-normal">Born: {bornLabel}</span>
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
                <span className="font-bold w-1/3 text-right">{monthsRemaining.toLocaleString()} Months ({percentRemaining}%)</span>
              </div>
              {weeksLived !== null && weeksLeft !== null && (
                <div className="flex items-center text-[11px] tracking-widest uppercase" data-testid="text-weeks-stats">
                  <span className="font-bold w-1/3">{weeksLived.toLocaleString()} Weeks</span>
                  <div className="w-1/3 flex items-center justify-center gap-1.5">
                    <span className="font-bold text-foreground normal-case tracking-normal" data-testid="text-death-date">Dead: {deadLabel}</span>
                    {onChangeBirthdate && (
                      <span className="text-[9px] invisible" aria-hidden="true">chang</span>
                    )}
                  </div>
                  <span className="font-bold w-1/3 text-right">{weeksLeft.toLocaleString()} Weeks</span>
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
                <span className="text-xs font-bold text-muted-foreground select-none" data-testid="label-0mo">Month 1</span>
                <div className="flex-1 mx-1.5 flex items-center">
                  <div className="flex-1 h-[1px] bg-muted-foreground/30" />
                  <svg width="8" height="10" viewBox="0 0 8 10" className="text-muted-foreground/50 shrink-0">
                    <path d="M0 0 L8 5 L0 10" fill="currentColor" />
                  </svg>
                </div>
                <span className="text-xs font-bold text-muted-foreground select-none" data-testid="label-12mo">Month 12</span>
              </div>
            </div>

            <div className="w-full space-y-[2px]">
              {Array.from({ length: targetAge }).map((_, yearIndex) => {
            const yearStartMonth = yearIndex * MONTHS_PER_YEAR;
            const isCurrentYear = yearIndex === currentYearIndex;
            const yearEvents = eventsByYear.get(yearIndex) || [];
            const lastFilledYear = Math.floor((monthsLived - 1) / MONTHS_PER_YEAR);

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

                <div className="flex-1 flex items-center justify-between">
                  {Array.from({ length: MONTHS_PER_YEAR }).map((_, monthIndex) => {
                    const globalMonth = yearStartMonth + monthIndex;
                    const isLived = birthdate ? globalMonth < monthsLived : false;
                    const isCurrent = isCurrentYear && monthIndex === currentMonthInYear;
                    const event = yearEvents.find(e => e.monthInYear === monthIndex);

                    const progress = lastFilledYear > 0 ? yearIndex / lastFilledYear : 1;
                    const lightness = Math.round(75 - (75 * Math.min(1, progress)));
                    const dotColor = isLived ? `hsl(0, 0%, ${lightness}%)` : undefined;

                    if (event) {
                      return (
                        <Tooltip key={`dot-${yearIndex}-${monthIndex}`}>
                          <TooltipTrigger asChild>
                            <div
                              className="flex items-center justify-center"
                              style={{ width: '14px', height: '14px' }}
                              data-testid={`marker-event-${yearIndex}-${monthIndex}`}
                            >
                              <Star className="w-full h-full" style={{ color: '#dc2626', fill: '#dc2626' }} />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="text-xs max-w-[200px]">
                            <p className="font-medium">{event.labels.join(", ")}</p>
                            <p className="text-muted-foreground">Age {yearIndex}, Month {monthIndex + 1}</p>
                          </TooltipContent>
                        </Tooltip>
                      );
                    }

                    if (isCurrent && birthdate) {
                      return (
                        <Tooltip key={`dot-${yearIndex}-${monthIndex}`}>
                          <TooltipTrigger asChild>
                            <div
                              className="rounded-full"
                              style={{
                                width: '14px',
                                height: '14px',
                                border: '3px solid #dc2626',
                                backgroundColor: 'black',
                              }}
                              data-testid="marker-current-month"
                            />
                          </TooltipTrigger>
                          <TooltipContent side="top" className="text-xs">
                            <p className="font-medium">You are here</p>
                            <p className="text-muted-foreground">Age {yearIndex}, Month {monthIndex + 1}</p>
                          </TooltipContent>
                        </Tooltip>
                      );
                    }

                    return (
                      <div
                        key={`dot-${yearIndex}-${monthIndex}`}
                        className="rounded-full"
                        style={{
                          width: '10px',
                          height: '10px',
                          backgroundColor: isLived ? dotColor : 'transparent',
                          border: isLived ? 'none' : '1.5px solid #a1a1aa',
                        }}
                        data-testid={`dot-${yearIndex}-${monthIndex}`}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
            </div>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-muted-foreground space-y-1">
          <p>1 row = 1 year · 12 dots = 12 months</p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <span className="flex items-center gap-1.5">
              <span className="inline-flex gap-0.5">
                <span className="inline-block w-[10px] h-[10px] rounded-full" style={{ backgroundColor: 'hsl(0, 0%, 75%)' }} />
                <span className="inline-block w-[10px] h-[10px] rounded-full" style={{ backgroundColor: 'hsl(0, 0%, 37%)' }} />
                <span className="inline-block w-[10px] h-[10px] rounded-full" style={{ backgroundColor: 'hsl(0, 0%, 0%)' }} />
              </span>
              <span className="text-xs">Lived</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-[10px] h-[10px] rounded-full border-[1.5px] border-zinc-400" />
              <span className="text-xs">Remaining</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-[14px] h-[14px] rounded-full" style={{ border: '3px solid #dc2626', backgroundColor: 'black' }} />
              <span className="text-xs">Now</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5" style={{ color: '#dc2626', fill: '#dc2626' }} />
              <span className="text-xs">Event</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

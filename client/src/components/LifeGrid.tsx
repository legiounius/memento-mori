import { useMemo } from 'react';
import { differenceInWeeks } from 'date-fns';
import { motion } from 'framer-motion';

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
    return Math.max(0, differenceInWeeks(today, birthdate));
  }, [birthdate]);

  // Generate chunks for rendering to avoid blocking main thread if we were animating individually
  // But for 4160 dots, standard React render is usually fine if optimized.
  // We will use simple array mapping.

  return (
    <div className="w-full max-w-[900px] mx-auto p-4 md:p-8">
      <div className="flex justify-between items-end mb-6 font-mono text-xs text-muted-foreground uppercase tracking-widest border-b border-border pb-2">
        <span>Birth</span>
        <span>{birthdate ? `${weeksLived.toLocaleString()} Weeks Lived` : "Select your birthdate"}</span>
        <span>Age 80</span>
      </div>

      <div 
        className="grid gap-[3px] md:gap-1"
        style={{
          gridTemplateColumns: `repeat(${WEEKS_PER_YEAR}, minmax(0, 1fr))`
        }}
      >
        {Array.from({ length: TOTAL_WEEKS }).map((_, index) => {
          const isLived = index < weeksLived;
          
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.0001, duration: 0.2 }}
              className={`
                aspect-square rounded-full w-full
                transition-colors duration-500
                ${isLived 
                  ? 'bg-red-600 shadow-[0_0_2px_rgba(220,38,38,0.4)]' 
                  : 'bg-zinc-200 dark:bg-zinc-800'
                }
              `}
              title={`Year ${Math.floor(index / 52) + 1}, Week ${index % 52 + 1}`}
            />
          );
        })}
      </div>

      <div className="mt-8 text-center font-mono text-xs text-muted-foreground">
        <p>1 row = 1 year • 1 dot = 1 week</p>
      </div>
    </div>
  );
}

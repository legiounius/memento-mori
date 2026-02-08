import { useState, useEffect } from "react";
import { LifeGrid } from "@/components/LifeGrid";
import { DatePicker } from "@/components/DatePicker";
import { motion } from "framer-motion";
import skullImage from "@assets/Screenshot_2026-02-08_at_4.43.31_PM_1770587042191.png";

const STORAGE_KEY = "memento-birthdate";

export default function Home() {
  const [birthdate, setBirthdate] = useState<Date | undefined>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = new Date(saved);
      if (!isNaN(parsed.getTime())) return parsed;
    }
    return undefined;
  });

  useEffect(() => {
    if (birthdate) {
      localStorage.setItem(STORAGE_KEY, birthdate.toISOString());
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [birthdate]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center">
      <header className="w-full max-w-4xl mx-auto pt-4 pb-3 px-6 text-center flex flex-col items-center space-y-2">
        
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
           <img src={skullImage} alt="Memento Mori" className="w-12 h-12 object-contain" />
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="space-y-0.5"
        >
          <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground tracking-tight">
            Memento Your Mori
          </h1>
          <p className="text-muted-foreground font-mono text-xs tracking-widest uppercase">
            Remember You Must Die
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="w-full flex justify-center pt-2"
        >
          <div className="flex flex-col items-center gap-1.5 w-full max-w-sm">
            <DatePicker date={birthdate} setDate={setBirthdate} />
            <p className="text-[10px] text-muted-foreground text-center">
              Enter your birthdate to visualize your life in weeks.
            </p>
          </div>
        </motion.div>
      </header>

      <motion.main
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="w-full flex-1 pb-20 px-4"
      >
        <LifeGrid birthdate={birthdate} />
      </motion.main>
    </div>
  );
}

import { useState } from "react";
import { LifeGrid } from "@/components/LifeGrid";
import { DatePicker } from "@/components/DatePicker";
import { motion } from "framer-motion";

export default function Home() {
  const [birthdate, setBirthdate] = useState<Date | undefined>(undefined);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center">
      {/* Header Section */}
      <header className="w-full max-w-4xl mx-auto pt-12 pb-8 px-6 text-center flex flex-col items-center space-y-6">
        
        {/* Skull Icon/Image */}
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative group"
        >
           <img src="/images/skull.jpg" alt="Memento Mori" className="w-24 h-24 object-contain rounded-full" />
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="space-y-2"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-primary tracking-tight">
            Memento Your Mori
          </h1>
          <p className="text-muted-foreground font-mono text-sm md:text-base tracking-widest uppercase">
            Remember You Must Die
          </p>
        </motion.div>

        {/* Input Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="w-full flex justify-center pt-6"
        >
          <div className="flex flex-col items-center gap-4 w-full max-w-sm">
            <DatePicker date={birthdate} setDate={setBirthdate} />
            <p className="text-xs text-muted-foreground text-center max-w-[300px]">
              Enter your birthdate to visualize your life in weeks. 
              <br/>Each row represents one year.
            </p>
          </div>
        </motion.div>
      </header>

      {/* Main Grid Visualization - Always visible */}
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

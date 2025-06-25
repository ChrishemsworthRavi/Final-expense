'use client';

import { motion } from 'framer-motion';
import { Loader2, Brain } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function InsightsLoader() {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      className="flex flex-col items-center justify-center p-6 border rounded-2xl shadow-md bg-muted/40 animate-pulse"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <Brain className="h-10 w-10 text-primary animate-spin" />
      <h2 className="text-lg font-semibold mt-4 text-center">
        AI is analyzing your expenses{dots}
      </h2>
      <p className="text-muted-foreground text-sm text-center mt-2">
        Smart insights are on the way — just a second...
      </p>
    </motion.div>
  );
}

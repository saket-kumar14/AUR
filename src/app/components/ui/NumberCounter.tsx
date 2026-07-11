import React, { useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

interface NumberCounterProps {
  value: number;
  duration?: number;
  className?: string;
}

export default function NumberCounter({ value, duration = 2, className = '' }: NumberCounterProps) {
  const [isInView, setIsInView] = useState(false);
  const springValue = useSpring(0, { duration: duration * 1000 });
  
  useEffect(() => {
    // Basic intersection observer simulation for now or just start immediately
    setIsInView(true);
    if (isInView) {
      springValue.set(value);
    }
  }, [isInView, value, springValue]);

  const display = useTransform(springValue, (current) => Math.round(current));

  return <motion.span className={className}>{display}</motion.span>;
}

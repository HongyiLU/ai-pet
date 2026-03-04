import { useState, useEffect, useCallback } from 'react';

export type PetState = 'idle' | 'happy' | 'eat' | 'sleep';

interface PetStats {
  hunger: number;  // 0-100, 越低越饿
  mood: number;    // 0-100
  energy: number;  // 0-100
}

export function usePetState() {
  const [state, setState] = useState<PetState>('idle');
  const [stats, setStats] = useState<PetStats>({
    hunger: 80,
    mood: 70,
    energy: 90
  });

  // 状态计时器
  useEffect(() => {
    if (state === 'happy' || state === 'eat') {
      const timer = setTimeout(() => {
        setState('idle');
      }, state === 'happy' ? 3000 : 2000);
      return () => clearTimeout(timer);
    }
  }, [state]);

  // 自然衰减（每3秒）
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        hunger: Math.max(0, prev.hunger - (state === 'sleep' ? 1 : 2)),
        mood: Math.max(0, prev.mood - 1),
        energy: state === 'sleep' 
          ? Math.min(100, prev.energy + 5)
          : Math.max(0, prev.energy - 1)
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, [state]);

  // 自动进入睡眠
  useEffect(() => {
    if (stats.energy <= 10 && state !== 'sleep') {
      setState('sleep');
    }
  }, [stats.energy, state]);

  const pet = useCallback(() => {
    if (state === 'sleep') return;
    setState('happy');
    setStats(prev => ({ ...prev, mood: Math.min(100, prev.mood + 10) }));
  }, [state]);

  const feed = useCallback(() => {
    if (state === 'sleep') return;
    setState('eat');
    setStats(prev => ({ ...prev, hunger: Math.min(100, prev.hunger + 30) }));
  }, [state]);

  const sleep = useCallback(() => {
    setState('sleep');
  }, []);

  const wakeUp = useCallback(() => {
    if (state === 'sleep') {
      setState('idle');
    }
  }, [state]);

  return {
    state,
    stats,
    pet,
    feed,
    sleep,
    wakeUp
  };
}

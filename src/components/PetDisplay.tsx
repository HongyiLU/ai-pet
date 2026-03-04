import { useState, useEffect } from 'react';
import styles from './PetDisplay.module.css';

interface PetDisplayProps {
  state: 'idle' | 'happy' | 'eat' | 'sleep';
  onClick: () => void;
}

const stateImages: Record<string, string> = {
  idle: '/assets/pet_idle.png',
  happy: '/assets/pet_happy.png',
  eat: '/assets/pet_eat.png',
  sleep: '/assets/pet_sleep.png'
};

export function PetDisplay({ state, onClick }: PetDisplayProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [bounce, setBounce] = useState(false);

  // Idle 动画 - 轻微浮动
  useEffect(() => {
    if (state !== 'sleep') {
      const interval = setInterval(() => {
        setBounce(prev => !prev);
      }, 1500);
      return () => clearInterval(interval);
    }
  }, [state]);

  const handleClick = () => {
    if (state === 'sleep') {
      onClick(); // 唤醒
      return;
    }
    setIsAnimating(true);
    onClick(); // 摸摸头
    setTimeout(() => setIsAnimating(false), 300);
  };

  const getMainImage = () => {
    return '/assets/pet_main.png';
  };

  const getStateImage = () => {
    return stateImages[state] || stateImages.idle;
  };

  return (
    <div className={styles.container}>
      {/* 主形象 */}
      <div 
        className={`${styles.petWrapper} ${bounce ? styles.bounce : ''} ${isAnimating ? styles.petAnimation : ''}`}
        onClick={handleClick}
      >
        <img 
          src={getMainImage()} 
          alt="深渊幼嗣" 
          className={styles.mainImage}
        />
        
        {/* 状态表情叠加 */}
        <img 
          src={getStateImage()} 
          alt={state} 
          className={styles.stateImage}
        />
      </div>

      {/* 点击提示 */}
      {state !== 'sleep' && (
        <p className={styles.hint}>👆 点击摸摸头</p>
      )}
      
      {/* 当前状态标签 */}
      <div className={styles.stateBadge}>
        {state === 'idle' && '😶 发呆中'}
        {state === 'happy' && '😊 好开心！'}
        {state === 'eat' && '😋 好吃~'}
        {state === 'sleep' && '💤 睡觉中...'}
      </div>
    </div>
  );
}

import { useEffect, useRef } from 'react';
import { PetRenderer } from '../canvas/PetRenderer';
import styles from './PetCanvas.module.css';

interface PetCanvasProps {
  mood?: 'happy' | 'normal' | 'sad' | 'sleeping';
}

export function PetCanvas({ mood = 'happy' }: PetCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<PetRenderer | null>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // 设置画布大小
    canvas.width = 400;
    canvas.height = 400;

    // 初始化渲染器
    rendererRef.current = new PetRenderer(canvas);
    
    // 动画循环
    let frame = 0;
    const animate = () => {
      frame++;
      rendererRef.current?.render({
        x: 200,
        y: 200,
        scale: 1 + Math.sin(frame * 0.05) * 0.05,
        mood,
        frame
      });
      animationRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [mood]);

  return (
    <div className={styles.container}>
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        aria-label="AI宠物画布"
      />
      <p className={styles.hint}>🐾 你的 AI 宠物即将在这里诞生！</p>
    </div>
  );
}

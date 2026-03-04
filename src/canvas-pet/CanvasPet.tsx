import { useEffect, useRef, useCallback } from 'react';
import styles from './CanvasPet.module.css';

export type PetAnimationState = 'idle' | 'happy' | 'eat' | 'sleep';

interface CanvasPetProps {
  state: PetAnimationState;
  onClick: () => void;
}

// 图片资源路径
const ASSETS = {
  body: '/assets/spine/pet_body.png',
  tentacle1: '/assets/spine/pet_tentacle_01.png',
  tentacle2: '/assets/spine/pet_tentacle_02.png',
  tentacle3: '/assets/spine/pet_tentacle_03.png',
  tentacle4: '/assets/spine/pet_tentacle_04.png',
  eye: '/assets/spine/pet_eye.png',
  mouthClosed: '/assets/spine/pet_mouth_closed.png',
  mouthOpen: '/assets/spine/pet_mouth_open.png',
  glow: '/assets/spine/pet_glow.png'
};

export function CanvasPet({ state, onClick }: CanvasPetProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<Map<string, HTMLImageElement>>(new Map());
  const mouseRef = useRef({ x: 0, y: 0 });
  const frameRef = useRef(0);
  const animationRef = useRef<number>();

  // 加载图片
  useEffect(() => {
    const loadImages = async () => {
      const entries = Object.entries(ASSETS);
      for (const [key, src] of entries) {
        const img = new Image();
        img.src = src;
        await new Promise((resolve) => {
          img.onload = resolve;
        });
        imagesRef.current.set(key, img);
      }
    };
    loadImages();
  }, []);

  // 鼠标追踪
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    mouseRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }, []);

  // 绘制函数
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const images = imagesRef.current;
    if (images.size < 9) return; // 等待所有图片加载

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const frame = frameRef.current++;
    const time = frame * 0.05;

    // 根据状态计算变换
    let bodyY = centerY;
    let bodyScale = 1;
    let bodyRotation = 0;
    let glowAlpha = 1;
    let showOpenMouth = false;

    switch (state) {
      case 'idle':
        bodyY += Math.sin(time) * 5; // 呼吸起伏
        break;
      case 'happy':
        bodyY += Math.abs(Math.sin(time * 2)) * -20; // 跳跃
        bodyScale = 1 + Math.sin(time * 2) * 0.1;
        break;
      case 'eat':
        showOpenMouth = true;
        bodyScale = 1 + Math.sin(time * 4) * 0.05; // 咀嚼
        break;
      case 'sleep':
        bodyRotation = Math.sin(time * 0.5) * 0.1; // 轻微摇晃
        glowAlpha = 0.5 + Math.sin(time) * 0.2; // 发光变暗
        break;
    }

    // 保存上下文
    ctx.save();
    ctx.translate(centerX, bodyY);
    ctx.rotate(bodyRotation);
    ctx.scale(bodyScale, bodyScale);

    // 绘制发光效果（最底层）
    const glow = images.get('glow');
    if (glow && state === 'sleep') {
      ctx.globalAlpha = glowAlpha;
      ctx.drawImage(glow, -glow.width / 2, -glow.height / 2);
      ctx.globalAlpha = 1;
    }

    // 绘制触手（在主体下方）
    const tentacles = [
      { img: images.get('tentacle1'), offsetX: -60, offsetY: 40, phase: 0 },
      { img: images.get('tentacle2'), offsetX: 60, offsetY: 40, phase: Math.PI / 2 },
      { img: images.get('tentacle3'), offsetX: -40, offsetY: 50, phase: Math.PI },
      { img: images.get('tentacle4'), offsetX: 40, offsetY: 50, phase: Math.PI * 1.5 }
    ];

    tentacles.forEach(({ img, offsetX, offsetY, phase }) => {
      if (!img) return;
      ctx.save();
      ctx.translate(offsetX, offsetY);
      
      // 触手摆动动画
      let rotation = Math.sin(time + phase) * 0.15;
      if (state === 'happy') {
        rotation = Math.sin(time * 3 + phase) * 0.4; // 欢舞
      } else if (state === 'sleep') {
        rotation = Math.sin(time * 0.5 + phase) * 0.05; // 缓慢摆动
      }
      
      ctx.rotate(rotation);
      ctx.drawImage(img, -img.width / 2, 0);
      ctx.restore();
    });

    // 绘制主体
    const body = images.get('body');
    if (body) {
      ctx.drawImage(body, -body.width / 2, -body.height / 2);
    }

    // 绘制眼睛（跟随鼠标）
    const eye = images.get('eye');
    if (eye && state !== 'sleep') {
      const eyeOffsetX = 0;
      const eyeOffsetY = -10;
      
      // 计算眼睛看向鼠标的角度
      const dx = mouseRef.current.x - centerX;
      const dy = mouseRef.current.y - bodyY;
      const angle = Math.atan2(dy, dx);
      const distance = Math.min(5, Math.sqrt(dx * dx + dy * dy) / 20);
      
      const pupilX = Math.cos(angle) * distance;
      const pupilY = Math.sin(angle) * distance;
      
      ctx.drawImage(eye, eyeOffsetX - eye.width / 2 + pupilX, eyeOffsetY - eye.height / 2 + pupilY);
    }

    // 绘制嘴巴
    const mouth = showOpenMouth ? images.get('mouthOpen') : images.get('mouthClosed');
    if (mouth) {
      ctx.drawImage(mouth, -mouth.width / 2, 20);
    }

    ctx.restore();

    animationRef.current = requestAnimationFrame(draw);
  }, [state]);

  // 启动动画循环
  useEffect(() => {
    animationRef.current = requestAnimationFrame(draw);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [draw]);

  return (
    <div className={styles.container}>
      <canvas
        ref={canvasRef}
        width={400}
        height={400}
        className={styles.canvas}
        onClick={onClick}
        onMouseMove={handleMouseMove}
      />
      <p className={styles.hint}>
        {state === 'sleep' ? '💤 点击唤醒' : '👆 点击互动'}
      </p>
    </div>
  );
}

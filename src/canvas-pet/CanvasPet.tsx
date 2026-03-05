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

  // 绘制魔法阵（底层）
  const drawMagicCircle = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number, time: number) => {
    ctx.save();
    ctx.translate(centerX, centerY);
    
    // 外圈旋转
    ctx.save();
    ctx.rotate(time * 0.02);
    ctx.globalAlpha = 0.35;
    ctx.strokeStyle = '#8b00ff';
    ctx.lineWidth = 2;
    
    // 外圈符文环
    ctx.beginPath();
    ctx.arc(0, 0, 180, 0, Math.PI * 2);
    ctx.stroke();
    
    // 外圈符文
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const x = Math.cos(angle) * 180;
      const y = Math.sin(angle) * 180;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle + Math.PI / 2);
      ctx.fillStyle = `rgba(139, 0, 255, ${0.4 + Math.sin(time * 2 + i) * 0.2})`;
      ctx.font = '16px serif';
      ctx.textAlign = 'center';
      ctx.fillText('◈', 0, 0);
      ctx.restore();
    }
    ctx.restore();
    
    // 中圈反向旋转
    ctx.save();
    ctx.rotate(-time * 0.015);
    ctx.globalAlpha = 0.3;
    ctx.strokeStyle = '#9400d3';
    ctx.lineWidth = 1.5;
    
    // 六芒星
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const x = Math.cos(angle) * 120;
      const y = Math.sin(angle) * 120;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
    
    // 内圈
    ctx.beginPath();
    ctx.arc(0, 0, 80, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
    
    // 内圈脉动
    const pulseScale = 1 + Math.sin(time * 3) * 0.05;
    ctx.save();
    ctx.scale(pulseScale, pulseScale);
    ctx.globalAlpha = 0.25;
    ctx.strokeStyle = '#ba55d3';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, 0, 60, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
    
    ctx.restore();
  };

  // 绘制雾气效果
  const drawMist = (ctx: CanvasRenderingContext2D, width: number, height: number, time: number) => {
    ctx.save();
    ctx.globalAlpha = 0.15;
    
    // 多层雾气
    for (let i = 0; i < 3; i++) {
      const x = Math.sin(time * 0.5 + i) * 50;
      const y = Math.cos(time * 0.3 + i) * 30;
      
      const gradient = ctx.createRadialGradient(
        width / 2 + x, height / 2 + y, 0,
        width / 2 + x, height / 2 + y, 200
      );
      gradient.addColorStop(0, 'rgba(138, 43, 226, 0.3)');
      gradient.addColorStop(0.5, 'rgba(75, 0, 130, 0.1)');
      gradient.addColorStop(1, 'transparent');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
    }
    
    ctx.restore();
  };

  // 主绘制函数
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const images = imagesRef.current;
    if (images.size < 9) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const frame = frameRef.current++;
    const time = frame * 0.05;

    // ========== 第1层：魔法阵（最底层）==========
    drawMagicCircle(ctx, centerX, centerY, time);
    
    // ========== 第2层：雾气 ==========
    drawMist(ctx, canvas.width, canvas.height, time);

    // 根据状态计算宠物变换
    let bodyY = centerY;
    let bodyScale = 1;
    let bodyRotation = 0;
    let glowAlpha = 1;
    let showOpenMouth = false;

    switch (state) {
      case 'idle':
        bodyY += Math.sin(time) * 5;
        break;
      case 'happy':
        bodyY += Math.abs(Math.sin(time * 2)) * -20;
        bodyScale = 1 + Math.sin(time * 2) * 0.1;
        break;
      case 'eat':
        showOpenMouth = true;
        bodyScale = 1 + Math.sin(time * 4) * 0.05;
        break;
      case 'sleep':
        bodyRotation = Math.sin(time * 0.5) * 0.1;
        glowAlpha = 0.5 + Math.sin(time) * 0.2;
        break;
    }

    // ========== 第3层：宠物（最上层）==========
    ctx.save();
    ctx.translate(centerX, bodyY);
    ctx.rotate(bodyRotation);
    ctx.scale(bodyScale, bodyScale);

    // 发光效果
    const glow = images.get('glow');
    if (glow && state === 'sleep') {
      ctx.globalAlpha = glowAlpha;
      ctx.drawImage(glow, -glow.width / 2, -glow.height / 2);
      ctx.globalAlpha = 1;
    }

    // 触手
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
      
      let rotation = Math.sin(time + phase) * 0.15;
      if (state === 'happy') {
        rotation = Math.sin(time * 3 + phase) * 0.4;
      } else if (state === 'sleep') {
        rotation = Math.sin(time * 0.5 + phase) * 0.05;
      }
      
      ctx.rotate(rotation);
      ctx.drawImage(img, -img.width / 2, 0);
      ctx.restore();
    });

    // 主体
    const body = images.get('body');
    if (body) {
      ctx.drawImage(body, -body.width / 2, -body.height / 2);
    }

    // 眼睛（跟随鼠标）
    const eye = images.get('eye');
    if (eye && state !== 'sleep') {
      const dx = mouseRef.current.x - centerX;
      const dy = mouseRef.current.y - bodyY;
      const angle = Math.atan2(dy, dx);
      const distance = Math.min(5, Math.sqrt(dx * dx + dy * dy) / 20);
      
      const pupilX = Math.cos(angle) * distance;
      const pupilY = Math.sin(angle) * distance;
      
      ctx.drawImage(eye, -eye.width / 2 + pupilX, -10 - eye.height / 2 + pupilY);
    }

    // 嘴巴
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

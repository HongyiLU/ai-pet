import { useEffect, useRef, useCallback } from 'react';
import styles from './CanvasPet.module.css';

export type PetAnimationState = 'idle' | 'happy' | 'eat' | 'sleep';

interface CanvasPetProps {
  state: PetAnimationState;
  onClick: () => void;
}

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

// 星星类型
interface Star {
  x: number;
  y: number;
  size: number;
  alpha: number;
  twinkleSpeed: number;
  baseAlpha: number;
}

// 流星类型
interface Meteor {
  x: number;
  y: number;
  length: number;
  speed: number;
  angle: number;
  alpha: number;
  active: boolean;
}

// 迷雾类型
interface Mist {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  speedX: number;
  speedY: number;
}

export function CanvasPet({ state, onClick }: CanvasPetProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<Map<string, HTMLImageElement>>(new Map());
  const mouseRef = useRef({ x: 0, y: 0 });
  const frameRef = useRef(0);
  const animationRef = useRef<number>();
  
  // 背景元素
  const starsRef = useRef<Star[]>([]);
  const meteorsRef = useRef<Meteor[]>([]);
  const mistRef = useRef<Mist[]>([]);
  const initializedRef = useRef(false);

  // 初始化背景元素
  const initBackground = useCallback((width: number, height: number) => {
    if (initializedRef.current) return;
    
    // 生成星星
    starsRef.current = Array.from({ length: 100 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2 + 0.5,
      baseAlpha: Math.random() * 0.5 + 0.3,
      alpha: Math.random(),
      twinkleSpeed: Math.random() * 0.05 + 0.02
    }));
    
    // 初始化流星池
    meteorsRef.current = Array.from({ length: 3 }, () => ({
      x: -100,
      y: -100,
      length: Math.random() * 80 + 40,
      speed: Math.random() * 8 + 4,
      angle: Math.PI / 4,
      alpha: 0,
      active: false
    }));
    
    // 生成迷雾
    mistRef.current = Array.from({ length: 5 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 100 + 50,
      alpha: Math.random() * 0.15 + 0.05,
      speedX: (Math.random() - 0.5) * 0.3,
      speedY: (Math.random() - 0.5) * 0.2
    }));
    
    initializedRef.current = true;
  }, []);

  // 加载图片
  useEffect(() => {
    const loadImages = async () => {
      for (const [key, src] of Object.entries(ASSETS)) {
        const img = new Image();
        img.src = src;
        await new Promise((resolve) => { img.onload = resolve; });
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

  // 绘制深渊星空背景
  const drawStarfield = (ctx: CanvasRenderingContext2D, width: number, height: number, time: number) => {
    // 深紫/墨绿渐变底色
    const gradient = ctx.createRadialGradient(
      width / 2, height / 2, 0,
      width / 2, height / 2, width
    );
    gradient.addColorStop(0, '#1a0f2e');
    gradient.addColorStop(0.5, '#0d1f17');
    gradient.addColorStop(1, '#0a0a12');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // 绘制星星
    starsRef.current.forEach(star => {
      star.alpha = star.baseAlpha + Math.sin(time * star.twinkleSpeed) * 0.3;
      ctx.globalAlpha = Math.max(0, Math.min(1, star.alpha));
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();
      
      // 星光十字效果
      if (star.size > 1.5) {
        ctx.strokeStyle = `rgba(255, 255, 255, ${ctx.globalAlpha * 0.5})`;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(star.x - star.size * 2, star.y);
        ctx.lineTo(star.x + star.size * 2, star.y);
        ctx.moveTo(star.x, star.y - star.size * 2);
        ctx.lineTo(star.x, star.y + star.size * 2);
        ctx.stroke();
      }
    });
    ctx.globalAlpha = 1;
  };

  // 绘制流星
  const drawMeteors = (ctx: CanvasRenderingContext2D, width: number, height: number, _time: number) => {
    // 随机触发流星
    if (Math.random() < 0.005) {
      const inactiveMeteor = meteorsRef.current.find(m => !m.active);
      if (inactiveMeteor) {
        inactiveMeteor.active = true;
        inactiveMeteor.x = Math.random() * width * 0.5;
        inactiveMeteor.y = -50;
        inactiveMeteor.alpha = 1;
      }
    }
    
    meteorsRef.current.forEach(meteor => {
      if (!meteor.active) return;
      
      // 更新位置
      meteor.x += Math.cos(meteor.angle) * meteor.speed;
      meteor.y += Math.sin(meteor.angle) * meteor.speed;
      meteor.alpha -= 0.01;
      
      // 绘制流星尾迹
      const tailX = meteor.x - Math.cos(meteor.angle) * meteor.length;
      const tailY = meteor.y - Math.sin(meteor.angle) * meteor.length;
      
      const gradient = ctx.createLinearGradient(meteor.x, meteor.y, tailX, tailY);
      gradient.addColorStop(0, `rgba(255, 255, 255, ${meteor.alpha})`);
      gradient.addColorStop(0.5, `rgba(147, 112, 219, ${meteor.alpha * 0.5})`);
      gradient.addColorStop(1, 'transparent');
      
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(meteor.x, meteor.y);
      ctx.lineTo(tailX, tailY);
      ctx.stroke();
      
      // 流星头部光点
      ctx.fillStyle = `rgba(255, 255, 255, ${meteor.alpha})`;
      ctx.beginPath();
      ctx.arc(meteor.x, meteor.y, 2, 0, Math.PI * 2);
      ctx.fill();
      
      // 重置流星
      if (meteor.alpha <= 0 || meteor.x > width + 100 || meteor.y > height + 100) {
        meteor.active = false;
      }
    });
  };

  // 绘制迷雾
  const drawMist = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    mistRef.current.forEach(mist => {
      // 更新位置
      mist.x += mist.speedX;
      mist.y += mist.speedY;
      
      // 边界循环
      if (mist.x < -mist.radius) mist.x = width + mist.radius;
      if (mist.x > width + mist.radius) mist.x = -mist.radius;
      if (mist.y < -mist.radius) mist.y = height + mist.radius;
      if (mist.y > height + mist.radius) mist.y = -mist.radius;
      
      // 绘制迷雾团
      const gradient = ctx.createRadialGradient(
        mist.x, mist.y, 0,
        mist.x, mist.y, mist.radius
      );
      gradient.addColorStop(0, `rgba(138, 43, 226, ${mist.alpha})`);
      gradient.addColorStop(0.5, `rgba(75, 0, 130, ${mist.alpha * 0.5})`);
      gradient.addColorStop(1, 'transparent');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(mist.x, mist.y, mist.radius, 0, Math.PI * 2);
      ctx.fill();
    });
  };

  // 主绘制函数
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const images = imagesRef.current;
    
    // 初始化背景
    initBackground(width, height);
    
    const frame = frameRef.current++;
    const time = frame * 0.05;

    // ========== 第1层：深渊星空背景 ==========
    drawStarfield(ctx, width, height, time);
    
    // ========== 第2层：流星 ==========
    drawMeteors(ctx, width, height, time);
    
    // ========== 第3层：迷雾 ==========
    drawMist(ctx, width, height);

    if (images.size < 9) {
      animationRef.current = requestAnimationFrame(draw);
      return;
    }

    const centerX = width / 2;
    const centerY = height / 2;

    // 宠物状态计算
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

    // ========== 第4层：宠物 ==========
    ctx.save();
    ctx.translate(centerX, bodyY);
    ctx.rotate(bodyRotation);
    ctx.scale(bodyScale, bodyScale);

    // 发光
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
      if (state === 'happy') rotation = Math.sin(time * 3 + phase) * 0.4;
      else if (state === 'sleep') rotation = Math.sin(time * 0.5 + phase) * 0.05;
      ctx.rotate(rotation);
      ctx.drawImage(img, -img.width / 2, 0);
      ctx.restore();
    });

    // 主体
    const body = images.get('body');
    if (body) ctx.drawImage(body, -body.width / 2, -body.height / 2);

    // 眼睛
    const eye = images.get('eye');
    if (eye && state !== 'sleep') {
      const dx = mouseRef.current.x - centerX;
      const dy = mouseRef.current.y - bodyY;
      const angle = Math.atan2(dy, dx);
      const distance = Math.min(5, Math.sqrt(dx * dx + dy * dy) / 20);
      ctx.drawImage(eye, -eye.width / 2 + Math.cos(angle) * distance, -10 - eye.height / 2 + Math.sin(angle) * distance);
    }

    // 嘴巴
    const mouth = showOpenMouth ? images.get('mouthOpen') : images.get('mouthClosed');
    if (mouth) ctx.drawImage(mouth, -mouth.width / 2, 20);

    ctx.restore();

    animationRef.current = requestAnimationFrame(draw);
  }, [state, initBackground]);

  // 启动动画
  useEffect(() => {
    animationRef.current = requestAnimationFrame(draw);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
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

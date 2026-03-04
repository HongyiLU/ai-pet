/**
 * PetRenderer - 宠物画布渲染器
 * 负责在 Canvas 上绘制虚拟宠物
 */

export interface PetState {
  x: number;
  y: number;
  scale: number;
  mood: 'happy' | 'normal' | 'sad' | 'sleeping';
  frame: number;
}

export class PetRenderer {
  private ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;
  private animationId: number | null = null;
  private state: PetState;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get canvas context');
    this.ctx = ctx;
    
    // 初始化状态
    this.state = {
      x: canvas.width / 2,
      y: canvas.height / 2 + 50,
      scale: 1,
      mood: 'happy',
      frame: 0
    };
  }

  /**
   * 启动动画循环
   */
  start(): void {
    const loop = () => {
      this.state.frame++;
      // 简单的呼吸动画
      this.state.scale = 1 + Math.sin(this.state.frame * 0.05) * 0.05;
      this.render(this.state);
      this.animationId = requestAnimationFrame(loop);
    };
    loop();
  }

  /**
   * 停止动画循环
   */
  stop(): void {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  /**
   * 更新宠物心情
   */
  setMood(mood: PetState['mood']): void {
    this.state.mood = mood;
  }

  /**
   * 清空画布
   */
  clear(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * 绘制背景
   */
  drawBackground(): void {
    // 渐变背景
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#E0F6FF');
    
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // 简单的草地
    this.ctx.fillStyle = '#90EE90';
    this.ctx.fillRect(0, this.canvas.height - 100, this.canvas.width, 100);
  }

  /**
   * 绘制一个简单的圆形宠物（占位符）
   */
  drawPet(state: PetState): void {
    const { x, y, scale, mood } = state;
    const size = 80 * scale;

    this.ctx.save();
    this.ctx.translate(x, y);

    // 身体（圆形）
    this.ctx.beginPath();
    this.ctx.arc(0, 0, size, 0, Math.PI * 2);
    this.ctx.fillStyle = mood === 'happy' ? '#FFD93D' : 
                        mood === 'sad' ? '#A0A0A0' : '#FFB347';
    this.ctx.fill();
    this.ctx.strokeStyle = '#333';
    this.ctx.lineWidth = 3;
    this.ctx.stroke();

    // 眼睛
    const eyeOffset = size * 0.35;
    const eyeSize = size * 0.15;
    
    // 左眼
    this.ctx.beginPath();
    this.ctx.arc(-eyeOffset, -size * 0.2, eyeSize, 0, Math.PI * 2);
    this.ctx.fillStyle = '#333';
    this.ctx.fill();

    // 右眼
    this.ctx.beginPath();
    this.ctx.arc(eyeOffset, -size * 0.2, eyeSize, 0, Math.PI * 2);
    this.ctx.fillStyle = '#333';
    this.ctx.fill();

    // 嘴巴
    this.ctx.beginPath();
    if (mood === 'happy') {
      this.ctx.arc(0, size * 0.1, size * 0.3, 0, Math.PI);
    } else if (mood === 'sad') {
      this.ctx.arc(0, size * 0.3, size * 0.3, Math.PI, 0);
    } else {
      this.ctx.arc(0, size * 0.1, size * 0.2, 0, Math.PI * 2);
    }
    this.ctx.strokeStyle = '#333';
    this.ctx.lineWidth = 3;
    this.ctx.stroke();

    // 腮红（开心时）
    if (mood === 'happy') {
      this.ctx.fillStyle = 'rgba(255, 100, 100, 0.3)';
      this.ctx.beginPath();
      this.ctx.arc(-size * 0.6, 0, size * 0.15, 0, Math.PI * 2);
      this.ctx.arc(size * 0.6, 0, size * 0.15, 0, Math.PI * 2);
      this.ctx.fill();
    }

    this.ctx.restore();
  }

  /**
   * 主渲染循环
   */
  render(state: PetState): void {
    this.clear();
    this.drawBackground();
    this.drawPet(state);
  }
}

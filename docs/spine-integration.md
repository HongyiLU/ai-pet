# Spine 2D 集成技术调研

> 深渊幼嗣动画系统升级方案

## 1. Spine Runtime 选择

### 方案对比

| 特性 | spine-webgl | spine-canvas |
|------|-------------|--------------|
| **渲染性能** | ⭐⭐⭐⭐⭐ (GPU加速) | ⭐⭐⭐ (CPU渲染) |
| **兼容性** | IE11+ / 所有现代浏览器 | IE9+ / 全平台支持 |
| **特效支持** | 完整（网格变形、光照） | 基础（仅骨骼动画） |
| **包体积** | ~150KB (wasm + js) | ~80KB (纯js) |
| **内存占用** | 较高（显存+内存） | 较低 |

### 🎯 推荐方案：**spine-webgl**

**原因：**
1. **性能需求**：宠物需要实时骨骼动画 + 触手物理摆动，WebGL 能流畅处理多骨骼 IK
2. **视觉效果**：需要网格变形（Mesh Deformation）实现触手的有机运动
3. **未来扩展**：支持后期特效（发光、扭曲）用于"疯狂"状态
4. **设备覆盖**：目标用户为现代浏览器用户，IE 不在支持范围

---

## 2. React 集成方式

### 方案 A：使用现有库 `react-spine`

```bash
npm install @esotericsoftware/spine-player-react
# 或
npm install spine-react
```

**优点：**
- 开箱即用
- 自动处理 Canvas 生命周期

**缺点：**
- 社区维护不稳定
- 版本滞后于官方 Runtime
- 定制性受限

### 方案 B：自行封装（推荐）

基于 `@esotericsoftware/spine-webgl` 封装 React Hook。

**核心架构：**

```typescript
// hooks/useSpine.ts
export function useSpine(canvasRef: RefObject<HTMLCanvasElement>) {
  const [state, setState] = useState<SpineState>('idle');
  const animationRef = useRef<AnimationState>();
  
  useEffect(() => {
    // 初始化 WebGL 上下文
    const gl = canvasRef.current?.getContext('webgl2');
    const renderer = new SpineWebGLRenderer(gl);
    
    // 加载骨骼数据
    const assetManager = new AssetManager();
    assetManager.loadBinary('/assets/spine/pet-pro.json');
    assetManager.loadTextureAtlas('/assets/spine/pet.atlas');
    
    return () => {
      renderer.dispose();
    };
  }, []);
  
  // 状态机驱动动画
  useEffect(() => {
    switch(state) {
      case 'happy': 
        animationRef.current?.setAnimation(0, 'jump', false);
        animationRef.current?.addAnimation(0, 'happy_loop', true);
        break;
      // ...
    }
  }, [state]);
  
  return { setState };
}
```

**组件封装：**

```tsx
// components/SpinePet.tsx
export function SpinePet({ state, onClick }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { setState } = useSpine(canvasRef);
  
  useEffect(() => setState(state), [state]);
  
  return (
    <canvas 
      ref={canvasRef}
      width={400} 
      height={400}
      onClick={onClick}
    />
  );
}
```

---

## 3. 动画状态机设计

### 状态流转图

```
                    ┌─────────────┐
         ┌─────────│    idle     │◄────────┐
         │         │  (default)  │         │
         │         └──────┬──────┘         │
    sleep/wake           │                │
         │               │ pet/feed       │ anim_end
         ▼               ▼                │
   ┌─────────┐     ┌──────────┐     ┌─────┴─────┐
   │  sleep  │     │  happy   │     │    eat    │
   │(recover)│     │ (3s auto)│     │ (2s auto) │
   └─────────┘     └────┬─────┘     └───────────┘
                        │
                        └────────────────────────► idle
```

### 动画细节规范

#### idle（发呆）
- **呼吸**：胸部 ScaleY 0.95 → 1.05，周期 2s
- **触手摆动**：4根主触手，Sine 曲线摆动，相位差 45°
- **眼睛**：随机眨眼（间隔 3-6s）

#### happy（开心）
- **跳跃**：Y轴位移 -30px → 0，弹性缓动
- **触手欢舞**：振幅加大，频率加快（1.5x）
- **眼睛发光**：瞳孔放大 + 高光闪烁
- **粒子**：飘出 ♥ 符号

#### eat（进食）
- **张嘴**：下颌骨旋转 15°
- **咀嚼**：循环咬合动作，周期 0.4s
- **触手抓取**：前伸 → 收回，模拟抓取食物

#### sleep（睡眠）
- **蜷缩**：整体 Scale 0.9，身体弯曲
- **微光脉动**：全身透明度 0.8 → 1.0，周期 3s
- **Zzz 粒子**：头顶飘出睡眠符号

---

## 4. 性能优化策略

### 纹理图集规范

```
pet.atlas
├── 尺寸：2048x2048 (最大)
├── 格式：PNG-8 (索引色) 或 PVRTC (iOS)
└── 分区：
    ├── 身体主体 (1024x1024)
    ├── 触手 x4 (256x512 each)
    ├── 表情/眼睛 (256x256)
    └── 特效贴图 (512x512)
```

### 运行时优化

| 优化项 | 方案 | 预期收益 |
|--------|------|---------|
| **实例池** | 预创建 3 个 Skeleton 实例 | 减少 GC 停顿 |
| **LOD** | 距离 > 300px 时降低骨骼精度 | 节省 30% CPU |
| **裁剪** | 视口外暂停渲染 | 节省 GPU |
| **纹理压缩** | Basis Universal 格式 | 减少 70% 显存 |

### 内存管理代码示例

```typescript
class SpinePool {
  private pool: Skeleton[] = [];
  private maxSize = 3;
  
  acquire(): Skeleton {
    return this.pool.pop() || this.createSkeleton();
  }
  
  release(skeleton: Skeleton) {
    if (this.pool.length < this.maxSize) {
      skeleton.setToSetupPose();
      this.pool.push(skeleton);
    }
  }
  
  dispose() {
    this.pool.forEach(s => s.dispose());
    this.pool = [];
  }
}
```

---

## 5. 最小可行 Demo

### 项目结构

```
src/
├── spine/
│   ├── SpineCanvas.tsx      # 画布组件
│   ├── useSpine.ts          # Hook
│   ├── AnimationState.ts    # 状态机
│   └── SpinePool.ts         # 对象池
└── assets/
    └── spine/
        ├── pet-pro.json     # 骨骼数据
        ├── pet.atlas        # 图集配置
        └── pet.png          # 纹理
```

### Demo 代码

```tsx
// App.tsx
import { SpinePet } from './spine/SpineCanvas';

function App() {
  const [state, setState] = useState('idle');
  
  return (
    <div className="app">
      <SpinePet state={state} />
      <div className="controls">
        {['idle', 'happy', 'eat', 'sleep'].map(s => (
          <button key={s} onClick={() => setState(s)}>
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
```

---

## 6. 工作量预估

| 阶段 | 任务 | 工时 |
|------|------|------|
| **准备** | Spine 软件安装、素材导出 | 2h |
| **基础** | Runtime 集成、Canvas 封装 | 4h |
| **动画** | 4 状态机动画制作 | 8h |
| **联调** | React 状态同步、事件绑定 | 3h |
| **优化** | 性能调优、内存管理 | 3h |
| **测试** | 多端兼容性测试 | 2h |
| **总计** | | **22h (~3天)** |

---

## 7. 依赖安装

```bash
# 官方 Runtime
npm install @esotericsoftware/spine-webgl

# 类型定义
npm install --save-dev @types/esotericsoftware__spine-webgl

# 纹理压缩工具
npm install --save-dev basisu
```

---

## 8. 参考资源

- [Spine 官方文档](http://zh.esotericsoftware.com/spine-documentation)
- [Spine WebGL Runtime GitHub](https://github.com/EsotericSoftware/spine-runtimes/tree/4.1/spine-ts)
- [React + Canvas 最佳实践](https://react.dev/reference/react/useRef)

---

*调研完成时间：2026-03-04*
*负责人：码仔 🐙*

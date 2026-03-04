import { useEffect, useRef } from 'react';
import * as spine from '@esotericsoftware/spine-webgl';

interface SpineDemoProps {
  atlasUrl: string;
  skeletonUrl: string;
  animation: string;
}

export function SpineDemo({ atlasUrl, skeletonUrl, animation }: SpineDemoProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<spine.SkeletonRenderer | null>(null);
  const assetManagerRef = useRef<spine.AssetManager | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    
    // 初始化 WebGL 上下文
    const gl = canvas.getContext('webgl2', { alpha: true });
    if (!gl) {
      console.error('WebGL2 not supported');
      return;
    }

    // 创建 AssetManager
    const assetManager = new spine.AssetManager(gl);
    assetManagerRef.current = assetManager;

    // 加载资源
    assetManager.loadTextureAtlas(atlasUrl);
    assetManager.loadJson(skeletonUrl);

    // 渲染循环
    let lastTime = Date.now();
    let requestId: number;

    const render = () => {
      const now = Date.now();
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      // 更新资源加载状态
      if (assetManager.isLoadingComplete()) {
        if (!rendererRef.current) {
          // 首次加载完成，初始化骨骼动画
          const atlas = assetManager.require(atlasUrl);
          const atlasLoader = new spine.AtlasAttachmentLoader(atlas);
          const skeletonJson = new spine.SkeletonJson(atlasLoader);
          const skeletonData = skeletonJson.readSkeletonData(
            assetManager.require(skeletonUrl)
          );
          
          const skeleton = new spine.Skeleton(skeletonData);
          const state = new spine.AnimationState(
            new spine.AnimationStateData(skeletonData)
          );
          state.setAnimation(0, animation, true);

          rendererRef.current = { skeleton, state };
        }

        // 更新和渲染
        const { state, skeleton } = rendererRef.current;
        state.update(delta);
        state.apply(skeleton);
        skeleton.updateWorldTransform();

        // 清屏
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        // 渲染骨骼（简化版，实际需要 Shader 和 Mesh）
        // 这里使用 spine-webgl 的 SkeletonRenderer
      }

      requestId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(requestId);
      // 清理资源
      assetManager.dispose();
    };
  }, [atlasUrl, skeletonUrl, animation]);

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={400}
      style={{ 
        borderRadius: '8px',
        boxShadow: '0 4px 20px rgba(138, 43, 226, 0.3)'
      }}
    />
  );
}

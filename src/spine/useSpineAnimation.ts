import { useRef, useCallback } from 'react';

export type SpineAnimationState = 'idle' | 'happy' | 'eat' | 'sleep';

interface AnimationConfig {
  name: string;
  loop: boolean;
  trackIndex?: number;
}

// 动画配置映射
const ANIMATION_MAP: Record<SpineAnimationState, AnimationConfig> = {
  idle: { name: 'breathing', loop: true, trackIndex: 0 },
  happy: { name: 'jump_happy', loop: false, trackIndex: 1 },
  eat: { name: 'eat_chew', loop: false, trackIndex: 1 },
  sleep: { name: 'sleep_curl', loop: true, trackIndex: 0 }
};

// 混合时间配置（毫秒）
const MIX_DURATION = 0.3;

export function useSpineAnimation() {
  const spineRef = useRef<any>(null);
  const currentStateRef = useRef<SpineAnimationState>('idle');

  const setSpineInstance = useCallback((instance: any) => {
    spineRef.current = instance;
    
    // 设置默认混合
    if (instance?.state?.data) {
      instance.state.data.defaultMix = MIX_DURATION;
    }
  }, []);

  const playAnimation = useCallback((state: SpineAnimationState) => {
    if (!spineRef.current) return;
    
    const config = ANIMATION_MAP[state];
    const { state: spineState } = spineRef.current;
    
    if (!spineState) return;

    // 处理状态切换逻辑
    switch (state) {
      case 'idle':
        // 回到基础呼吸动画
        spineState.setAnimation(config.trackIndex!, config.name, config.loop);
        break;
        
      case 'happy':
        // 播放跳跃，完成后回到 idle
        spineState.setAnimation(config.trackIndex!, config.name, config.loop);
        spineState.addListener({
          complete: () => {
            if (currentStateRef.current === 'happy') {
              playAnimation('idle');
            }
          }
        });
        break;
        
      case 'eat':
        // 播放咀嚼，完成后回到 idle
        spineState.setAnimation(config.trackIndex!, config.name, config.loop);
        spineState.addListener({
          complete: () => {
            if (currentStateRef.current === 'eat') {
              playAnimation('idle');
            }
          }
        });
        break;
        
      case 'sleep':
        // 蜷缩睡眠循环
        spineState.setAnimation(config.trackIndex!, config.name, config.loop);
        break;
    }
    
    currentStateRef.current = state;
  }, []);

  const getCurrentState = useCallback(() => {
    return currentStateRef.current;
  }, []);

  return {
    setSpineInstance,
    playAnimation,
    getCurrentState
  };
}

// 宠物状态类型
export interface PetState {
  hunger: number;      // 饥饿度 0-100
  happiness: number;   // 心情 0-100
  energy: number;      // 精力 0-100
  health: number;      // 健康 0-100
}

// 宠物配置
export interface PetConfig {
  name: string;
  color: string;
  size: number;
}

// 聊天消息
export interface ChatMessage {
  id: string;
  role: 'user' | 'pet';
  content: string;
  timestamp: number;
}

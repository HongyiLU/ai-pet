import { useState } from 'react';
import styles from './ChatBox.module.css';

export function ChatBox() {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<string[]>([
    '🐾 你好！我是你的 AI 宠物，很高兴见到你！'
  ]);

  const handleSend = () => {
    if (!message.trim()) return;
    
    setChatHistory(prev => [...prev, `你: ${message}`, '🐾 （AI 回复功能开发中...）']);
    setMessage('');
  };

  return (
    <div className={styles.chatBox}>
      <div className={styles.history}>
        {chatHistory.map((msg, i) => (
          <p key={i} className={styles.message}>{msg}</p>
        ))}
      </div>
      <div className={styles.inputArea}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="和宠物说点什么..."
          className={styles.input}
        />
        <button onClick={handleSend} className={styles.sendBtn}>发送</button>
      </div>
    </div>
  );
}

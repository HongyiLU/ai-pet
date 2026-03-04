import { useState } from 'react'
import { PetCanvas } from './components/PetCanvas'
import { ChatBox } from './components/ChatBox'
import './App.css'

function App() {
  const [petMood, setPetMood] = useState<'happy' | 'normal' | 'sad' | 'sleeping'>('happy')

  return (
    <div className="app">
      <header className="app-header">
        <h1>🤖 AI Pet</h1>
        <p>你的虚拟 AI 宠物伙伴</p>
      </header>
      
      <main className="app-main">
        <div className="pet-container">
          <PetCanvas mood={petMood} />
        </div>
        
        <div className="interaction-panel">
          <ChatBox />
          
          <div className="action-buttons">
            <button onClick={() => setPetMood('happy')}>😊 开心</button>
            <button onClick={() => setPetMood('normal')}>😐 平静</button>
            <button onClick={() => setPetMood('sad')}>😢 难过</button>
            <button onClick={() => setPetMood('sleeping')}>😴 睡觉</button>
          </div>
        </div>
      </main>
      
      <footer className="app-footer">
        <p>Made with ❤️ by 小满团队</p>
      </footer>
    </div>
  )
}

export default App

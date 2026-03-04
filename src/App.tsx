import { usePetState } from './hooks/usePetState'
import { PetDisplay } from './components/PetDisplay'
import { StatBar } from './components/StatBar'
import './App.css'

function App() {
  const { state, stats, pet, feed, sleep, wakeUp } = usePetState()

  return (
    <div className="app">
      <header className="app-header">
        <h1>🐙 深渊幼嗣</h1>
        <p>你的虚拟 AI 宠物伙伴</p>
      </header>
      
      <main className="app-main">
        <PetDisplay 
          state={state} 
          onClick={state === 'sleep' ? wakeUp : pet}
        />
        
        <div className="stats-panel">
          <StatBar label="饱食度" value={stats.hunger} color="red" />
          <StatBar label="心情值" value={stats.mood} color="yellow" />
          <StatBar label="精力值" value={stats.energy} color="blue" />
        </div>
        
        <div className="action-buttons">
          <button 
            onClick={pet} 
            disabled={state === 'sleep'}
            className="btn-pet"
          >
            ✋ 摸摸头
          </button>
          <button 
            onClick={feed} 
            disabled={state === 'sleep'}
            className="btn-feed"
          >
            🍖 喂食
          </button>
          <button 
            onClick={sleep}
            disabled={state === 'sleep'}
            className="btn-sleep"
          >
            😴 睡觉
          </button>
        </div>
        
        {state === 'sleep' && (
          <p className="sleep-hint">💤 点击宠物唤醒它</p>
        )}
      </main>
      
      <footer className="app-footer">
        <p>Made with ❤️ by 小满团队</p>
      </footer>
    </div>
  )
}

export default App

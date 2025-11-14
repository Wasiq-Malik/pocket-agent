import { useEffect, useState } from 'react'
import { checkWebGPUSupport, type WebGPUCheckResult } from './lib/webgpu-check'
import Navbar from './components/Navbar'
import GBAEmulator from './components/GBAEmulator'
import AgentStreamPanel from './components/AgentStreamPanel'
import AgentGoals from './components/AgentGoals'
import GBAController from './components/GBAController'
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card'

function App() {
  const [webGPUStatus, setWebGPUStatus] = useState<WebGPUCheckResult | null>(null)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    checkWebGPUSupport().then((result) => {
      setWebGPUStatus(result)
      setIsChecking(false)
    })
  }, [])

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navbar */}
      <Navbar webGPUStatus={webGPUStatus} isChecking={isChecking} />

              {/* Main Content */}
              <main className="container mx-auto p-4">
        {/* WebGPU Not Supported Warning */}
        {webGPUStatus && !webGPUStatus.supported && (
          <Card className="mb-6 bg-gray-900 border-red-500/20">
            <CardHeader>
              <CardTitle className="text-red-400 flex items-center gap-2 text-base">
                <span>⚠️</span>
                <span>WebGPU Not Supported</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400 text-sm mb-3">{webGPUStatus.error}</p>
              <p className="text-xs text-gray-500">
                This application requires WebGPU for AI inference. Please use Chrome/Edge 113+ or enable WebGPU in experimental features.
              </p>
            </CardContent>
          </Card>
        )}

                {/* Main Layout: Goals (Left) + Emulator (Center) + Stream (Right) */}
                {webGPUStatus?.supported && (
                  <div className="flex gap-4 h-[calc(100vh-100px)]">
            {/* Left: Agent Goals (20% width) */}
            <div className="flex-[1] h-full">
              <AgentGoals />
            </div>

                    {/* Center: Emulator + Controller (50% width) */}
                    <div className="flex-[2.5] h-full flex flex-col gap-4">
              <Card className="bg-black border-gray-900 flex-1 flex flex-col">
                <CardHeader className="pb-3 border-b border-gray-900">
                  <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-300">
                    <span className="text-base">🎮</span>
                    <span>Pokémon Ruby</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex items-center justify-center p-6">
                  <GBAEmulator />
                </CardContent>
              </Card>
              
              {/* Controller Display */}
              <GBAController />
            </div>

            {/* Right: Agent Stream Panel (30% width) */}
            <div className="flex-[1.5] h-full">
              <AgentStreamPanel 
                isActive={false}
                scratchpad="Analyzing game state... Player is in starting area. Need to navigate to first town. Checking available paths and obstacles..."
              />
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App

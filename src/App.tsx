import { useEffect, useState } from 'react'
import { checkWebGPUSupport, getRecommendedBrowser, type WebGPUCheckResult } from './lib/webgpu-check'
import GBAEmulator from './components/GBAEmulator'

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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex items-center justify-center p-4">
      <div className="max-w-3xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold mb-3 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            PocketAgent
          </h1>
          <p className="text-gray-400 text-xl">AI-Powered Pokémon Ruby Agent</p>
          <p className="text-gray-500 text-sm mt-2">Running 100% in your browser with WebGPU</p>
        </div>
        
        {/* System Status Card */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 mb-6 border border-gray-700 shadow-2xl">
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
            <span className="text-blue-400">⚡</span> System Status
          </h2>
          
          <div className="space-y-3">
            {/* WebGPU Status */}
            <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-gray-700">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{isChecking ? '⏳' : webGPUStatus?.supported ? '✅' : '❌'}</span>
                <span className="font-medium text-lg">WebGPU Support</span>
              </div>
              {isChecking ? (
                <span className="text-yellow-400 animate-pulse">Checking...</span>
              ) : webGPUStatus?.supported ? (
                <span className="text-green-400 font-semibold">Available</span>
              ) : (
                <span className="text-red-400 font-semibold">Not Available</span>
              )}
            </div>
            
            {/* Build Status */}
            <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-gray-700">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🚀</span>
                <span className="font-medium text-lg">Dev Server</span>
              </div>
              <span className="text-green-400 font-semibold">Running</span>
            </div>
          </div>
          
          {webGPUStatus && !webGPUStatus.supported && (
            <div className="mt-4 p-4 bg-red-900/30 border border-red-500 rounded text-left">
              <p className="font-semibold text-red-400 mb-2">❌ Not Supported</p>
              <p className="text-sm text-gray-300 mb-2">{webGPUStatus.error}</p>
              {webGPUStatus.warning && (
                <p className="text-sm text-yellow-300 mb-2 mt-2 border-t border-red-700 pt-2">
                  <strong>Why:</strong> {webGPUStatus.warning}
                </p>
              )}
              <p className="text-sm text-gray-400 mt-2">{getRecommendedBrowser()}</p>
            </div>
          )}
          
          {webGPUStatus?.supported && !webGPUStatus.warning && (
            <div className="mt-6 p-5 bg-gradient-to-br from-green-900/40 to-emerald-900/30 border-2 border-green-500/50 rounded-xl">
              <div className="flex items-start gap-3 mb-3">
                <span className="text-3xl">✅</span>
                <div>
                  <p className="font-bold text-green-300 text-xl mb-1">WebGPU Supported</p>
                  <p className="text-sm text-gray-300">
                    Hardware acceleration available
                  </p>
                </div>
              </div>
              
              {webGPUStatus.deviceInfo && (
                <div className="mt-4 bg-gray-900/60 rounded-lg p-4 border border-green-500/30">
                  <h3 className="text-sm font-semibold text-green-400 mb-3 uppercase tracking-wide">GPU Details</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="col-span-2 p-2 bg-gray-800/50 rounded">
                      <span className="text-gray-400 text-xs">GPU</span>
                      <div className="font-mono text-white font-semibold mt-1 uppercase">
                        {webGPUStatus.deviceInfo.vendor} {webGPUStatus.deviceInfo.architecture}
                      </div>
                    </div>
                    <div className="p-2 bg-gray-800/50 rounded">
                      <span className="text-gray-400 text-xs">Max Buffer</span>
                      <div className="font-mono text-green-400 font-bold mt-1">
                        {(webGPUStatus.deviceInfo.maxBufferSize / 1024 / 1024 / 1024).toFixed(2)} GB
                      </div>
                    </div>
                    <div className="p-2 bg-gray-800/50 rounded">
                      <span className="text-gray-400 text-xs">Max Storage</span>
                      <div className="font-mono text-green-400 font-bold mt-1">
                        {(webGPUStatus.deviceInfo.maxStorageBufferBindingSize / 1024 / 1024).toFixed(0)} MB
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {webGPUStatus?.supported && webGPUStatus.warning && (
            <div className="mt-6 p-5 bg-gradient-to-br from-yellow-900/40 to-orange-900/30 border-2 border-yellow-500/50 rounded-xl">
              <div className="flex items-start gap-3 mb-3">
                <span className="text-3xl">⚠️</span>
                <div>
                  <p className="font-bold text-yellow-300 text-xl mb-1">WebGPU Supported</p>
                  <p className="text-sm text-yellow-100">{webGPUStatus.warning}</p>
                </div>
              </div>
              
              {webGPUStatus.deviceInfo && (
                <div className="mt-4 bg-gray-900/60 rounded-lg p-4 border border-yellow-500/30">
                  <h3 className="text-sm font-semibold text-yellow-400 mb-3 uppercase tracking-wide">GPU Details</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="col-span-2 p-2 bg-gray-800/50 rounded">
                      <span className="text-gray-400 text-xs">GPU</span>
                      <div className="font-mono text-white font-semibold mt-1 uppercase">
                        {webGPUStatus.deviceInfo.vendor} {webGPUStatus.deviceInfo.architecture}
                      </div>
                    </div>
                    <div className="p-2 bg-gray-800/50 rounded">
                      <span className="text-gray-400 text-xs">Max Buffer</span>
                      <div className="font-mono text-yellow-400 font-bold mt-1">
                        {(webGPUStatus.deviceInfo.maxBufferSize / 1024 / 1024 / 1024).toFixed(2)} GB
                      </div>
                    </div>
                    <div className="p-2 bg-gray-800/50 rounded">
                      <span className="text-gray-400 text-xs">Max Storage</span>
                      <div className="font-mono text-yellow-400 font-bold mt-1">
                        {(webGPUStatus.deviceInfo.maxStorageBufferBindingSize / 1024 / 1024).toFixed(0)} MB
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Emulator Test */}
        {webGPUStatus?.supported && (
          <div className="mt-6 bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 shadow-2xl">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <span className="text-purple-400">🎮</span> GBA Emulator Test
            </h2>
            <GBAEmulator />
          </div>
        )}
        
        {/* Footer */}
        <div className="text-center text-sm text-gray-500 mt-6 p-4 bg-gray-900/30 rounded-lg border border-gray-800">
          <p className="mb-2 flex items-center justify-center gap-2">
            <span className="text-blue-400">🔧</span>
            <span>Testing: Emulator Integration</span>
          </p>
          <p className="text-gray-600">
            Deploy target: <span className="text-blue-400 font-mono">pocketagent.vercel.app</span>
          </p>
        </div>
      </div>
    </div>
  )
}

export default App

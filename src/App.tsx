import { useEffect, useState } from 'react'
import { checkWebGPUSupport, getRecommendedBrowser, type WebGPUCheckResult } from './lib/webgpu-check'

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
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        <h1 className="text-5xl font-bold mb-4">PocketAgent</h1>
        <p className="text-gray-400 text-lg mb-8">AI-Powered Pokemon Ruby Agent</p>
        
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">System Status</h2>
          
          <div className="space-y-3">
            {/* WebGPU Status */}
            <div className="flex items-center justify-between p-3 bg-gray-700 rounded">
              <span className="font-medium">WebGPU Support:</span>
              {isChecking ? (
                <span className="text-yellow-400">Checking...</span>
              ) : webGPUStatus?.supported ? (
                <span className="text-green-400">✓ Available</span>
              ) : (
                <span className="text-red-400">✗ Not Available</span>
              )}
            </div>
            
            {/* Build Status */}
            <div className="flex items-center justify-between p-3 bg-gray-700 rounded">
              <span className="font-medium">Build Status:</span>
              <span className="text-green-400">✓ Running</span>
            </div>
          </div>
          
          {webGPUStatus && !webGPUStatus.supported && (
            <div className="mt-4 p-4 bg-red-900/30 border border-red-500 rounded text-left">
              <p className="font-semibold text-red-400 mb-2">WebGPU Not Supported</p>
              <p className="text-sm text-gray-300 mb-2">{webGPUStatus.error}</p>
              <p className="text-sm text-gray-400">{getRecommendedBrowser()}</p>
            </div>
          )}
          
          {webGPUStatus?.supported && (
            <div className="mt-4 p-4 bg-green-900/30 border border-green-500 rounded text-left">
              <p className="font-semibold text-green-400 mb-2">✓ Ready for AI Inference</p>
              <p className="text-sm text-gray-300">
                Your browser supports WebGPU. The LLM will be able to run locally on your GPU.
              </p>
            </div>
          )}
        </div>
        
        <div className="text-sm text-gray-500">
          <p className="mb-2">Next steps: Emulator integration + LLM agent</p>
          <p>Deployment target: pocketagent.vercel.app</p>
        </div>
      </div>
    </div>
  )
}

export default App

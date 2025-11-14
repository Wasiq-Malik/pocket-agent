import { Badge } from '@/components/ui/badge';
import { type WebGPUCheckResult } from '@/lib/webgpu-check';

interface NavbarProps {
  webGPUStatus: WebGPUCheckResult | null;
  isChecking: boolean;
}

export default function Navbar({ webGPUStatus, isChecking }: NavbarProps) {
  return (
    <nav className="border-b border-gray-900 bg-black sticky top-0 z-50 backdrop-blur-sm">
      <div className="container mx-auto px-6 h-12 flex items-center justify-between">
        {/* Logo/Title */}
        <div className="flex items-center gap-2.5">
          <span className="text-base">🎮</span>
          <h1 className="text-sm font-medium text-gray-300">PocketAgent</h1>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center gap-4">
          {/* WebGPU Status */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-gray-600 uppercase tracking-wider">WebGPU</span>
            {isChecking ? (
              <Badge variant="outline" className="bg-transparent border-gray-800 text-gray-500 text-[11px] h-5 px-2">
                Checking
              </Badge>
            ) : webGPUStatus?.supported ? (
              <Badge className="bg-transparent text-green-500 border border-green-500/30 text-[11px] h-5 px-2 hover:bg-green-500/5">
                <span className="flex items-center gap-1.5">
                  <span className="w-1 h-1 bg-green-500 rounded-full"></span>
                  Active
                </span>
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-transparent text-red-500 border-red-500/30 text-[11px] h-5 px-2">
                Offline
              </Badge>
            )}
          </div>

          {/* GPU Info */}
          {webGPUStatus?.supported && webGPUStatus.deviceInfo && (
            <div className="hidden lg:flex items-center gap-2 text-[11px] text-gray-600 border-l border-gray-900 pl-4">
              <span className="font-mono uppercase tracking-wide">
                {webGPUStatus.deviceInfo.vendor} {webGPUStatus.deviceInfo.architecture}
              </span>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}


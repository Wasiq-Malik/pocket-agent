import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useState, useRef, useEffect } from 'react';
import { useEmulator } from '@/contexts/EmulatorContext';
import { AgentController, type AgentStep } from '@/lib/AgentController';

interface AgentStreamPanelProps {
  modelId?: string;
}

export default function AgentStreamPanel({ }: AgentStreamPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { gba } = useEmulator();

  const [steps, setSteps] = useState<AgentStep[]>([]);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const controllerRef = useRef<AgentController | null>(null);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [steps]);

  // Initialize Controller
  useEffect(() => {
    if (gba && !controllerRef.current) {
      controllerRef.current = new AgentController(gba, (step) => {
        setSteps(prev => [...prev, step]);
      });
    }
  }, [gba]);

  const toggleAutoPlay = () => {
    if (!controllerRef.current) return;

    if (isAutoPlaying) {
      controllerRef.current.stop();
      setIsAutoPlaying(false);
    } else {
      controllerRef.current.start();
      setIsAutoPlaying(true);
    }
  };

  return (
    <Card className="h-full flex flex-col bg-black border-gray-900">
      <CardHeader className="pb-3 border-b border-gray-900">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2 text-gray-300">
            <span className="text-base">🧠</span>
            <span>Agent Loop</span>
          </CardTitle>
          <div className="flex gap-2">
            <Badge
              variant="outline"
              className={isAutoPlaying
                ? 'bg-green-500/10 text-green-500 border-green-500/20 text-xs cursor-pointer'
                : 'bg-gray-900 border-gray-700 text-gray-400 text-xs cursor-pointer'}
              onClick={toggleAutoPlay}
            >
              {isAutoPlaying ? 'Running' : 'Paused'}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-full">
          <div ref={scrollRef} className="p-4 space-y-4">
            {steps.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <span className="text-4xl mb-3">🤖</span>
                <p className="text-sm text-gray-400 font-medium">Agent Idle</p>
                <p className="text-xs text-gray-600 mt-2 max-w-xs">
                  Start the emulator and click "Paused" to enable Auto-Play.
                </p>
              </div>
            ) : (
              steps.map((step, idx) => (
                <div key={idx} className="border border-gray-800 rounded-lg p-3 bg-gray-950/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] text-gray-600 font-mono">
                      STEP {idx + 1}
                    </span>
                    <span className="text-[10px] text-gray-600">
                      {new Date(step.timestamp).toLocaleTimeString()}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {/* Observation */}
                    <div className="flex gap-2">
                      <span className="text-xs text-blue-400 font-bold min-w-[60px]">OBSERVE</span>
                      <span className="text-xs text-gray-300">{step.observation}</span>
                    </div>

                    {/* Thought */}
                    <div className="flex gap-2">
                      <span className="text-xs text-purple-400 font-bold min-w-[60px]">THINK</span>
                      <span className="text-xs text-gray-400 italic">{step.thought}</span>
                    </div>

                    {/* Action */}
                    <div className="flex gap-2 items-center">
                      <span className="text-xs text-green-400 font-bold min-w-[60px]">ACT</span>
                      <Badge variant="outline" className="bg-green-900/20 text-green-400 border-green-900/50 text-[10px] h-5">
                        {step.action}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}


import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useState } from 'react';

interface StreamMessage {
  timestamp: string;
  type: 'thinking' | 'action' | 'observation';
  content: string;
}

interface AgentStreamPanelProps {
  isActive?: boolean;
  messages?: StreamMessage[];
  scratchpad?: string;
}

export default function AgentStreamPanel({ isActive = false, messages = [], scratchpad }: AgentStreamPanelProps) {
  const [showScratchpad, setShowScratchpad] = useState(true);
  // Placeholder messages for UI demo
  const demoMessages: StreamMessage[] = messages.length > 0 ? messages : [
    {
      timestamp: '00:00:00',
      type: 'thinking',
      content: 'Analyzing game state... Player is at starting position in Littleroot Town.',
    },
    {
      timestamp: '00:00:03',
      type: 'action',
      content: 'Pressing START to open menu',
    },
    {
      timestamp: '00:00:05',
      type: 'observation',
      content: 'Menu opened successfully. Checking available options.',
    },
  ];

  return (
    <Card className="h-full flex flex-col bg-black border-gray-900">
      <CardHeader className="pb-3 border-b border-gray-900">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2 text-gray-300">
            <span className="text-base">🤖</span>
            <span>Stream</span>
          </CardTitle>
          <Badge 
            variant="outline" 
            className={isActive 
              ? 'bg-green-500/10 text-green-500 border-green-500/20 text-xs' 
              : 'bg-gray-900 border-gray-700 text-gray-400 text-xs'}
          >
            {isActive ? (
              <span className="flex items-center gap-1.5">
                <span className="w-1 h-1 bg-green-500 rounded-full"></span>
                Active
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
                Inactive
              </span>
            )}
          </Badge>
        </div>
        <CardDescription className="text-gray-600 text-xs mt-0.5">
          Live reasoning
        </CardDescription>
      </CardHeader>
      <Separator className="bg-gray-900" />
      
      {/* Scratchpad Section */}
      {scratchpad && (
        <>
          <div className="p-3 border-b border-gray-900">
            <button
              onClick={() => setShowScratchpad(!showScratchpad)}
              className="w-full flex items-center justify-between text-left hover:bg-gray-950 p-2 rounded-md transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-400">💭 Scratchpad</span>
                <Badge variant="outline" className="bg-transparent text-blue-500 border-blue-500/20 text-[10px] h-4 px-1.5">
                  Reasoning
                </Badge>
              </div>
              <span className="text-gray-600 text-xs">{showScratchpad ? '▼' : '▶'}</span>
            </button>
            
            {showScratchpad && (
              <div className="mt-2 p-2.5 bg-gray-950/80 rounded-md border border-gray-900">
                <ScrollArea className="max-h-28">
                  <p className="text-[11px] text-gray-500 leading-relaxed whitespace-pre-wrap font-mono">
                    {scratchpad}
                  </p>
                </ScrollArea>
              </div>
            )}
          </div>
          <Separator className="bg-gray-900" />
        </>
      )}
      
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-full p-4">
          {!isActive && messages.length === 0 && !scratchpad ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <span className="text-4xl mb-3">🤖</span>
              <p className="text-sm text-gray-400 font-medium">Agent not started yet</p>
              <p className="text-xs text-gray-600 mt-2 max-w-xs">
                The AI will stream its thoughts and actions here in real-time
              </p>
            </div>
                  ) : (
                    <div className="space-y-2">
                      {demoMessages.map((msg, idx) => (
                        <div key={idx} className="text-sm hover:bg-gray-950 p-2.5 rounded-md transition-colors">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-[10px] text-gray-700 font-mono">{msg.timestamp}</span>
                            <Badge
                              variant="outline"
                              className={`text-[10px] h-4 px-1.5 ${
                                msg.type === 'thinking'
                                  ? 'border-blue-500/20 text-blue-500 bg-transparent'
                                  : msg.type === 'action'
                                  ? 'border-green-500/20 text-green-500 bg-transparent'
                                  : 'border-gray-800 text-gray-500 bg-transparent'
                              }`}
                            >
                              {msg.type === 'thinking' ? '💭' : msg.type === 'action' ? '⚡' : '👁️'} {msg.type}
                            </Badge>
                          </div>
                          <p className="text-gray-400 pl-2.5 border-l border-gray-900 leading-relaxed text-xs">
                            {msg.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}


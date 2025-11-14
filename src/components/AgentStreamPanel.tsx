import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useState, useRef, useEffect } from 'react';
import { useLLMWorker } from '@/hooks/useLLMWorker';
import { useEmulator } from '@/contexts/EmulatorContext';

interface AgentStreamPanelProps {
  modelId?: string;
}

export default function AgentStreamPanel({ modelId = 'DeepSeek-R1-Distill-Llama-8B-q4f32_1-MLC' }: AgentStreamPanelProps) {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { isLoading, isReady, progress, error, messages, isGenerating, loadModel, sendMessage, resetChat } = useLLMWorker();
  const { setIsFocused } = useEmulator();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isGenerating) {
      sendMessage(input.trim());
      setInput('');
    }
  };

  const handleLoadModel = () => {
    loadModel(modelId);
  };

  const handleInputFocus = () => {
    setIsFocused(false);
  };

  return (
    <Card className="h-full flex flex-col bg-black border-gray-900">
      <CardHeader className="pb-3 border-b border-gray-900">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2 text-gray-300">
            <span className="text-base">🤖</span>
            <span>LLM Chat</span>
          </CardTitle>
          <Badge 
            variant="outline" 
            className={isReady 
              ? 'bg-green-500/10 text-green-500 border-green-500/20 text-xs' 
              : isLoading
              ? 'bg-blue-500/10 text-blue-500 border-blue-500/20 text-xs'
              : 'bg-gray-900 border-gray-700 text-gray-400 text-xs'}
          >
            {isReady ? (
              <span className="flex items-center gap-1.5">
                <span className="w-1 h-1 bg-green-500 rounded-full"></span>
                Ready
              </span>
            ) : isLoading ? (
              <span className="flex items-center gap-1.5">
                <span className="w-1 h-1 bg-blue-500 rounded-full animate-pulse"></span>
                Loading
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
                Offline
              </span>
            )}
          </Badge>
        </div>
        <CardDescription className="text-gray-600 text-xs mt-0.5">
          Test {modelId}
        </CardDescription>
      </CardHeader>
      <Separator className="bg-gray-900" />
      
      {/* Loading/Progress Section */}
      {isLoading && progress && (
        <>
          <div className="p-3 border-b border-gray-900">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">{progress.text}</span>
                <span className="text-xs text-gray-600">{Math.round(progress.progress * 100)}%</span>
              </div>
              <div className="w-full bg-gray-900 rounded-full h-1.5">
                <div 
                  className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${progress.progress * 100}%` }}
                />
              </div>
            </div>
          </div>
          <Separator className="bg-gray-900" />
        </>
      )}

      {/* Error Section */}
      {error && (
        <>
          <div className="p-3 border-b border-gray-900 bg-red-500/5">
            <p className="text-xs text-red-400">{error}</p>
          </div>
          <Separator className="bg-gray-900" />
        </>
      )}
      
      {/* Messages Section */}
      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-full">
          <div ref={scrollRef} className="p-4 space-y-3">
            {!isReady && !isLoading ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <span className="text-4xl mb-3">🤖</span>
                <p className="text-sm text-gray-400 font-medium mb-3">Model not loaded</p>
                <button
                  onClick={handleLoadModel}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-md transition-colors"
                >
                  Load {modelId}
                </button>
                <p className="text-xs text-gray-600 mt-3 max-w-xs">
                  This will download ~5GB. First load may take several minutes.
                </p>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <span className="text-4xl mb-3">💬</span>
                <p className="text-sm text-gray-400 font-medium">Ready to chat</p>
                <p className="text-xs text-gray-600 mt-2 max-w-xs">
                  Send a message to test the LLM
                </p>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg p-3 ${
                      msg.role === 'user'
                        ? 'bg-blue-500/10 border border-blue-500/20'
                        : 'bg-gray-950 border border-gray-900'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-gray-400">
                        {msg.role === 'user' ? 'You' : 'Assistant'}
                      </span>
                      <span className="text-[10px] text-gray-700">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    
                    {/* Thinking section - show immediately when <think> appears */}
                    {(msg.thinking || msg.isThinking) && (
                      <ThinkingSection 
                        thinking={msg.thinking || ''} 
                        isStreaming={msg.isThinking && !msg.thinking}
                      />
                    )}
                    
                    {/* Main content */}
                    {msg.content && (
                      <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-wrap">
                        {msg.content}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>

      {/* Input Section */}
      {isReady && (
        <>
          <Separator className="bg-gray-900" />
          <div className="p-3">
            <form onSubmit={handleSubmit} className="flex gap-2">
                      <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onFocus={handleInputFocus}
                        placeholder="Type a message..."
                        disabled={isGenerating}
                        className="flex-1 bg-gray-950 border border-gray-900 rounded-md px-3 py-2 text-xs text-gray-300 placeholder-gray-600 focus:outline-none focus:border-gray-700 disabled:opacity-50"
                      />
              <button
                type="submit"
                disabled={isGenerating || !input.trim()}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-900 disabled:text-gray-600 text-white text-xs rounded-md transition-colors"
              >
                {isGenerating ? '...' : 'Send'}
              </button>
            </form>
            {messages.length > 0 && (
              <button
                onClick={resetChat}
                className="mt-2 text-xs text-gray-600 hover:text-gray-400 transition-colors"
              >
                Clear chat
              </button>
            )}
          </div>
        </>
      )}
    </Card>
  );
}

// Thinking section component - inspired by Cursor
function ThinkingSection({ thinking, isStreaming }: { thinking: string; isStreaming?: boolean }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [userCollapsed, setUserCollapsed] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-expand when thinking starts (unless user manually collapsed it)
  useEffect(() => {
    if ((thinking || isStreaming) && !userCollapsed) {
      setIsExpanded(true);
    }
  }, [thinking, isStreaming, userCollapsed]);

  // Auto-scroll to bottom as thinking content streams
  useEffect(() => {
    if (isExpanded && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [thinking, isExpanded]);

  const handleToggle = () => {
    const newExpandedState = !isExpanded;
    setIsExpanded(newExpandedState);
    
    // Track if user manually collapsed it
    if (!newExpandedState) {
      setUserCollapsed(true);
    } else {
      setUserCollapsed(false);
    }
  };

  return (
    <div className="mb-2 border border-purple-500/20 rounded-md overflow-hidden bg-purple-500/5">
      <button
        onClick={handleToggle}
        className="w-full flex items-center justify-between p-2 hover:bg-purple-500/10 transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          <span className="text-purple-400 text-xs">💭</span>
          <span className="text-xs font-medium text-purple-400">
            Thinking{isStreaming && '...'}
          </span>
        </div>
        <span className="text-purple-500 text-xs">{isExpanded ? '▼' : '▶'}</span>
      </button>
      
      {isExpanded && (
        <div className="border-t border-purple-500/20 bg-purple-950/20">
          <div ref={scrollRef} className="max-h-48 overflow-y-auto">
            <p className="text-[11px] text-purple-300/80 leading-relaxed p-3 whitespace-pre-wrap font-mono">
              {thinking || (isStreaming && 'Generating thoughts...')}
              {isStreaming && <span className="animate-pulse">▊</span>}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}


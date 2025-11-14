import { useEffect, useRef, useState, useCallback } from 'react';

interface ProgressUpdate {
  progress: number;
  text: string;
}

// Parse thinking tags from content - handles streaming/incomplete tags
function parseThinkingTags(text: string): { thinking: string; content: string; isThinking: boolean } {
  let thinking = '';
  let content = text;
  let isThinking = false;

  // Check if we have an opening <think> tag
  if (text.includes('<think>')) {
    isThinking = true;
    
    // Check if thinking is complete (has closing tag)
    if (text.includes('</think>')) {
      // Complete thinking sections - extract all
      const thinkRegex = /<think>([\s\S]*?)<\/think>/g;
      const matches = text.match(thinkRegex);
      
      if (matches) {
        // Combine all thinking sections
        thinking = matches
          .map(match => {
            const inner = match.replace(/<\/?think>/g, '');
            return inner.trim();
          })
          .join('\n\n');
        
        // Remove thinking tags from content
        content = text.replace(thinkRegex, '').trim();
      }
    } else {
      // Incomplete thinking - extract what we have so far
      const thinkStart = text.indexOf('<think>');
      thinking = text.substring(thinkStart + 7).trim(); // +7 for '<think>' length
      content = ''; // No content yet while thinking
    }
  }

  return { thinking, content, isThinking };
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  thinking?: string; // Extracted thinking content
  isThinking?: boolean; // Currently in thinking mode
  timestamp: number;
}

export function useLLMWorker() {
  const workerRef = useRef<Worker | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [progress, setProgress] = useState<ProgressUpdate | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    // Create worker
    workerRef.current = new Worker(new URL('../workers/llm.worker.ts', import.meta.url), {
      type: 'module',
    });

    // Handle messages from worker
    workerRef.current.onmessage = (event) => {
      const { type } = event.data;

      switch (type) {
        case 'progress':
          setProgress({
            progress: event.data.progress,
            text: event.data.text,
          });
          break;

        case 'ready':
          setIsLoading(false);
          setIsReady(true);
          setProgress(null);
          break;

        case 'stream':
          if (event.data.isDone) {
            setIsGenerating(false);
            setMessages((prev) => {
              const newMessages = [...prev];
              const lastMessage = newMessages[newMessages.length - 1];
              if (lastMessage && lastMessage.role === 'assistant') {
                // Parse thinking tags from final content
                const { thinking, content, isThinking } = parseThinkingTags(event.data.content);
                lastMessage.thinking = thinking;
                lastMessage.content = content;
                lastMessage.isThinking = isThinking;
              }
              return newMessages;
            });
          } else {
            setMessages((prev) => {
              const newMessages = [...prev];
              const lastMessage = newMessages[newMessages.length - 1];
              if (lastMessage && lastMessage.role === 'assistant') {
                // Parse thinking tags during streaming
                const { thinking, content, isThinking } = parseThinkingTags(event.data.content);
                lastMessage.thinking = thinking;
                lastMessage.content = content;
                lastMessage.isThinking = isThinking;
                return [...newMessages];
              } else {
                const { thinking, content, isThinking } = parseThinkingTags(event.data.content);
                return [
                  ...prev,
                  {
                    role: 'assistant' as const,
                    content,
                    thinking,
                    isThinking,
                    timestamp: Date.now(),
                  },
                ];
              }
            });
          }
          break;

        case 'error':
          setError(event.data.error);
          setIsLoading(false);
          setIsGenerating(false);
          break;
      }
    };

    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const loadModel = useCallback((modelId: string) => {
    setIsLoading(true);
    setError(null);
    workerRef.current?.postMessage({ type: 'load', modelId });
  }, []);

  const sendMessage = useCallback((content: string) => {
    if (!isReady || isGenerating) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsGenerating(true);
    setError(null);

    workerRef.current?.postMessage({
      type: 'chat',
      prompt: content,
      temperature: 0.7,
    });
  }, [isReady, isGenerating]);

  const resetChat = useCallback(() => {
    setMessages([]);
    workerRef.current?.postMessage({ type: 'reset' });
  }, []);

  return {
    isLoading,
    isReady,
    progress,
    error,
    messages,
    isGenerating,
    loadModel,
    sendMessage,
    resetChat,
  };
}


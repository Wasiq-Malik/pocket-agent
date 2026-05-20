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
  screenshotUrl?: string; // Base64 screenshot URL if any
  thinking?: string; // Extracted thinking content
  isThinking?: boolean; // Currently in thinking mode
  timestamp: number;
}

const POKEMON_AGENT_SYSTEM_PROMPT = `You are PocketAgent, an advanced AI gaming agent playing Pokémon FireRed on a GBA emulator via WebGPU.

Your goal is to autonomously explore, battle, train Pokémon, and defeat Gym Leaders. You are direct, analytical, and highly structured.
Keep your final output extremely brief, focused, and action-oriented. Do NOT write verbose introductory or concluding statements (e.g., "I can't physically play the game"). Keep chat interactions short and direct.
You are the player agent physically executing moves in the game. You are the AI controller.`;

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
          setMessages([
            {
              role: 'assistant',
              content: 'PocketAgent v1.0.0 Online.\nWebGPU compute engine loaded successfully. Memory mapping hooks established.\n\nReady to play Pokémon. Send a command to begin.',
              timestamp: Date.now(),
            }
          ]);
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
    setMessages([]);
    workerRef.current?.postMessage({ type: 'load', modelId });
  }, []);

  const sendMessage = useCallback((content: string, screenshotUrl?: string) => {
    if (!isReady || isGenerating) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content,
      screenshotUrl,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsGenerating(true);
    setError(null);

    // Reconstruct full conversation history for WebLLM
    // We restore <think> blocks for assistant answers so reasoning models maintain their mental state.
    const history = messages.map((msg) => {
      if (msg.role === 'assistant') {
        let reconstructedContent = '';
        if (msg.thinking) {
          reconstructedContent += `<think>\n${msg.thinking}\n</think>\n`;
        }
        reconstructedContent += msg.content;
        return { role: 'assistant' as const, content: reconstructedContent };
      }
      
      if (msg.screenshotUrl) {
        return {
          role: 'user' as const,
          content: [
            { type: 'text' as const, text: msg.content },
            { type: 'image_url' as const, image_url: { url: msg.screenshotUrl } }
          ]
        };
      }
      return { role: 'user' as const, content: msg.content };
    });

    const systemMessage = {
      role: 'system' as const,
      content: POKEMON_AGENT_SYSTEM_PROMPT,
    };

    const nextMessageContent = screenshotUrl 
      ? [
          { type: 'text' as const, text: content },
          { type: 'image_url' as const, image_url: { url: screenshotUrl } }
        ]
      : content;

    const allMessages = [
      systemMessage, 
      ...history, 
      { role: 'user' as const, content: nextMessageContent }
    ];

    workerRef.current?.postMessage({
      type: 'chat',
      messages: allMessages,
      temperature: 0.6,
      top_p: 0.95,
      max_tokens: 2048,
    });
  }, [isReady, isGenerating, messages]);

  const resetChat = useCallback(() => {
    setMessages([
      {
        role: 'assistant',
        content: 'PocketAgent v1.0.0 Online.\nWebGPU compute engine loaded successfully. Memory mapping hooks established.\n\nReady to play Pokémon. Send a command to begin.',
        timestamp: Date.now(),
      }
    ]);
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


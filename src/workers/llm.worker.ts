import { CreateMLCEngine, MLCEngine, prebuiltAppConfig } from '@mlc-ai/web-llm';

let engine: MLCEngine | null = null;

type ChatCompletionMessageContentPart = 
  | { type: 'text'; text: string }
  | { type: 'image_url'; image_url: { url: string } };

interface ChatCompletionMessage {
  role: 'user' | 'assistant' | 'system';
  content: string | ChatCompletionMessageContentPart[];
}

interface LoadModelMessage {
  type: 'load';
  modelId: string;
}

interface ChatMessage {
  type: 'chat';
  messages: ChatCompletionMessage[];
  temperature?: number;
  top_p?: number;
  max_tokens?: number;
}

interface ResetMessage {
  type: 'reset';
}

type WorkerMessage = LoadModelMessage | ChatMessage | ResetMessage;

// Message types to main thread
interface ProgressUpdate {
  type: 'progress';
  progress: number;
  text: string;
}

interface ReadyMessage {
  type: 'ready';
}

interface StreamMessage {
  type: 'stream';
  content: string;
  isDone: boolean;
}

interface ErrorMessage {
  type: 'error';
  error: string;
}

type MainThreadMessage = ProgressUpdate | ReadyMessage | StreamMessage | ErrorMessage;

function postMessage(message: MainThreadMessage) {
  self.postMessage(message);
}

// Initialize engine with progress tracking
async function loadModel(modelId: string) {
  try {
    postMessage({ type: 'progress', progress: 0, text: 'Initializing WebLLM...' });

    // Use the model ID directly - WebLLM will use prebuiltAppConfig passed explicitly
    engine = await CreateMLCEngine(modelId, {
      appConfig: prebuiltAppConfig,
      initProgressCallback: (progress) => {
        postMessage({
          type: 'progress',
          progress: progress.progress,
          text: progress.text,
        });
      },
    });

    postMessage({ type: 'ready' });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Failed to load model';
    console.error('Model loading error:', errorMsg);
    postMessage({
      type: 'error',
      error: errorMsg + ' - Check console for available models',
    });
  }
}

// Generate chat response with streaming
async function chat(
  messages: ChatCompletionMessage[],
  temperature = 0.6,
  top_p = 0.95,
  max_tokens = 2048
) {
  if (!engine) {
    postMessage({ type: 'error', error: 'Model not loaded' });
    return;
  }

  try {
    const stream = await engine.chat.completions.create({
      messages: messages as any,
      temperature,
      top_p,
      max_tokens,
      stream: true,
    });

    let fullContent = '';

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        fullContent += content;
        postMessage({
          type: 'stream',
          content: fullContent,
          isDone: false,
        });
      }
    }

    postMessage({
      type: 'stream',
      content: fullContent,
      isDone: true,
    });
  } catch (error) {
    postMessage({
      type: 'error',
      error: error instanceof Error ? error.message : 'Chat failed',
    });
  }
}

// Handle messages from main thread
self.addEventListener('message', async (event: MessageEvent<WorkerMessage>) => {
  const { type } = event.data;

  switch (type) {
    case 'load':
      await loadModel(event.data.modelId);
      break;

    case 'chat':
      await chat(
        event.data.messages,
        event.data.temperature,
        event.data.top_p,
        event.data.max_tokens
      );
      break;

    case 'reset':
      if (engine) {
        await engine.resetChat();
      }
      break;

    default:
      console.warn('Unknown message type:', type);
  }
});


import { CreateMLCEngine, MLCEngine } from '@mlc-ai/web-llm';

let engine: MLCEngine | null = null;

// Message types from main thread
interface LoadModelMessage {
  type: 'load';
  modelId: string;
}

interface ChatMessage {
  type: 'chat';
  prompt: string;
  temperature?: number;
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

    // Use the model ID directly - WebLLM will use prebuiltAppConfig
    engine = await CreateMLCEngine(modelId, {
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
async function chat(prompt: string, temperature = 0.7) {
  if (!engine) {
    postMessage({ type: 'error', error: 'Model not loaded' });
    return;
  }

  try {
    const stream = await engine.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      temperature,
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
      await chat(event.data.prompt, event.data.temperature);
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


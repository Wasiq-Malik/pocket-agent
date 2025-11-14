// Common WebLLM model IDs
// These are from the prebuiltAppConfig in @mlc-ai/web-llm
// Full list: https://github.com/mlc-ai/web-llm/issues/683

export const WEBLLM_MODELS = {
  // DeepSeek-R1 Distilled models (reasoning capabilities)
  DEEPSEEK_R1_LLAMA_8B_Q4: 'DeepSeek-R1-Distill-Llama-8B-q4f32_1-MLC',
  DEEPSEEK_R1_LLAMA_8B_Q4F16: 'DeepSeek-R1-Distill-Llama-8B-q4f16_1-MLC',
  DEEPSEEK_R1_QWEN_7B_Q4: 'DeepSeek-R1-Distill-Qwen-7B-q4f32_1-MLC',
  DEEPSEEK_R1_QWEN_7B_Q4F16: 'DeepSeek-R1-Distill-Qwen-7B-q4f16_1-MLC',
  
  // Llama 3.1 models (recommended for general use)
  LLAMA_3_1_8B_Q4: 'Llama-3.1-8B-Instruct-q4f32_1-MLC',
  LLAMA_3_1_8B_Q4F16: 'Llama-3.1-8B-Instruct-q4f16_1-MLC',
  
  // Llama 3 models
  LLAMA_3_8B_Q4: 'Llama-3-8B-Instruct-q4f32_1-MLC',
  LLAMA_3_8B_Q4F16: 'Llama-3-8B-Instruct-q4f16_1-MLC',
  
  // Smaller models (faster, less capable)
  PHI_3_MINI: 'Phi-3-mini-4k-instruct-q4f16_1-MLC',
  QWEN_2_1_5B: 'Qwen2-1.5B-Instruct-q4f16_1-MLC',
  GEMMA_2B: 'gemma-2b-it-q4f16_1-MLC',
  
  // Mistral models
  MISTRAL_7B: 'Mistral-7B-Instruct-v0.3-q4f16_1-MLC',
} as const;

export type WebLLMModelId = typeof WEBLLM_MODELS[keyof typeof WEBLLM_MODELS];

// Model info for UI display
export const MODEL_INFO: Record<WebLLMModelId, { name: string; size: string; vram: string }> = {
  'DeepSeek-R1-Distill-Llama-8B-q4f32_1-MLC': {
    name: 'DeepSeek-R1 Llama 8B (Q4)',
    size: '~4.8GB',
    vram: '~6.1GB',
  },
  'DeepSeek-R1-Distill-Llama-8B-q4f16_1-MLC': {
    name: 'DeepSeek-R1 Llama 8B (Q4F16)',
    size: '~4.3GB',
    vram: '~5GB',
  },
  'DeepSeek-R1-Distill-Qwen-7B-q4f32_1-MLC': {
    name: 'DeepSeek-R1 Qwen 7B (Q4)',
    size: '~4.7GB',
    vram: '~5.9GB',
  },
  'DeepSeek-R1-Distill-Qwen-7B-q4f16_1-MLC': {
    name: 'DeepSeek-R1 Qwen 7B (Q4F16)',
    size: '~4.2GB',
    vram: '~5.1GB',
  },
  'Llama-3.1-8B-Instruct-q4f32_1-MLC': {
    name: 'Llama 3.1 8B (Q4)',
    size: '~4.5GB',
    vram: '~6.1GB',
  },
  'Llama-3.1-8B-Instruct-q4f16_1-MLC': {
    name: 'Llama 3.1 8B (Q4F16)',
    size: '~4.0GB',
    vram: '~5GB',
  },
  'Llama-3-8B-Instruct-q4f32_1-MLC': {
    name: 'Llama 3 8B (Q4)',
    size: '~4.5GB',
    vram: '~6.1GB',
  },
  'Llama-3-8B-Instruct-q4f16_1-MLC': {
    name: 'Llama 3 8B (Q4F16)',
    size: '~4.0GB',
    vram: '~5GB',
  },
  'Phi-3-mini-4k-instruct-q4f16_1-MLC': {
    name: 'Phi 3 Mini',
    size: '~2.2GB',
    vram: '~3.7GB',
  },
  'Qwen2-1.5B-Instruct-q4f16_1-MLC': {
    name: 'Qwen2 1.5B',
    size: '~0.9GB',
    vram: '~1.6GB',
  },
  'gemma-2b-it-q4f16_1-MLC': {
    name: 'Gemma 2B',
    size: '~1.4GB',
    vram: '~1.5GB',
  },
  'Mistral-7B-Instruct-v0.3-q4f16_1-MLC': {
    name: 'Mistral 7B',
    size: '~4.1GB',
    vram: '~4.5GB',
  },
};


// Curated list of Qwen 3.5 models supported by WebLLM v0.2.83
// Optimized specifically for modern GPUs and Apple Silicon (FP16).

export const WEBLLM_MODELS = {
  QWEN_3_5_0_8B_FP16: 'Qwen3.5-0.8B-q4f16_1-MLC',
  QWEN_3_5_2B_FP16: 'Qwen3.5-2B-q4f16_1-MLC',
  QWEN_3_5_4B_FP16: 'Qwen3.5-4B-q4f16_1-MLC',
  QWEN_3_5_9B_FP16: 'Qwen3.5-9B-q4f16_1-MLC',
} as const;

export type WebLLMModelId = typeof WEBLLM_MODELS[keyof typeof WEBLLM_MODELS];

export interface ModelMetadata {
  name: string;
  size: string;
  vram: string;
  family: string;
  hardwareTier: 'Low VRAM' | 'Medium VRAM' | 'High VRAM';
  compatibility: string;
  description: string;
}

// Model info for UI display
export const MODEL_INFO: Record<WebLLMModelId, ModelMetadata> = {
  'Qwen3.5-0.8B-q4f16_1-MLC': {
    name: 'Qwen 3.5 0.8B Instruct (Micro)',
    size: '~0.6GB',
    vram: '~0.9GB',
    family: 'Qwen 3.5',
    hardwareTier: 'Low VRAM',
    compatibility: 'Apple Silicon FP16 Optimized',
    description: 'Ultra-small model optimized for instant loads and maximum frame rates. Ideal for fast gameplay testing loops.',
  },
  'Qwen3.5-2B-q4f16_1-MLC': {
    name: 'Qwen 3.5 2B Instruct (Small)',
    size: '~1.3GB',
    vram: '~2.0GB',
    family: 'Qwen 3.5',
    hardwareTier: 'Low VRAM',
    compatibility: 'Apple Silicon FP16 Optimized',
    description: 'Extremely fast Qwen 3.5 model. Supports native thinking mode with low latency. Perfect for quick logic iterations.',
  },
  'Qwen3.5-4B-q4f16_1-MLC': {
    name: 'Qwen 3.5 4B Instruct (Medium)',
    size: '~2.5GB',
    vram: '~3.5GB',
    family: 'Qwen 3.5',
    hardwareTier: 'Medium VRAM',
    compatibility: 'Apple Silicon FP16 Optimized',
    description: 'Alibaba\'s new highly efficient reasoning model. Great logical progression without the heavy VRAM load of 9B.',
  },
  'Qwen3.5-9B-q4f16_1-MLC': {
    name: 'Qwen 3.5 9B Instruct (Large)',
    size: '~5.1GB',
    vram: '~6.3GB',
    family: 'Qwen 3.5',
    hardwareTier: 'High VRAM',
    compatibility: 'Apple Silicon FP16 Optimized',
    description: 'Large dense reasoning model. Offers highest intelligence and complex agentic planning capabilities for gameplay.',
  },
};

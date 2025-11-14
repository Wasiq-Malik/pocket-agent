export interface WebGPUCheckResult {
  supported: boolean;
  error?: string;
  adapter?: GPUAdapter;
}

export async function checkWebGPUSupport(): Promise<WebGPUCheckResult> {
  // Check if navigator.gpu exists
  if (!navigator.gpu) {
    return {
      supported: false,
      error: "WebGPU is not supported in this browser. Please use Chrome 113+ or Edge 113+.",
    };
  }

  try {
    // Request GPU adapter
    const adapter = await navigator.gpu.requestAdapter();
    
    if (!adapter) {
      return {
        supported: false,
        error: "No WebGPU adapter found. Your GPU may not be compatible or drivers need updating.",
      };
    }

    return {
      supported: true,
      adapter,
    };
  } catch (error) {
    return {
      supported: false,
      error: `WebGPU initialization failed: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

export function getRecommendedBrowser(): string {
  const userAgent = navigator.userAgent.toLowerCase();
  
  if (userAgent.includes('chrome') || userAgent.includes('chromium')) {
    return "Please update to Chrome 113 or later.";
  }
  
  if (userAgent.includes('edge') || userAgent.includes('edg/')) {
    return "Please update to Edge 113 or later.";
  }
  
  return "Please use Chrome 113+ or Edge 113+ for WebGPU support.";
}


export interface WebGPUCheckResult {
  supported: boolean;
  error?: string;
  warning?: string;
  adapter?: GPUAdapter;
  deviceInfo?: {
    vendor: string;
    architecture: string;
    device: string;
    description: string;
    maxBufferSize: number;
    maxStorageBufferBindingSize: number;
    maxComputeWorkgroupStorageSize: number;
  };
}

function getDeviceType(): 'desktop' | 'mobile' | 'unknown' {
  const userAgent = navigator.userAgent.toLowerCase();
  const mobileKeywords = ['android', 'webos', 'iphone', 'ipad', 'ipod', 'blackberry', 'windows phone'];
  const isMobile = mobileKeywords.some(keyword => userAgent.includes(keyword));
  return isMobile ? 'mobile' : 'desktop';
}

function isIOSDevice(): boolean {
  const userAgent = navigator.userAgent.toLowerCase();
  return userAgent.includes('iphone') || userAgent.includes('ipad') || userAgent.includes('ipod');
}

export async function checkWebGPUSupport(): Promise<WebGPUCheckResult> {
  // Step 1: Check if WebGPU API exists
  if (!navigator.gpu) {
    const deviceType = getDeviceType();
    const isIOS = isIOSDevice();
    
    let error = "WebGPU is not supported in this browser.";
    let warning: string | undefined;
    
    if (isIOS) {
      error = "WebGPU is not enabled on this iOS device.";
      warning = "iOS/Safari requires WebGPU to be manually enabled: Settings → Safari → Advanced → Experimental Features → Toggle 'WebGPU' ON. Requires iOS 17+.";
    } else if (deviceType === 'mobile') {
      warning = "For Android devices, you need Chrome 121+ on Android 12+ with a Qualcomm or ARM GPU.";
    } else {
      warning = "Please use Chrome 113+, Edge 113+, or Safari 18+ on desktop.";
    }
    
    return {
      supported: false,
      error,
      warning,
    };
  }

  try {
    // Step 2: Request GPU adapter
    const adapter = await navigator.gpu.requestAdapter();
    
    if (!adapter) {
      return {
        supported: false,
        error: "No WebGPU adapter found. Your GPU may not be compatible.",
        warning: "Your device's GPU doesn't support WebGPU, or drivers need updating.",
      };
    }

    // Step 3: Try to request a device to confirm full WebGPU support
    let device: GPUDevice | null = null;
    try {
      device = await adapter.requestDevice();
      if (!device) {
        return {
          supported: false,
          error: "Unable to create WebGPU device.",
          warning: "WebGPU adapter found but couldn't create a device. The GPU may be in use or have insufficient resources.",
        };
      }
      // Clean up the test device immediately
      device.destroy();
    } catch (deviceError) {
      return {
        supported: false,
        error: "Failed to create WebGPU device.",
        warning: `Device creation failed: ${deviceError instanceof Error ? deviceError.message : String(deviceError)}`,
      };
    }

    // Step 4: Check adapter info and limits
    const adapterInfo = adapter.info || { vendor: 'unknown', architecture: 'unknown', device: 'unknown', description: 'unknown' };
    const limits = adapter.limits;
    
    const deviceInfo = {
      vendor: adapterInfo.vendor,
      architecture: adapterInfo.architecture,
      device: adapterInfo.device || 'unknown',
      description: adapterInfo.description || 'unknown',
      maxBufferSize: limits.maxBufferSize,
      maxStorageBufferBindingSize: limits.maxStorageBufferBindingSize,
      maxComputeWorkgroupStorageSize: limits.maxComputeWorkgroupStorageSize,
    };

    // Step 5: Assess if the GPU can handle LLM workloads
    // Modern desktop GPUs typically have 2GB+ buffer sizes
    // Mobile/integrated GPUs might have 256MB-1GB
    const bufferSizeGB = limits.maxBufferSize / (1024 * 1024 * 1024);
    
    let warning: string | undefined;
    const deviceType = getDeviceType();
    
    // Warn if buffer size is less than 1GB (typical for mobile/integrated GPUs)
    if (bufferSizeGB < 1) {
      warning = `⚠️ Limited GPU Memory: Your GPU has ${bufferSizeGB.toFixed(2)}GB max buffer size. ` +
                `The 5GB AI model (DeepSeek-R1-Distill-Llama-8B) may not load or run very slowly. ` +
                `Consider using a desktop GPU with 12GB+ VRAM for optimal performance.`;
    } 
    // Inform mobile users even if they have decent specs
    else if (deviceType === 'mobile' && bufferSizeGB < 2) {
      warning = `📱 Mobile Device: Your device has ${bufferSizeGB.toFixed(2)}GB GPU buffer. ` +
                `While WebGPU is supported, the 5GB model may struggle on mobile hardware. ` +
                `Model loading could take 5-10 minutes and inference may be slow. Desktop recommended for best experience.`;
    }

    return {
      supported: true,
      adapter,
      warning,
      deviceInfo,
    };
  } catch (error) {
    return {
      supported: false,
      error: `WebGPU check failed: ${error instanceof Error ? error.message : String(error)}`,
      warning: "An unexpected error occurred while checking WebGPU support.",
    };
  }
}

export function getRecommendedBrowser(): string {
  const userAgent = navigator.userAgent.toLowerCase();
  const isIOS = isIOSDevice();
  
  if (isIOS) {
    return "iOS: Enable WebGPU in Settings → Safari → Advanced → Experimental Features (iOS 17+ required)";
  }
  
  if (userAgent.includes('android')) {
    return "Android: Use Chrome 121+ on Android 12+ with Qualcomm/ARM GPU";
  }
  
  if (userAgent.includes('chrome') || userAgent.includes('chromium')) {
    return "Update to Chrome 113 or later.";
  }
  
  if (userAgent.includes('edge') || userAgent.includes('edg/')) {
    return "Update to Edge 113 or later.";
  }
  
  if (userAgent.includes('safari')) {
    return "Use Safari 18+ or switch to Chrome 113+.";
  }
  
  return "Use Chrome 113+, Edge 113+, or Safari 18+ for WebGPU support.";
}

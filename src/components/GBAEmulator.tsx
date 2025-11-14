import { useEffect, useRef, useState } from 'react';
import mGBA from '@thenick775/mgba-wasm';
import { KEYBOARD_MAPPING } from '@/lib/emulator-types';
import { useEmulator } from '@/contexts/EmulatorContext';

interface GBAEmulatorProps {
  romPath?: string;
}

export default function GBAEmulator({ romPath = '/test-roms/Pokemon - Ruby Version (U) (V1.1).gba' }: GBAEmulatorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { emulator, setEmulator, isPlaying, setIsPlaying, isFocused, setIsFocused } = useEmulator();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize emulator
  useEffect(() => {
    const initEmulator = async () => {
      if (!canvasRef.current) return;

      try {
        const module = await mGBA({ canvas: canvasRef.current });
        await module.FSInit();
        setEmulator(module);
      } catch (err) {
        console.error('Failed to initialize emulator:', err);
        setError(`Initialization failed: ${err instanceof Error ? err.message : String(err)}`);
        setIsLoading(false);
      }
    };

    initEmulator();

    return () => {
      if (emulator) {
        try {
          emulator.quitMgba();
        } catch (err) {
          console.warn('Error during cleanup:', err);
        }
      }
    };
  }, []);

  // Load ROM
  useEffect(() => {
    const loadROM = async () => {
      if (!emulator || !romPath) return;

      try {
        setIsLoading(true);
        
        const response = await fetch(romPath);
        if (!response.ok) {
          throw new Error(`Failed to fetch ROM: ${response.status} ${response.statusText}`);
        }
        
        const romData = await response.arrayBuffer();
        const romFile = new File([romData], 'pokemon-ruby.gba', { type: 'application/octet-stream' });
        
        await new Promise<void>((resolve) => {
          emulator.uploadRom(romFile, () => resolve());
        });
        
        const gamePath = emulator.filePaths().gamePath + '/pokemon-ruby.gba';
        const loaded = emulator.loadGame(gamePath);
        
        if (loaded) {
          setIsPlaying(true);
          setError(null);
        } else {
          throw new Error('Failed to load game');
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to load ROM:', err);
        setError(`Failed to load ROM: ${err instanceof Error ? err.message : String(err)}`);
        setIsLoading(false);
      }
    };

    if (emulator) {
      loadROM();
    }
  }, [emulator, romPath]);

  // Custom keyboard controls with our mapping
  useEffect(() => {
    if (!emulator || !isPlaying) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Always block if we're in an input field
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      // Block ALL keyboard events from reaching SDL when unfocused
      if (!isFocused) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return;
      }

      // Handle our custom button mapping when focused
      const button = KEYBOARD_MAPPING[e.key];
      if (button) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        emulator.buttonPress(button);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      // Always block if we're in an input field
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      // Block ALL keyboard events from reaching SDL when unfocused
      if (!isFocused) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return;
      }

      // Handle our custom button mapping when focused
      const button = KEYBOARD_MAPPING[e.key];
      if (button) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        emulator.buttonUnpress(button);
      }
    };

    // Use capture phase to intercept BEFORE SDL handlers
    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('keyup', handleKeyUp, true);

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('keyup', handleKeyUp, true);
    };
  }, [emulator, isPlaying, isFocused]);

  // Additional safeguard: disable SDL input when unfocused
  useEffect(() => {
    if (!emulator || !isPlaying) return;
    emulator.toggleInput(isFocused);
  }, [emulator, isPlaying, isFocused]);

  // Handle container click to focus emulator
  const handleContainerClick = () => {
    setIsFocused(true);
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  };

  return (
    <div 
      ref={containerRef}
      className="flex flex-col items-center justify-center gap-4 w-full h-full"
      onClick={handleContainerClick}
    >
      <div 
        className="relative bg-black rounded-lg overflow-hidden shadow-2xl border-4 border-gray-800" 
        style={{ width: '100%', maxWidth: '1200px' }}
      >
        <canvas
          ref={canvasRef}
          width={240}
          height={160}
          style={{ 
            imageRendering: 'pixelated',
            width: '100%',
            height: 'auto',
            aspectRatio: '3/2',
            display: 'block'
          }}
        />
        
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4 mx-auto"></div>
              <p className="text-white">Loading emulator...</p>
            </div>
          </div>
        )}
        
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/90 p-4">
            <div className="text-center max-w-md">
              <p className="text-red-400 font-semibold mb-2">❌ Error</p>
              <p className="text-white text-sm">{error}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


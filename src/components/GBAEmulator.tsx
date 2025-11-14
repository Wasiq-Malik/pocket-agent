import { useEffect, useRef, useState } from 'react';
import mGBA, { type mGBAEmulator } from '@thenick775/mgba-wasm';
import { KEYBOARD_MAPPING } from '@/lib/emulator-types';

interface GBAEmulatorProps {
  romPath?: string;
}

export default function GBAEmulator({ romPath = '/test-roms/Pokemon - Ruby Version (U) (V1.1).gba' }: GBAEmulatorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [emulator, setEmulator] = useState<mGBAEmulator | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Initialize emulator
  useEffect(() => {
    const initEmulator = async () => {
      if (!canvasRef.current) return;

      try {
        console.log('Initializing mGBA...');
        const module = await mGBA({ canvas: canvasRef.current });
        
        console.log('mGBA version:', module.version.projectName, module.version.projectVersion);
        
        // Initialize filesystem
        await module.FSInit();
        console.log('Filesystem initialized');
        
        setEmulator(module);
      } catch (err) {
        console.error('Failed to initialize emulator:', err);
        setError(`Initialization failed: ${err instanceof Error ? err.message : String(err)}`);
        setIsLoading(false);
      }
    };

    initEmulator();

    return () => {
      // Cleanup
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
        console.log('Fetching ROM from:', romPath);
        
        const response = await fetch(romPath);
        if (!response.ok) {
          throw new Error(`Failed to fetch ROM: ${response.status} ${response.statusText}`);
        }
        
        const romData = await response.arrayBuffer();
        console.log('ROM loaded, size:', romData.byteLength, 'bytes');
        
        // Create a File object from the ROM data
        const romFile = new File([romData], 'pokemon-ruby.gba', { type: 'application/octet-stream' });
        
        // Upload ROM to emulator filesystem
        await new Promise<void>((resolve) => {
          emulator.uploadRom(romFile, () => {
            console.log('ROM uploaded to emulator filesystem');
            resolve();
          });
        });
        
        // Load the game
        const gamePath = emulator.filePaths().gamePath + '/pokemon-ruby.gba';
        console.log('Loading game from:', gamePath);
        
        const loaded = emulator.loadGame(gamePath);
        
        if (loaded) {
          console.log('✅ Game loaded successfully!');
          setIsPlaying(true);
          setError(null);
        } else {
          throw new Error('loadGame returned false');
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

  // Keyboard controls
  useEffect(() => {
    if (!emulator || !isPlaying) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const button = KEYBOARD_MAPPING[e.key];
      if (button) {
        e.preventDefault();
        emulator.buttonPress(button);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const button = KEYBOARD_MAPPING[e.key];
      if (button) {
        e.preventDefault();
        emulator.buttonUnpress(button);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [emulator, isPlaying]);

  return (
    <div className="flex flex-col items-center justify-center gap-4 w-full h-full">
      <div className="relative bg-black rounded-lg overflow-hidden shadow-2xl border-4 border-gray-700" style={{ width: '100%', maxWidth: '1200px' }}>
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


import { useEffect, useRef, useState } from 'react';
// @ts-ignore - gbajs doesn't have types
import GBA from 'gbajs';
import { KEYBOARD_MAPPING } from '@/lib/emulator-types';
import { useEmulator } from '@/contexts/EmulatorContext';

interface GBAEmulatorProps {
  romPath?: string;
}
export default function GBAEmulator({ romPath = '/test-roms/Pkmn FireRed v1.0 (Cleaned).gba' }: GBAEmulatorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { gba, setGba, isPlaying, setIsPlaying, isFocused, setIsFocused } = useEmulator();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize emulator
  useEffect(() => {
    if (!canvasRef.current) return;

    try {
      const canvas = canvasRef.current;
      const gbaInstance = new GBA();
      gbaInstance.setCanvas(canvas);

      // Enable audio and resume context on user interaction
      const resumeAudio = () => {
        if (gbaInstance.audio && gbaInstance.audio.context) {
          gbaInstance.audio.context.resume();
        }
      };
      canvas.addEventListener('click', resumeAudio, { once: true });

      setGba(gbaInstance);
    } catch (err) {
      console.error('Failed to initialize emulator:', err);
      setError(`Initialization failed: ${err instanceof Error ? err.message : String(err)}`);
      setIsLoading(false);
    }

    return () => {
      // Cleanup if needed
    };
  }, []);

  // Load ROM
  useEffect(() => {
    const loadROM = async () => {
      if (!gba || !romPath) return;

      try {
        setIsLoading(true);

        const [romResponse, biosResponse] = await Promise.all([
          fetch(romPath),
          fetch('/test-roms/bios.bin')
        ]);

        if (!romResponse.ok) {
          throw new Error(`Failed to fetch ROM: ${romResponse.status} ${romResponse.statusText}`);
        }
        if (!biosResponse.ok) {
          console.warn('Failed to fetch BIOS, attempting to run without it.');
        } else {
          const biosData = await biosResponse.arrayBuffer();
          gba.setBios(biosData);
        }

        const romData = await romResponse.arrayBuffer();

        const romLoaded = gba.setRom(romData);

        if (!romLoaded) {
          throw new Error('Failed to set ROM - invalid ROM data');
        }

        gba.runStable();

        setIsPlaying(true);
        setError(null);
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to load ROM:', err);
        setError(`Failed to load ROM: ${err instanceof Error ? err.message : String(err)}`);
        setIsLoading(false);
      }
    };

    if (gba) {
      loadROM();
    }
  }, [gba, romPath]);

  // Custom keyboard controls
  useEffect(() => {
    if (!gba || !isPlaying) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Always block if we're in an input field
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      if (!isFocused) return;

      const button = KEYBOARD_MAPPING[e.key];
      if (button) {
        e.preventDefault();
        gba.keypad.press(gba.keypad[button]);
      }
    };

    // We need to implement the key up handler properly
    const handleKeyUpActual = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;
      if (!isFocused) return;

      const button = KEYBOARD_MAPPING[e.key];
      if (button) {
        e.preventDefault();
        // @ts-ignore
        if (gba.keypad && typeof gba.keypad.release === 'function') {
          // @ts-ignore
          gba.keypad.release(gba.keypad[button]);
        }
      }
    }

    // Actually, gbajs might not have a release method exposed like that.
    // Let's check if we can just use the default controls or if we need to hook into it.
    // Most JS emulators allow `emulator.keypad.press(index)` and `emulator.keypad.release(index)`.
    // The indices are usually: A=0, B=1, SELECT=2, START=3, RIGHT=4, LEFT=5, UP=6, DOWN=7, R=8, L=9.

    // Let's stick to the previous implementation logic but adapted.
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUpActual);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUpActual);
    };
  }, [gba, isPlaying, isFocused]);

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
      >
        <canvas
          ref={canvasRef}
          width={240}
          height={160}
          style={{
            imageRendering: 'pixelated',
            width: '240px',
            height: '160px',
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

      <div className="text-xs text-gray-500">
        Controls: Arrows (Move), Z (A), X (B), Enter (Start), Shift (Select)
      </div>
    </div>
  );
}


import type { mGBAEmulator } from '@thenick775/mgba-wasm';

export type { mGBAEmulator };

// GBA button names that mgba-wasm recognizes
export const GBA_BUTTONS = {
  A: 'a',
  B: 'b',
  START: 'start',
  SELECT: 'select',
  UP: 'up',
  DOWN: 'down',
  LEFT: 'left',
  RIGHT: 'right',
  L: 'l',
  R: 'r',
} as const;

export type GBAButton = typeof GBA_BUTTONS[keyof typeof GBA_BUTTONS];

// Keyboard to GBA button mapping
export const KEYBOARD_MAPPING: Record<string, GBAButton> = {
  'z': GBA_BUTTONS.A,
  'x': GBA_BUTTONS.B,
  'Enter': GBA_BUTTONS.START,
  'Shift': GBA_BUTTONS.SELECT,
  'ArrowUp': GBA_BUTTONS.UP,
  'ArrowDown': GBA_BUTTONS.DOWN,
  'ArrowLeft': GBA_BUTTONS.LEFT,
  'ArrowRight': GBA_BUTTONS.RIGHT,
  'a': GBA_BUTTONS.L,
  's': GBA_BUTTONS.R,
};

// Memory reading utilities (Emscripten memory access)
export interface MemoryReader {
  read8(address: number): number;
  read16(address: number): number;
  read32(address: number): number;
}

export function createMemoryReader(emulator: mGBAEmulator): MemoryReader {
  // Access Emscripten's heap through the emulator instance
  // The HEAPU8 is available on the emulator object but not typed
  const heap = (emulator as any).HEAPU8 as Uint8Array;
  
  return {
    read8(address: number): number {
      // GBA memory starts at a specific offset in Emscripten's HEAP
      // We'll need to find the correct offset or use mGBA's internal methods
      // For now, accessing HEAPU8 directly
      return heap?.[address] || 0;
    },
    read16(address: number): number {
      // Read 16-bit little-endian
      const byte1 = heap?.[address] || 0;
      const byte2 = heap?.[address + 1] || 0;
      return byte1 | (byte2 << 8);
    },
    read32(address: number): number {
      // Read 32-bit little-endian
      const byte1 = heap?.[address] || 0;
      const byte2 = heap?.[address + 1] || 0;
      const byte3 = heap?.[address + 2] || 0;
      const byte4 = heap?.[address + 3] || 0;
      return byte1 | (byte2 << 8) | (byte3 << 16) | (byte4 << 24);
    },
  };
}



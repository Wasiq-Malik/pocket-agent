import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { mGBAEmulator } from '@thenick775/mgba-wasm';

interface EmulatorContextType {
  emulator: mGBAEmulator | null;
  setEmulator: (emulator: mGBAEmulator | null) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  isFocused: boolean;
  setIsFocused: (focused: boolean) => void;
  canvasElement: HTMLCanvasElement | null;
  setCanvasElement: (canvas: HTMLCanvasElement | null) => void;
}

const EmulatorContext = createContext<EmulatorContextType | null>(null);

export function EmulatorProvider({ children }: { children: ReactNode }) {
  const [emulator, setEmulator] = useState<mGBAEmulator | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFocused, setIsFocused] = useState(true); // Start focused on emulator
  const [canvasElement, setCanvasElement] = useState<HTMLCanvasElement | null>(null);

  return (
    <EmulatorContext.Provider value={{ 
      emulator, 
      setEmulator, 
      isPlaying, 
      setIsPlaying, 
      isFocused, 
      setIsFocused,
      canvasElement,
      setCanvasElement
    }}>
      {children}
    </EmulatorContext.Provider>
  );
}

export function useEmulator() {
  const context = useContext(EmulatorContext);
  if (!context) {
    throw new Error('useEmulator must be used within EmulatorProvider');
  }
  return context;
}


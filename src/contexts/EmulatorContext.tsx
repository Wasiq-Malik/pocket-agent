import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface EmulatorContextType {
  gba: any | null;
  setGba: (gba: any | null) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  isFocused: boolean;
  setIsFocused: (focused: boolean) => void;
}

const EmulatorContext = createContext<EmulatorContextType | null>(null);

export function EmulatorProvider({ children }: { children: ReactNode }) {
  const [gba, setGba] = useState<any | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFocused, setIsFocused] = useState(true); // Start focused on emulator

  return (
    <EmulatorContext.Provider value={{ gba, setGba, isPlaying, setIsPlaying, isFocused, setIsFocused }}>
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


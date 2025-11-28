import { useEmulator } from '@/contexts/EmulatorContext';
import { GBA_BUTTONS } from '@/lib/emulator-types';

export default function GBAController() {
  const { gba, isPlaying, setIsFocused } = useEmulator();

  const handleButtonPress = (button: string) => {
    if (gba && isPlaying && gba.keypad) {
      setIsFocused(true); // Focus emulator when using controller
      const keyId = gba.keypad[button];
      if (keyId !== undefined) {
        gba.keypad.keydown(keyId);
      }
    }
  };

  const handleButtonRelease = (button: string) => {
    if (gba && isPlaying && gba.keypad) {
      const keyId = gba.keypad[button];
      if (keyId !== undefined) {
        gba.keypad.keyup(keyId);
      }
    }
  };

  return (
    <div className="w-full px-2">
      {/* Keyboard Mappings Grid */}
      <div className="grid grid-cols-5 gap-1.5 lg:gap-2 max-w-2xl lg:max-w-3xl mx-auto p-3">
        {/* L/R Triggers (Moved to top) */}
        <div className="col-span-5 grid grid-cols-2 gap-1.5 lg:gap-2 mb-1 lg:mb-2">
          <div className="bg-gray-950/50 rounded-lg border border-gray-900 p-1.5 lg:p-2 flex items-center justify-center">
            <KeyButton keyLabel="A" gbaLabel="L" button={GBA_BUTTONS.L} onPress={handleButtonPress} onRelease={handleButtonRelease} />
          </div>
          <div className="bg-gray-950/50 rounded-lg border border-gray-900 p-1.5 lg:p-2 flex items-center justify-center">
            <KeyButton keyLabel="S" gbaLabel="R" button={GBA_BUTTONS.R} onPress={handleButtonPress} onRelease={handleButtonRelease} />
          </div>
        </div>

        {/* D-Pad Group */}
        <div className="col-span-2 bg-gray-950/50 rounded-lg border border-gray-900 p-2 lg:p-3">
          <div className="text-[9px] lg:text-[10px] text-gray-600 uppercase tracking-wider mb-1.5 lg:mb-2 text-center">D-Pad</div>
          <div className="grid grid-cols-3 gap-0.5 lg:gap-1">
            <div className="col-start-2">
              <KeyButton keyLabel="↑" gbaLabel="Up" button={GBA_BUTTONS.UP} onPress={handleButtonPress} onRelease={handleButtonRelease} />
            </div>
            <div className="col-start-1 row-start-2">
              <KeyButton keyLabel="←" gbaLabel="Left" button={GBA_BUTTONS.LEFT} onPress={handleButtonPress} onRelease={handleButtonRelease} />
            </div>
            <div className="col-start-3 row-start-2">
              <KeyButton keyLabel="→" gbaLabel="Right" button={GBA_BUTTONS.RIGHT} onPress={handleButtonPress} onRelease={handleButtonRelease} />
            </div>
            <div className="col-start-2 row-start-3">
              <KeyButton keyLabel="↓" gbaLabel="Down" button={GBA_BUTTONS.DOWN} onPress={handleButtonPress} onRelease={handleButtonRelease} />
            </div>
          </div>
          <div className="text-[8px] lg:text-[9px] text-gray-700 text-center mt-1.5 lg:mt-2">Arrow Keys</div>
        </div>

        {/* Center - Start/Select */}
        <div className="col-span-1 flex flex-col gap-1.5 lg:gap-2">
          <div className="flex-1 bg-gray-950/50 rounded-lg border border-gray-900 p-1.5 lg:p-2 flex flex-col items-center justify-center">
            <KeyButton keyLabel="Shift" gbaLabel="SELECT" button={GBA_BUTTONS.SELECT} onPress={handleButtonPress} onRelease={handleButtonRelease} compact />
          </div>
          <div className="flex-1 bg-gray-950/50 rounded-lg border border-gray-900 p-1.5 lg:p-2 flex flex-col items-center justify-center">
            <KeyButton keyLabel="Enter" gbaLabel="START" button={GBA_BUTTONS.START} onPress={handleButtonPress} onRelease={handleButtonRelease} compact />
          </div>
        </div>

        {/* A/B Buttons Group (Swapped positions - A on left, B on right) */}
        <div className="col-span-2 bg-gray-950/50 rounded-lg border border-gray-900 p-2 lg:p-3">
          <div className="text-[9px] lg:text-[10px] text-gray-600 uppercase tracking-wider mb-1.5 lg:mb-2 text-center">Action</div>
          <div className="grid grid-cols-3 gap-0.5 lg:gap-1">
            <div className="col-start-1 row-start-2">
              <KeyButton keyLabel="Z" gbaLabel="A" button={GBA_BUTTONS.A} onPress={handleButtonPress} onRelease={handleButtonRelease} accent="red" />
            </div>
            <div className="col-start-3 row-start-1">
              <KeyButton keyLabel="X" gbaLabel="B" button={GBA_BUTTONS.B} onPress={handleButtonPress} onRelease={handleButtonRelease} accent="red" />
            </div>
          </div>
          <div className="text-[8px] lg:text-[9px] text-gray-700 text-center mt-1.5 lg:mt-2">Z / X Keys</div>
        </div>
      </div>
    </div>
  );
}

interface KeyButtonProps {
  keyLabel: string;
  gbaLabel: string;
  button: string;
  onPress: (button: string) => void;
  onRelease: (button: string) => void;
  accent?: 'red' | 'blue';
  compact?: boolean;
}

function KeyButton({ keyLabel, gbaLabel, button, onPress, onRelease, accent, compact }: KeyButtonProps) {
  const accentColors = {
    red: 'border-red-500/30 bg-red-500/5 text-red-400 active:bg-red-500/20',
    blue: 'border-blue-500/30 bg-blue-500/5 text-blue-400 active:bg-blue-500/20',
  };

  const colorClass = accent
    ? accentColors[accent]
    : 'border-gray-800 bg-gray-900/50 text-gray-300 active:bg-gray-800';

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    onPress(button);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    e.preventDefault();
    onRelease(button);
  };

  const handlePointerLeave = (e: React.PointerEvent) => {
    e.preventDefault();
    onRelease(button);
  };

  if (compact) {
    return (
      <div className="flex flex-col items-center gap-0.5 lg:gap-1">
        <button
          className={`w-full px-1.5 py-1 lg:px-2 lg:py-1.5 rounded border ${colorClass} flex items-center justify-center transition-all hover:scale-105 touch-none select-none cursor-pointer`}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerLeave}
          type="button"
        >
          <span className="text-[9px] lg:text-[10px] font-semibold font-mono">{keyLabel}</span>
        </button>
        <span className="text-[7px] lg:text-[8px] text-gray-700">{gbaLabel}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-0.5 lg:gap-1">
      <button
        className={`w-10 h-10 lg:w-12 lg:h-12 rounded border ${colorClass} flex flex-col items-center justify-center transition-all hover:scale-105 touch-none select-none cursor-pointer`}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        type="button"
      >
        <span className="text-xs lg:text-sm font-bold font-mono">{keyLabel}</span>
        <span className="text-[7px] lg:text-[8px] text-gray-600 mt-0.5">{gbaLabel}</span>
      </button>
    </div>
  );
}



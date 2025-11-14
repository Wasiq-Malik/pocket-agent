export default function GBAController() {
  return (
    <div className="w-full">
      {/* Keyboard Mappings Grid */}
      <div className="grid grid-cols-5 gap-2 max-w-3xl mx-auto">
        {/* D-Pad Group */}
        <div className="col-span-2 bg-gray-950/50 rounded-lg border border-gray-900 p-3">
          <div className="text-[10px] text-gray-600 uppercase tracking-wider mb-2 text-center">D-Pad</div>
          <div className="grid grid-cols-3 gap-1">
            <div className="col-start-2">
              <KeyButton keyLabel="↑" gbaLabel="Up" />
            </div>
            <div className="col-start-1 row-start-2">
              <KeyButton keyLabel="←" gbaLabel="Left" />
            </div>
            <div className="col-start-3 row-start-2">
              <KeyButton keyLabel="→" gbaLabel="Right" />
            </div>
            <div className="col-start-2 row-start-3">
              <KeyButton keyLabel="↓" gbaLabel="Down" />
            </div>
          </div>
          <div className="text-[9px] text-gray-700 text-center mt-2">Arrow Keys</div>
        </div>

        {/* Center - Start/Select */}
        <div className="col-span-1 flex flex-col gap-2">
          <div className="flex-1 bg-gray-950/50 rounded-lg border border-gray-900 p-2 flex flex-col items-center justify-center">
            <KeyButton keyLabel="Shift" gbaLabel="SELECT" compact />
          </div>
          <div className="flex-1 bg-gray-950/50 rounded-lg border border-gray-900 p-2 flex flex-col items-center justify-center">
            <KeyButton keyLabel="Enter" gbaLabel="START" compact />
          </div>
        </div>

        {/* A/B Buttons Group */}
        <div className="col-span-2 bg-gray-950/50 rounded-lg border border-gray-900 p-3">
          <div className="text-[10px] text-gray-600 uppercase tracking-wider mb-2 text-center">Action</div>
          <div className="grid grid-cols-3 gap-1">
            <div className="col-start-1 row-start-2">
              <KeyButton keyLabel="X" gbaLabel="B" accent="red" />
            </div>
            <div className="col-start-3 row-start-1">
              <KeyButton keyLabel="Z" gbaLabel="A" accent="red" />
            </div>
          </div>
          <div className="text-[9px] text-gray-700 text-center mt-2">Z / X Keys</div>
        </div>

        {/* L/R Triggers */}
        <div className="col-span-5 grid grid-cols-2 gap-2">
          <div className="bg-gray-950/50 rounded-lg border border-gray-900 p-2 flex items-center justify-center">
            <KeyButton keyLabel="A" gbaLabel="L" />
          </div>
          <div className="bg-gray-950/50 rounded-lg border border-gray-900 p-2 flex items-center justify-center">
            <KeyButton keyLabel="S" gbaLabel="R" />
          </div>
        </div>
      </div>
    </div>
  );
}

interface KeyButtonProps {
  keyLabel: string;
  gbaLabel: string;
  accent?: 'red' | 'blue';
  compact?: boolean;
}

function KeyButton({ keyLabel, gbaLabel, accent, compact }: KeyButtonProps) {
  const accentColors = {
    red: 'border-red-500/30 bg-red-500/5 text-red-400',
    blue: 'border-blue-500/30 bg-blue-500/5 text-blue-400',
  };

  const colorClass = accent ? accentColors[accent] : 'border-gray-800 bg-gray-900/50 text-gray-300';

  if (compact) {
    return (
      <div className="flex flex-col items-center gap-1">
        <div className={`w-full px-2 py-1.5 rounded border ${colorClass} flex items-center justify-center transition-all hover:scale-105`}>
          <span className="text-[10px] font-semibold font-mono">{keyLabel}</span>
        </div>
        <span className="text-[8px] text-gray-700">{gbaLabel}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`w-12 h-12 rounded border ${colorClass} flex flex-col items-center justify-center transition-all hover:scale-105`}>
        <span className="text-sm font-bold font-mono">{keyLabel}</span>
        <span className="text-[8px] text-gray-600 mt-0.5">{gbaLabel}</span>
      </div>
    </div>
  );
}


import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEmulator } from '@/contexts/EmulatorContext';
import { PokemonRAMMapper, type GameState } from '@/lib/mappers/PokemonRAMMapper';

export default function GameStatePanel() {
    const { gba, isPlaying } = useEmulator();
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!gba || !isPlaying) return;

        const mapper = new PokemonRAMMapper(gba);

        const interval = setInterval(() => {
            try {
                const state = mapper.getGameState();
                setGameState(state);
                setError(null);
            } catch (err) {
                setError(err instanceof Error ? err.message : String(err));
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [gba, isPlaying]);

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="text-sm font-medium">Game State</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {error && (
                    <p className="text-xs text-red-500">{error}</p>
                )}
                {gameState ? (
                    <>
                        <div className="space-y-3">
                            {/* Player Info */}
                            <div className="space-y-1">
                                <div className="text-xs font-semibold text-gray-300 mb-1">Player</div>
                                <div className="text-xs ml-2 space-y-0.5">
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Name:</span>
                                        <span className="font-mono">{gameState.player.name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">ID:</span>
                                        <span className="font-mono">{gameState.player.trainerId.toString().padStart(5, '0')}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Gender:</span>
                                        <span className="font-mono">{gameState.player.gender === 0 ? 'Male ♂' : 'Female ♀'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Money:</span>
                                        <span className="font-mono">₽{gameState.player.money.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Location Info */}
                            <div className="space-y-1 border-t border-gray-800 pt-2">
                                <div className="text-xs font-semibold text-gray-300 mb-1">Location</div>
                                <div className="text-xs ml-2 space-y-0.5">
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Position:</span>
                                        <span className="font-mono">({gameState.player.x}, {gameState.player.y})</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Map:</span>
                                        <span className="font-mono">Bank {gameState.player.mapBank}, ID {gameState.player.mapId}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Party & Battle */}
                            <div className="space-y-1 border-t border-gray-800 pt-2">
                                <div className="text-xs font-semibold text-gray-300 mb-1">Party & Battle</div>
                                <div className="text-xs ml-2 space-y-0.5">
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Party Size:</span>
                                        <span className="font-mono">{gameState.partyCount} Pokémon</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">In Battle:</span>
                                        <span className={`font-mono ${gameState.inBattle ? 'text-red-400' : 'text-green-400'}`}>
                                            {gameState.inBattle ? '⚔️ Yes' : '✓ No'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <p className="text-[10px] text-gray-600 pt-2 border-t border-gray-800">
                            FireRed (USA) • BPRE
                        </p>
                    </>
                ) : (
                    <p className="text-xs text-gray-500">Start the game to see state...</p>
                )}
            </CardContent>
        </Card>
    );
}

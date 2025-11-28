import { PokemonRAMMapper, type GameState } from './mappers/PokemonRAMMapper';
import { GBA_BUTTONS } from './emulator-types';

export interface AgentStep {
    observation: string;
    thought: string;
    action: string;
    timestamp: number;
}

export class AgentController {
    private gba: any;
    private mapper: PokemonRAMMapper;
    private isRunning: boolean = false;
    private onStep: (step: AgentStep) => void;

    constructor(gba: any, onStep: (step: AgentStep) => void) {
        this.gba = gba;
        this.onStep = onStep;
        this.mapper = new PokemonRAMMapper(gba);
    }

    public start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.loop();
    }

    public stop() {
        this.isRunning = false;
    }

    private async loop() {
        while (this.isRunning) {
            try {
                // 1. Observe
                const state = this.mapper.getGameState();
                const observation = this.formatObservation(state);

                // 2. Think (Mock for now, will connect to LLM)
                // const _thought = await this._llmClient.chat(observation); 
                const _thought = "I am standing at " + state.player.x + "," + state.player.y + ". I should move around.";

                // 3. Act
                const action = this.decideAction(_thought);
                this.executeAction(action);

                // Log step
                this.onStep({
                    observation,
                    thought: _thought,
                    action,
                    timestamp: Date.now()
                });

                // Wait before next step
                await new Promise(resolve => setTimeout(resolve, 2000));
            } catch (err) {
                console.error('Agent loop error:', err);
                this.stop();
            }
        }
    }

    private formatObservation(state: GameState): string {
        return `Player at (${state.player.x}, ${state.player.y}) in Map ${state.player.mapBank}.${state.player.mapId}. Party size: ${state.partyCount}.`;
    }

    private decideAction(_thought: string): string {
        // Simple random walk for testing
        const moves = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
        return moves[Math.floor(Math.random() * moves.length)];
    }

    private executeAction(actionName: string) {
        // Map string to button
        const button = GBA_BUTTONS[actionName as keyof typeof GBA_BUTTONS];
        if (button && this.gba.keypad) {
            // Press
            this.gba.keypad.press(this.gba.keypad[button]);
            // Release after short delay
            setTimeout(() => {
                this.gba.keypad.release(this.gba.keypad[button]);
            }, 200);
        }
    }
}

import { MEMORY_OFFSETS } from './memory-offsets';

export interface GameState {
    player: {
        name: string;
        trainerId: number;
        gender: number;
        x: number;
        y: number;
        mapBank: number;
        mapId: number;
        money: number;
    };
    partyCount: number;
    party: any[];
    inBattle: boolean;
    timestamp: number;
}

export class PokemonRAMMapper {
    private gba: any;

    constructor(gba: any) {
        this.gba = gba;
    }

    public getGameState(): GameState {
        if (!this.gba || !this.gba.mmu) {
            throw new Error('GBA instance or MMU not available');
        }

        return {
            player: this.getPlayerInfo(),
            partyCount: this.getPartyCount(),
            party: [],
            inBattle: this.isInBattle(),
            timestamp: Date.now(),
        };
    }

    private getPlayerInfo() {
        const name = this.readPlayerName();
        const trainerId = this.readU16(MEMORY_OFFSETS.PLAYER_ID);
        const gender = this.readU8(MEMORY_OFFSETS.PLAYER_GENDER);
        const money = this.readU32(MEMORY_OFFSETS.MONEY);

        // Dynamic player position via pointer
        const saveBlock8Ptr = this.readU32(0x03005008);
        let x = 0, y = 0;
        if (saveBlock8Ptr !== 0 && saveBlock8Ptr !== 0xFFFFFFFF) {
            x = this.readU16(saveBlock8Ptr + 0x0000);
            y = this.readU16(saveBlock8Ptr + 0x0002);
        }

        const mapBank = this.readU8(MEMORY_OFFSETS.MAP_BANK);
        const mapId = this.readU8(MEMORY_OFFSETS.MAP_ID);

        return { name, trainerId, gender, x, y, mapBank, mapId, money };
    }

    private getPartyCount() {
        return this.readU8(MEMORY_OFFSETS.PARTY_COUNT);
    }

    private isInBattle(): boolean {
        const battleFlag = this.readU8(MEMORY_OFFSETS.IN_BATTLE);
        return battleFlag !== 0;
    }

    private readPlayerName(): string {
        let name = '';
        for (let i = 0; i < 7; i++) {
            const charCode = this.readU8(MEMORY_OFFSETS.PLAYER_NAME + i);
            if (charCode === 0xFF || charCode === 0x00) break;
            // Simple Gen3 character decoding
            if (charCode >= 0xBB && charCode <= 0xD4) {
                name += String.fromCharCode(charCode - 0xBB + 65); // A-Z
            } else if (charCode >= 0xD5 && charCode <= 0xEE) {
                name += String.fromCharCode(charCode - 0xD5 + 97); // a-z
            } else {
                name += '?';
            }
        }
        return name || 'Unknown';
    }

    private readU8(offset: number): number {
        const value = this.gba.mmu.loadU8(offset);
        console.log(`Read U8 at 0x${offset.toString(16).toUpperCase()}: ${value}`);
        return value;
    }

    private readU16(offset: number): number {
        const value = this.gba.mmu.loadU16(offset);
        console.log(`Read U16 at 0x${offset.toString(16).toUpperCase()}: ${value}`);
        return value;
    }

    private readU32(offset: number): number {
        const value = this.gba.mmu.load32(offset);
        console.log(`Read U32 pointer at 0x${offset.toString(16).toUpperCase()}: 0x${value.toString(16).toUpperCase()}`);
        return value >>> 0;
    }
}

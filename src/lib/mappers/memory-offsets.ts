// Memory Offsets for Pokemon FireRed (USA)
// Based on documented addresses from Claude Plays Pokemon and community resources
// ROM Code: BPRE (USA version)

export const MEMORY_OFFSETS = {
    // Static addresses (these don't change!)

    // Party Data - MOST RELIABLE
    PARTY_COUNT: 0x02024029,    // Number of Pokemon in party (1 byte)
    PARTY_DATA: 0x02024284,     // Start of party Pokemon data (600 bytes total, 100 per Pokemon)

    // Map Location - STATIC
    MAP_BANK: 0x02031DBC,       // Current map bank (1 byte)
    MAP_ID: 0x02031DBD,         // Current map number (1 byte)

    // Player Info - STATIC
    PLAYER_NAME: 0x02024734,    // Player name (7 bytes)
    PLAYER_ID: 0x0202473C,      // Trainer ID (2 bytes)
    PLAYER_GENDER: 0x02024808,  // 0 = Male, 1 = Female

    // Money - Obfuscated but readable
    MONEY: 0x020257BC,          // Money (4 bytes, XOR encrypted)

    // Dynamic addresses (need pointer dereferencing)
    // These are relative to pointers at 0x03005008, 0x0300500C, 0x03005010
    // For now, we'll use static ones that are more reliable

    // Player position - these work when not using DMA
    PLAYER_X_POS: 0x02030EE4,   // X coordinate (2 bytes) - alternative static location
    PLAYER_Y_POS: 0x02030EE6,   // Y coordinate (2 bytes) - alternative static location

    // Pokemon Structure (100 bytes per Pokemon in party)
    POKEMON_SIZE: 100,

    // Battle flags
    IN_BATTLE: 0x02022B4C,      // Non-zero if in battle
};

// Helper to decode Pokemon text (FireRed uses Gen 3 charset)
export const CHARMAP: Record<number, string> = {
    0x00: ' ', 0xFF: '', // Terminator
    0xA1: '0', 0xA2: '1', 0xA3: '2', 0xA4: '3', 0xA5: '4',
    0xA6: '5', 0xA7: '6', 0xA8: '7', 0xA9: '8', 0xAA: '9',
    0xBB: 'A', 0xBC: 'B', 0xBD: 'C', 0xBE: 'D', 0xBF: 'E',
    0xC0: 'F', 0xC1: 'G', 0xC2: 'H', 0xC3: 'I', 0xC4: 'J',
    0xC5: 'K', 0xC6: 'L', 0xC7: 'M', 0xC8: 'N', 0xC9: 'O',
    0xCA: 'P', 0xCB: 'Q', 0xCC: 'R', 0xCD: 'S', 0xCE: 'T',
    0xCF: 'U', 0xD0: 'V', 0xD1: 'W', 0xD2: 'X', 0xD3: 'Y', 0xD4: 'Z',
    0xD5: 'a', 0xD6: 'b', 0xD7: 'c', 0xD8: 'd', 0xD9: 'e',
    0xDA: 'f', 0xDB: 'g', 0xDC: 'h', 0xDD: 'i', 0xDE: 'j',
    0xDF: 'k', 0xE0: 'l', 0xE1: 'm', 0xE2: 'n', 0xE3: 'o',
    0xE4: 'p', 0xE5: 'q', 0xE6: 'r', 0xE7: 's', 0xE8: 't',
    0xE9: 'u', 0xEA: 'v', 0xEB: 'w', 0xEC: 'x', 0xED: 'y', 0xEE: 'z',
};

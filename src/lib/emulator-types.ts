// GBA button names
export const GBA_BUTTONS = {
  A: 'A',
  B: 'B',
  START: 'START',
  SELECT: 'SELECT',
  UP: 'UP',
  DOWN: 'DOWN',
  LEFT: 'LEFT',
  RIGHT: 'RIGHT',
  L: 'L',
  R: 'R',
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

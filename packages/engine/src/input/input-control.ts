export enum KeyboardKey {
  W = "KeyW",
  A = "KeyA",
  S = "KeyS",
  D = "KeyD",
}

export enum MouseButton {
  Primary = 0,
  Secondary = 2,
}

export type InputControl = KeyboardKey | MouseButton;
